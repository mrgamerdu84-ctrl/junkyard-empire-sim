// =============================================================
// GameMap — système de carte propre, pixel-précis.
// Source UNIQUE de vérité pour TOUT le trafic (joueur + NPC) :
// civils, taxis rivaux, police suivent strictement le même
// graphe de routes (waypoints en dur) via <animateMotion> SVG.
// Image de fond : src/routes/index.tsx (citymap-v3.jpg).
// =============================================================
import { useEffect, useMemo, useState } from "react";
import taxiYellow from "@/assets/taxi-yellow-top.png";
import taxiRed from "@/assets/taxi-red-top.png";
import taxiBlack from "@/assets/taxi-black-top.png";
import policeCar from "@/assets/police-car-top.png";
import carNpc from "@/assets/car-npc-topdown.png";
import carNpcRed from "@/assets/car-npc-red-topdown.png";

type P = { x: number; y: number };

// --- Graphe routier : nœuds + axes ------------------------------------------
const NODES = {
  TL_EDGE:  { x: 100,  y: 150 },
  RP_TL:    { x: 420,  y: 360 },   // rond-point Haut-Gauche
  RP_TR:    { x: 1460, y: 280 },   // rond-point Haut-Droite
  RP_BL:    { x: 320,  y: 780 },   // rond-point Bas-Gauche
  RP_BR:    { x: 1520, y: 740 },   // rond-point Bas-Droite
  BL_EDGE:  { x: 100,  y: 1000 },
  TR_EDGE:  { x: 1800, y: 100 },
  BR_EDGE:  { x: 1850, y: 950 },
  MID_TOP:  { x: 940,  y: 240 },
  MID_BOT:  { x: 960,  y: 840 },   // = PORTAIL
} as const;

const ROADS: Record<string, P[]> = {
  axeGauche: [NODES.TL_EDGE, NODES.RP_TL, NODES.RP_BL, NODES.BL_EDGE],
  axeDroite: [NODES.TR_EDGE, NODES.RP_TR, NODES.RP_BR, NODES.BR_EDGE],
  axeBas:    [NODES.RP_BL, NODES.MID_BOT, NODES.RP_BR],
  axeHaut:   [NODES.RP_TL, NODES.MID_TOP, NODES.RP_TR],
};

const HANGARS: P[] = [{ x: 880, y: 520 }, { x: 1040, y: 520 }];
const PORTAIL: P = NODES.MID_BOT;
const IDLE_PARKING: P = { x: 1000, y: 920 };

const toPath = (pts: P[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

// --- Circuits NPC (boucles fermées sur le graphe) ----------------------------
// Chaque circuit est une suite de nœuds connectés par les axes ci-dessus.
const NPC_CIRCUITS: P[][] = [
  // Boucle périphérique complète (sens horaire)
  [NODES.RP_TL, NODES.MID_TOP, NODES.RP_TR, NODES.RP_BR, NODES.MID_BOT, NODES.RP_BL, NODES.RP_TL],
  // Boucle inverse (sens anti-horaire)
  [NODES.RP_TR, NODES.MID_TOP, NODES.RP_TL, NODES.RP_BL, NODES.MID_BOT, NODES.RP_BR, NODES.RP_TR],
  // Axe gauche aller-retour (sortie/entrée ville)
  [NODES.TL_EDGE, NODES.RP_TL, NODES.RP_BL, NODES.BL_EDGE, NODES.RP_BL, NODES.RP_TL, NODES.TL_EDGE],
  // Axe droit aller-retour
  [NODES.TR_EDGE, NODES.RP_TR, NODES.RP_BR, NODES.BR_EDGE, NODES.RP_BR, NODES.RP_TR, NODES.TR_EDGE],
  // Diagonale via axe bas
  [NODES.RP_BL, NODES.MID_BOT, NODES.RP_BR, NODES.RP_TR, NODES.MID_TOP, NODES.RP_TL, NODES.RP_BL],
];

// --- Construction des paths joueur ------------------------------------------
const PLAYER_ROUTES = ["axeGauche", "axeDroite", "axeBas"] as const;
type PlayerRouteKey = (typeof PLAYER_ROUTES)[number];

function buildTaxiTrip(hangar: P, routeKey: PlayerRouteKey): string {
  const axe = ROADS[routeKey];
  return toPath([hangar, PORTAIL, ...axe, PORTAIL, IDLE_PARKING]);
}

// --- Lecture du nombre de taxis joueur --------------------------------------
const SAVE_KEY = "taxi-tycoon-v4";
function useTaxiCount(): number {
  const [n, setN] = useState<number>(() => readCount());
  useEffect(() => {
    const tick = () => setN(readCount());
    const id = window.setInterval(tick, 800);
    window.addEventListener("storage", tick);
    return () => { window.clearInterval(id); window.removeEventListener("storage", tick); };
  }, []);
  return n;
}
function readCount(): number {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return 1;
    const j = JSON.parse(raw);
    return Array.isArray(j?.taxis) ? Math.max(1, j.taxis.length) : 1;
  } catch { return 1; }
}

// --- NPCs : configuration ----------------------------------------------------
// Sprites variés pour rendre le trafic vivant.
const NPC_SPRITES = [carNpc, carNpcRed, taxiRed, taxiBlack, policeCar];

const NPC_COUNT = 14;

type Npc = {
  id: number;
  sprite: string;
  circuitIdx: number;
  duration: number;
  delay: number;
  size: number;
};

function buildNpcs(): Npc[] {
  const out: Npc[] = [];
  for (let i = 0; i < NPC_COUNT; i++) {
    const circuitIdx = i % NPC_CIRCUITS.length;
    const sprite = NPC_SPRITES[i % NPC_SPRITES.length];
    out.push({
      id: i,
      sprite,
      circuitIdx,
      duration: 36 + (i % 5) * 6,   // 36-60s, vitesses variées
      delay: (i * 2.3) % 10,
      size: sprite === policeCar ? 52 : 48,
    });
  }
  return out;
}

export default function GameMap({ showDebugRoutes = false }: { showDebugRoutes?: boolean }) {
  const count = useTaxiCount();

  const playerTaxis = useMemo(() => Array.from({ length: count }, (_, i) => {
    const hangar = HANGARS[i % HANGARS.length];
    const routeKey = PLAYER_ROUTES[i % PLAYER_ROUTES.length];
    return {
      id: i,
      hangar,
      routeKey,
      duration: 28 + (i % 3) * 4,
      delay: (i * 1.7) % 6,
    };
  }), [count]);

  const npcs = useMemo(() => buildNpcs(), []);

  return (
    <svg
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid meet"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 3, pointerEvents: "none" }}
      aria-hidden
    >
      <defs>
        {playerTaxis.map((t) => (
          <path key={`pp-${t.id}`} id={`gm-trip-${t.id}`} d={buildTaxiTrip(t.hangar, t.routeKey)} fill="none" />
        ))}
        {NPC_CIRCUITS.map((c, i) => (
          <path key={`np-${i}`} id={`gm-npc-${i}`} d={toPath(c)} fill="none" />
        ))}
        <filter id="gm-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.45" />
        </filter>
      </defs>

      {showDebugRoutes && (
        <g opacity="0.55">
          {Object.keys(ROADS).map((k) => (
            <path key={k} d={toPath(ROADS[k])} stroke="#ffeb3b" strokeWidth="3" fill="none" strokeDasharray="6 4" />
          ))}
          {Object.entries(NODES).map(([k, n]) => (
            <g key={k}>
              <circle cx={n.x} cy={n.y} r="7" fill="#fbbf24" stroke="#1f2937" strokeWidth="2" />
            </g>
          ))}
          {HANGARS.map((h, i) => (<circle key={`h-${i}`} cx={h.x} cy={h.y} r="8" fill="#22c55e" />))}
          <circle cx={PORTAIL.x} cy={PORTAIL.y} r="10" fill="#ef4444" />
          <circle cx={IDLE_PARKING.x} cy={IDLE_PARKING.y} r="10" fill="#3b82f6" />
        </g>
      )}

      {/* NPCs : civils, taxis rivaux, police — tous sur le graphe routier */}
      {npcs.map((n) => (
        <g key={`npc-${n.id}`} filter="url(#gm-shadow)">
          <image href={n.sprite} width={n.size} height={n.size} x={-n.size / 2} y={-n.size / 2}>
            <animateMotion
              dur={`${n.duration}s`}
              begin={`${n.delay}s`}
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href={`#gm-npc-${n.circuitIdx}`} />
            </animateMotion>
          </image>
        </g>
      ))}

      {/* Taxis joueur : hangar → portail → axe → idle parking */}
      {playerTaxis.map((t) => (
        <g key={`pt-${t.id}`} filter="url(#gm-shadow)">
          <image href={taxiYellow} width="56" height="56" x="-28" y="-28">
            <animateMotion
              dur={`${t.duration}s`}
              begin={`${t.delay}s`}
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href={`#gm-trip-${t.id}`} />
            </animateMotion>
          </image>
        </g>
      ))}
    </svg>
  );
}
