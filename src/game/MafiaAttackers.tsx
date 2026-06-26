// =============================================================
// MAFIA — Dépôt clandestin envoie des voitures noires saboter nos
// taxis pendant leurs courses. Les mafieux suivent STRICTEMENT le
// réseau routier (mêmes paths SVG que le trafic civil) et utilisent
// les vrais sprites de voitures du jeu, teintés en noir.
// Le joueur doit TAPER chaque voiture noire pour la stopper net /
// la faire exploser et protéger son taxi.
// Récompense : +100 $ par mafieux neutralisé.
// =============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { getCivilCarUrls } from "./gameAssets";
import { ROADS, VILLAGE_PATHS } from "./CityTraffic";

type PlayerTaxi = { id: number; x: number; y: number; onMission: boolean };

type Mafia = {
  id: number;
  sprite: string;
  pathIdx: number;
  pathLen: number;
  t: number;        // distance le long du path (px)
  dir: 1 | -1;      // sens de parcours
  speed: number;    // px/s
  x: number;
  y: number;
  angle: number;
  targetTaxiId: number | null;
  state: "hunt" | "exploding";
  explodedAt?: number;
};

const REWARD = 100;
const MAP_W = 1920;
const MAP_H = 1080;
const SPAWN_INTERVAL_MS = 7000;
const MAX_CARS = 4;
const EXPLOSION_MS = 900;

function getPlayerTaxis(): PlayerTaxi[] {
  const w = window as unknown as { __jcePlayerTaxis?: PlayerTaxi[] };
  return w.__jcePlayerTaxis ?? [];
}

function buildPathEls(): SVGPathElement[] {
  const ns = "http://www.w3.org/2000/svg";
  return ROADS.map((d, i) => {
    if (VILLAGE_PATHS.has(i)) return null;
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", d);
    return p;
  }).filter((p): p is SVGPathElement => p !== null);
}

// Trouve l'index du path dont un point est le plus proche d'une cible (x,y),
// + la distance le long du path (en px) du point le plus proche.
function nearestOnPath(
  paths: SVGPathElement[],
  tx: number,
  ty: number,
): { idx: number; t: number } {
  let bestIdx = 0;
  let bestT = 0;
  let bestD = Infinity;
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];
    const len = p.getTotalLength();
    // échantillonnage grossier (60 pas)
    const steps = 60;
    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * len;
      const pt = p.getPointAtLength(t);
      const d = (pt.x - tx) ** 2 + (pt.y - ty) ** 2;
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
        bestT = t;
      }
    }
  }
  return { idx: bestIdx, t: bestT };
}

export default function MafiaAttackers() {
  const [cars, setCars] = useState<Mafia[]>([]);
  const carsRef = useRef<Mafia[]>([]);
  const idRef = useRef(0);
  const lastSpawn = useRef(0);
  const startedAt = useRef(Date.now());
  const pathEls = useMemo(() => buildPathEls(), []);
  const pathLens = useMemo(() => pathEls.map((p) => p.getTotalLength()), [pathEls]);

  useEffect(() => { carsRef.current = cars; }, [cars]);

  useEffect(() => {
    if (pathEls.length === 0) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const taxis = getPlayerTaxis();
      const onMission = taxis.filter((t) => t.onMission);

      const minutes = (Date.now() - startedAt.current) / 60000;
      const spawnEvery = Math.max(3500, SPAWN_INTERVAL_MS - minutes * 500);

      // Spawn uniquement quand au moins un taxi joueur est en course.
      if (
        onMission.length > 0 &&
        carsRef.current.filter((c) => c.state === "hunt").length < MAX_CARS &&
        now - lastSpawn.current > spawnEvery
      ) {
        lastSpawn.current = now;
        const target = onMission[Math.floor(Math.random() * onMission.length)];
        // On démarre le mafieux sur la ROUTE la plus proche de la cible,
        // mais à une position aléatoire loin du taxi (effet "il arrive
        // par la route, pas téléporté à côté").
        const near = nearestOnPath(pathEls, target.x, target.y);
        const pathIdx = near.idx;
        const len = pathLens[pathIdx];
        // démarre à ±300-600 px le long du path
        const offset = (300 + Math.random() * 300) * (Math.random() < 0.5 ? -1 : 1);
        let startT = near.t + offset;
        if (startT < 0) startT += len;
        if (startT > len) startT -= len;
        const dir: 1 | -1 = offset >= 0 ? -1 : 1; // se rapprocher de la cible
        const pt = pathEls[pathIdx].getPointAtLength(startT);
        const urls = getCivilCarUrls();
        const sprite = urls.length
          ? urls[Math.floor(Math.random() * urls.length)]
          : "";
        const mafia: Mafia = {
          id: ++idRef.current,
          sprite,
          pathIdx,
          pathLen: len,
          t: startT,
          dir,
          speed: 130 + Math.random() * 60 + minutes * 8,
          x: pt.x,
          y: pt.y,
          angle: 0,
          targetTaxiId: target.id,
          state: "hunt",
        };
        carsRef.current = [...carsRef.current, mafia];
      }

      // Avance chaque voiture le long de SA route.
      let mutated = false;
      const next: Mafia[] = [];
      for (const c of carsRef.current) {
        if (c.state === "exploding") {
          if (now - (c.explodedAt ?? now) < EXPLOSION_MS) next.push(c);
          else mutated = true;
          continue;
        }
        const p = pathEls[c.pathIdx];
        const len = c.pathLen;
        let nt = c.t + c.dir * c.speed * dt;

        // Si on arrive au bout d'une route, on choisit la route la plus
        // proche du taxi cible pour continuer la traque.
        if (nt < 0 || nt > len) {
          const tgt = taxis.find((t) => t.id === c.targetTaxiId) ?? taxis[0];
          if (tgt) {
            const near = nearestOnPath(pathEls, tgt.x, tgt.y);
            const newPath = near.idx;
            const newLen = pathLens[newPath];
            // dir orientée pour se rapprocher
            const t0 = near.t;
            const startT = Math.max(0, Math.min(newLen, t0));
            const newDir: 1 | -1 = startT < newLen / 2 ? 1 : -1;
            const pt = pathEls[newPath].getPointAtLength(startT);
            const a0 = pathEls[newPath].getPointAtLength(
              Math.max(0, Math.min(newLen, startT + newDir * 4)),
            );
            const angle = (Math.atan2(a0.y - pt.y, a0.x - pt.x) * 180) / Math.PI;
            next.push({
              ...c,
              pathIdx: newPath,
              pathLen: newLen,
              t: startT,
              dir: newDir,
              x: pt.x,
              y: pt.y,
              angle,
            });
            mutated = true;
            continue;
          } else {
            // plus de cible → on sort
            mutated = true;
            continue;
          }
        }

        const pt = p.getPointAtLength(nt);
        const ahead = p.getPointAtLength(
          Math.max(0, Math.min(len, nt + c.dir * 4)),
        );
        const angle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
        next.push({ ...c, t: nt, x: pt.x, y: pt.y, angle });
        mutated = true;
      }
      carsRef.current = next;
      if (mutated || next.length !== cars.length) setCars(next);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathEls, pathLens]);

  const explode = (id: number) => {
    const t = performance.now();
    carsRef.current = carsRef.current.map((c) =>
      c.id === id && c.state === "hunt" ? { ...c, state: "exploding", explodedAt: t } : c,
    );
    setCars([...carsRef.current]);
    window.dispatchEvent(
      new CustomEvent("jce.player.cashDelta", { detail: { amount: REWARD } }),
    );
  };

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 6 }}
    >
      <defs>
        <filter id="mafia-black">
          <feColorMatrix
            type="matrix"
            values="0.10 0 0 0 0
                    0 0.10 0 0 0
                    0 0 0.12 0 0
                    0 0 0 1 0"
          />
        </filter>
      </defs>

      {cars.map((c) => {
        if (c.state === "exploding") {
          const age = (performance.now() - (c.explodedAt ?? 0)) / EXPLOSION_MS;
          const r = 22 + age * 95;
          const op = 1 - age;
          return (
            <g key={c.id} transform={`translate(${c.x},${c.y})`} pointerEvents="none">
              <circle r={r * 1.2} fill="none" stroke="rgba(255,200,80,0.7)" strokeWidth={3} opacity={op} />
              <circle r={r} fill="rgba(255,170,40,0.7)" opacity={op} />
              <circle r={r * 0.7} fill="rgba(255,90,30,0.9)" opacity={op} />
              <circle r={r * 0.35} fill="rgba(255,240,180,0.95)" opacity={op} />
              <circle cx={-10} cy={-12 - age * 18} r={14 + age * 10} fill="rgba(30,30,30,0.55)" opacity={op * 0.7} />
              <circle cx={12} cy={-8 - age * 22} r={11 + age * 8} fill="rgba(50,50,50,0.5)" opacity={op * 0.7} />
              {[0, 60, 120, 180, 240, 300].map((a) => {
                const rad = (a * Math.PI) / 180;
                const d = age * 70;
                return (
                  <rect
                    key={a}
                    x={Math.cos(rad) * d - 2}
                    y={Math.sin(rad) * d - 2}
                    width={4}
                    height={4}
                    fill="#1a1a1a"
                    opacity={op}
                  />
                );
              })}
              <text y={-r - 6} textAnchor="middle" fontSize={30} fontWeight={900}
                fill="#fde047" stroke="#1a1306" strokeWidth={1.6} opacity={op}>
                +{REWARD}$
              </text>
            </g>
          );
        }
        const W = 56, H = 92;
        return (
          <g
            key={c.id}
            transform={`translate(${c.x},${c.y}) rotate(${c.angle})`}
            style={{ pointerEvents: "auto", cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); explode(c.id); }}
            onTouchStart={(e) => { e.preventDefault(); explode(c.id); }}
          >
            <rect x={-40} y={-30} width={80} height={60} fill="transparent" />
            <ellipse cx={0} cy={6} rx={26} ry={6} fill="rgba(0,0,0,0.55)" />
            <g transform="rotate(90)">
              {c.sprite ? (
                <image
                  href={c.sprite}
                  x={-W / 2}
                  y={-H / 2}
                  width={W}
                  height={H}
                  preserveAspectRatio="xMidYMid meet"
                  filter="url(#mafia-black)"
                />
              ) : (
                <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={8} fill="#0a0a0a" />
              )}
            </g>
            <circle cx={22} cy={-5} r={2} fill="#ff2a2a" />
            <circle cx={22} cy={5} r={2} fill="#ff2a2a" />
            <circle r={6} fill="rgba(0,0,0,0.7)" />
            <text y={2} textAnchor="middle" fontSize={8} fontWeight={900} fill="#b91c1c">M</text>
          </g>
        );
      })}
    </svg>
  );
}
