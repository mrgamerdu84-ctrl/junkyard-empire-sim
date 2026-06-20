// =============================================================
// Lot 4 — Événements scriptés : criminalité, accidents, contrôles.
// Plus fréquent la nuit / zones isolées, rare le week-end et les
// jours de vacances. Le joueur n'a pas (encore) de véhicules
// d'intervention : on signale les événements via marqueurs sur la
// carte + un log de toasts. Quand l'utilisateur ajoutera ses
// propres GIGN/police, il pourra brancher dessus.
// =============================================================
import { useEffect, useState } from "react";
import { getGameTime } from "./cityClock";

type CrimeKind = "robbery" | "accident" | "control" | "fight";

type CrimeEvent = {
  id: number;
  kind: CrimeKind;
  x: number;          // viewBox 1920x1080
  y: number;
  startedAt: number;  // performance.now
  ttl: number;        // ms restant avant disparition
  label: string;
};

const KIND_META: Record<CrimeKind, { icon: string; color: string; label: string }> = {
  robbery:  { icon: "🚨", color: "#ef4444", label: "Braquage" },
  accident: { icon: "🚑", color: "#f97316", label: "Accident" },
  control:  { icon: "🚔", color: "#3b82f6", label: "Contrôle" },
  fight:    { icon: "🥊", color: "#a855f7", label: "Rixe" },
};

// Zones plausibles pour faire apparaître des incidents (évite l'eau / vide).
const HOTSPOTS: { x: number; y: number; isolated?: boolean }[] = [
  { x: 420,  y: 340 },
  { x: 780,  y: 520, isolated: true },
  { x: 1140, y: 280 },
  { x: 1520, y: 620 },
  { x: 940,  y: 760, isolated: true },
  { x: 620,  y: 880 },
  { x: 1350, y: 880 },
  { x: 320,  y: 700, isolated: true },
];

let nextId = 1;

function pickKind(isNight: boolean): CrimeKind {
  const r = Math.random();
  if (isNight) {
    if (r < 0.45) return "robbery";
    if (r < 0.65) return "fight";
    if (r < 0.85) return "control";
    return "accident";
  }
  if (r < 0.4) return "accident";
  if (r < 0.75) return "control";
  if (r < 0.9) return "fight";
  return "robbery";
}

export default function CrimeEvents() {
  const [events, setEvents] = useState<CrimeEvent[]>([]);

  // Génération
  useEffect(() => {
    let raf = 0;
    let lastTry = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = now - lastTry;
      // tentative de spawn ~ toutes les 2 s
      if (dt >= 2000) {
        lastTry = now;
        const t = getGameTime(now);
        const isNight = t.period === "night";
        // Probabilité par tentative : faible le jour, élevée la nuit.
        let p = 0.05;
        if (t.period === "night") p = 0.35;
        else if (t.period === "evening") p = 0.18;
        else if (t.period === "rushAM" || t.period === "rushPM") p = 0.12;
        else if (t.period === "lunch") p = 0.08;
        if (t.isWeekend) p *= 0.7;
        if (t.isHoliday) p *= 0.5;

        if (Math.random() < p) {
          const isolatedPool = HOTSPOTS.filter(h => h.isolated);
          const pool = isNight && Math.random() < 0.6 && isolatedPool.length > 0
            ? isolatedPool
            : HOTSPOTS;
          const spot = pool[Math.floor(Math.random() * pool.length)];
          const kind = pickKind(isNight);
          const ttl = kind === "control" ? 9000 : kind === "accident" ? 14000 : 11000;
          const meta = KIND_META[kind];
          const ev: CrimeEvent = {
            id: nextId++,
            kind,
            x: spot.x + (Math.random() - 0.5) * 60,
            y: spot.y + (Math.random() - 0.5) * 60,
            startedAt: now,
            ttl,
            label: `${meta.label} · ${t.label.split(" ")[1]}`,
          };
          setEvents(es => [...es, ev]);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Expiration
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = performance.now();
      setEvents(es => es.filter(e => now - e.startedAt < e.ttl));
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  const recent = events.slice(-4).reverse();

  return (
    <>
      {/* Marqueurs sur la carte */}
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          zIndex: 6, pointerEvents: "none",
        }}
        aria-hidden
      >
        {events.map(e => {
          const meta = KIND_META[e.kind];
          const age = (performance.now() - e.startedAt) / e.ttl;
          const pulse = 1 + Math.sin(performance.now() / 180 + e.id) * 0.15;
          return (
            <g key={e.id} transform={`translate(${e.x} ${e.y})`} opacity={Math.max(0.2, 1 - age * 0.6)}>
              <circle r={26 * pulse} fill={meta.color} opacity={0.18} />
              <circle r={16} fill={meta.color} opacity={0.85} stroke="#0a0c12" strokeWidth={2} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={18}>{meta.icon}</text>
            </g>
          );
        })}
      </svg>

      {/* Log d'événements */}
      <div
        style={{
          position: "absolute",
          top: 54,
          right: 10,
          zIndex: 30,
          width: 168,
          display: "flex", flexDirection: "column", gap: 4,
          pointerEvents: "none",
        }}
        aria-label="Journal des incidents"
      >
        {recent.map(e => {
          const meta = KIND_META[e.kind];
          return (
            <div key={e.id} style={{
              padding: "5px 8px",
              borderRadius: 8,
              background: "rgba(12,14,22,0.82)",
              border: `1px solid ${meta.color}66`,
              color: "#e8edf5",
              font: "600 10.5px/1.25 ui-sans-serif, system-ui",
              display: "flex", alignItems: "center", gap: 6,
              backdropFilter: "blur(6px)",
            }}>
              <span style={{ fontSize: 13 }}>{meta.icon}</span>
              <span style={{ flex: 1 }}>{e.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
