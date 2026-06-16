import { useEffect, useState } from "react";

/* ============================================================
 * JUNKY CITY EMPIRE — Traffic SVG overlay
 * Voitures vectorielles top-down qui suivent la route visible
 * de citymap.jpg. Lampadaires lumineux. Cycle jour/nuit.
 * ============================================================ */

/* Le viewBox 1000 x 1000 mappe 1:1 sur le conteneur en %.
 * Paths tracés à partir de la position observée des routes/asphalte
 * sur citymap.jpg (route grise principale au bas + axes latéraux). */

const ROADS = [
  // Boulevard principal (route grise visible au bas de la carte)
  "M 30 720 C 180 700, 360 690, 500 700 S 820 720, 970 700",
  // Retour (boucle, voie opposée légèrement décalée)
  "M 970 760 C 820 780, 500 770, 360 760 S 180 770, 30 750",
  // Route médiane (entre buildings et centre)
  "M 30 480 C 200 470, 400 475, 500 470 S 800 475, 970 470",
  "M 970 520 C 800 525, 500 520, 400 525 S 200 530, 30 515",
];

/* Voiture vectorielle détaillée (vue de dessus) */
type CarSpec = { color: string; duration: number; delay: number; pathIdx: number; flip?: boolean; accent?: string };

const CARS: CarSpec[] = [
  { color: "#d83a2a", accent: "#7c1c10", duration: 18, delay: 0,   pathIdx: 0 },
  { color: "#f5c542", accent: "#9c7a1c", duration: 22, delay: -6,  pathIdx: 0 },
  { color: "#2b6ed8", accent: "#13407c", duration: 20, delay: -12, pathIdx: 0 },
  { color: "#1a1a1a", accent: "#000",    duration: 24, delay: -3,  pathIdx: 1, flip: true },
  { color: "#e8edf2", accent: "#8a8e94", duration: 19, delay: -8,  pathIdx: 1, flip: true },
  { color: "#3a8a48", accent: "#1c4a22", duration: 23, delay: -14, pathIdx: 1, flip: true },
  { color: "#d97a2a", accent: "#7a3a10", duration: 17, delay: 0,   pathIdx: 2 },
  { color: "#b81c4a", accent: "#5c0a20", duration: 21, delay: -7,  pathIdx: 2 },
  { color: "#1a3a6a", accent: "#0a1c40", duration: 25, delay: -4,  pathIdx: 3, flip: true },
  { color: "#888e96", accent: "#3a3e44", duration: 19, delay: -10, pathIdx: 3, flip: true },
];

/* Lampadaires positionnés le long des routes */
const LAMPS: [number, number][] = [
  [80, 695], [240, 690], [400, 690], [560, 695], [720, 705], [880, 710],
  [80, 470], [240, 470], [400, 470], [560, 470], [720, 475], [880, 480],
];

/* Dépanneuse spéciale */
const TOW: CarSpec = { color: "#ff8800", accent: "#7a3a00", duration: 28, delay: 0, pathIdx: 0 };

function CarSVG({ color, accent, scale = 1 }: { color: string; accent: string; scale?: number }) {
  // Top-down vue, voiture orientée vers la droite (sera tournée par autoRotate)
  return (
    <g transform={`scale(${scale})`}>
      {/* ombre */}
      <ellipse cx="0" cy="2" rx="22" ry="9" fill="rgba(0,0,0,0.35)" />
      {/* châssis */}
      <rect x="-22" y="-9" width="44" height="18" rx="4" fill={color} />
      {/* dessous foncé */}
      <rect x="-20" y="-9" width="40" height="18" rx="3" fill={color} />
      {/* capot */}
      <rect x="10" y="-8" width="12" height="16" rx="2" fill={color} />
      <rect x="-22" y="-8" width="12" height="16" rx="2" fill={accent} opacity="0.5" />
      {/* pare-brise avant */}
      <path d="M 8 -7 L 14 -5 L 14 5 L 8 7 Z" fill="#0a1626" opacity="0.9" />
      {/* lunette arrière */}
      <path d="M -8 -7 L -14 -5 L -14 5 L -8 7 Z" fill="#0a1626" opacity="0.9" />
      {/* toit */}
      <rect x="-8" y="-6" width="16" height="12" rx="1" fill={color} />
      <line x1="-8" y1="0" x2="8" y2="0" stroke={accent} strokeWidth="0.5" opacity="0.6" />
      {/* roues */}
      <rect x="8" y="-11" width="6" height="3" rx="1" fill="#0a0a0a" />
      <rect x="8" y="8" width="6" height="3" rx="1" fill="#0a0a0a" />
      <rect x="-14" y="-11" width="6" height="3" rx="1" fill="#0a0a0a" />
      <rect x="-14" y="8" width="6" height="3" rx="1" fill="#0a0a0a" />
      {/* phares */}
      <circle cx="20" cy="-5" r="1.6" fill="#fff7c0" />
      <circle cx="20" cy="5" r="1.6" fill="#fff7c0" />
      {/* feux arrière */}
      <circle cx="-20" cy="-5" r="1.4" fill="#ff3a2a" />
      <circle cx="-20" cy="5" r="1.4" fill="#ff3a2a" />
      {/* reflet */}
      <rect x="-6" y="-5" width="12" height="2" rx="1" fill="#fff" opacity="0.18" />
    </g>
  );
}

function TowTruckSVG({ color, accent }: { color: string; accent: string }) {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="32" ry="11" fill="rgba(0,0,0,0.4)" />
      {/* plateau */}
      <rect x="-30" y="-11" width="38" height="22" rx="3" fill="#2a2a2a" />
      {/* épave sur plateau */}
      <rect x="-26" y="-8" width="30" height="16" rx="2" fill="#5a4030" />
      <rect x="-22" y="-6" width="20" height="12" rx="1" fill="#3a2a20" />
      {/* cabine */}
      <rect x="8" y="-11" width="22" height="22" rx="3" fill={color} />
      <rect x="14" y="-9" width="14" height="18" rx="1" fill="#0c1a2e" opacity="0.95" />
      <line x1="14" y1="0" x2="28" y2="0" stroke={accent} strokeWidth="0.6" opacity="0.6" />
      {/* gyrophare */}
      <rect x="12" y="-13" width="14" height="3" rx="1" fill="#ffae00">
        <animate attributeName="opacity" values="1;0.3;1" dur="0.4s" repeatCount="indefinite" />
      </rect>
      {/* roues */}
      <rect x="-22" y="-14" width="8" height="3" rx="1" fill="#0a0a0a" />
      <rect x="-22" y="11" width="8" height="3" rx="1" fill="#0a0a0a" />
      <rect x="12" y="-14" width="8" height="3" rx="1" fill="#0a0a0a" />
      <rect x="12" y="11" width="8" height="3" rx="1" fill="#0a0a0a" />
      {/* phares */}
      <circle cx="30" cy="-5" r="2" fill="#fff7c0" />
      <circle cx="30" cy="5" r="2" fill="#fff7c0" />
    </g>
  );
}

function Lamp({ x, y, night }: { x: number; y: number; night: number }) {
  const lit = night > 0.35;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* halo lumineux */}
      {lit && (
        <circle r={28} fill="#ffd66a" opacity={night * 0.35}>
          <animate attributeName="opacity" values={`${night * 0.3};${night * 0.45};${night * 0.3}`} dur="3s" repeatCount="indefinite" />
        </circle>
      )}
      {/* poteau (bras + base) */}
      <rect x="-1" y="0" width="2" height="18" fill="#1a1a1a" />
      <rect x="-8" y="-2" width="10" height="2" fill="#1a1a1a" />
      {/* ampoule */}
      <circle cx="-8" cy="0" r="3.5" fill={lit ? "#fff5b0" : "#5a5a4a"}>
        {lit && <animate attributeName="r" values="3.5;4;3.5" dur="2s" repeatCount="indefinite" />}
      </circle>
      {lit && <circle cx="-8" cy="0" r="6" fill="#ffd66a" opacity="0.45" />}
    </g>
  );
}

export default function CityTraffic() {
  /* Cycle jour/nuit léger pour piloter l'opacité des lampadaires */
  const [night, setNight] = useState(0.4);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = (performance.now() % 180000) / 180000;
      const day = Math.max(0, Math.sin(t * Math.PI * 2));
      setNight(1 - day);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      <defs>
        {ROADS.map((d, i) => (
          <path key={i} id={`jce-road-${i}`} d={d} />
        ))}
      </defs>

      {/* Asphalte sombre semi-transparent pour souligner les voies */}
      <g opacity="0.35">
        {ROADS.map((d, i) => (
          <path key={i} d={d} stroke="#0c0d10" strokeWidth="42" fill="none" strokeLinecap="round" />
        ))}
        {/* marquage central pointillé */}
        {ROADS.map((d, i) => (
          <path key={`m${i}`} d={d} stroke="#f7d96a" strokeWidth="1.8" strokeDasharray="14 12" fill="none" />
        ))}
      </g>

      {/* Lampadaires */}
      {LAMPS.map(([x, y], i) => (
        <Lamp key={i} x={x} y={y} night={night} />
      ))}

      {/* Voitures animées le long des routes */}
      {CARS.map((c, i) => (
        <g key={i}>
          <CarSVG color={c.color} accent={c.accent} scale={0.85} />
          <animateMotion
            dur={`${c.duration}s`}
            begin={`${c.delay}s`}
            repeatCount="indefinite"
            rotate="auto"
            keyPoints={c.flip ? "1;0" : "0;1"}
            keyTimes="0;1"
          >
            <mpath href={`#jce-road-${c.pathIdx}`} />
          </animateMotion>
        </g>
      ))}

      {/* Dépanneuse — plus lente et plus grande */}
      <g>
        <TowTruckSVG color={TOW.color} accent={TOW.accent} />
        <animateMotion dur={`${TOW.duration}s`} repeatCount="indefinite" rotate="auto">
          <mpath href={`#jce-road-${TOW.pathIdx}`} />
        </animateMotion>
      </g>
      <g>
        <TowTruckSVG color="#f5c542" accent="#7a5a10" />
        <animateMotion dur="32s" begin="-16s" repeatCount="indefinite" rotate="auto" keyPoints="1;0" keyTimes="0;1">
          <mpath href={`#jce-road-3`} />
        </animateMotion>
      </g>

      {/* Voile bleuté la nuit (overlay multiply via fill opacity) */}
      <rect width="1000" height="1000" fill="#0a1530" opacity={night * 0.35} pointerEvents="none" />
    </svg>
  );
}
