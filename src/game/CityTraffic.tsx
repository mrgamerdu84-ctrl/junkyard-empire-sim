import { useEffect, useState } from "react";

/* ============================================================
 * JUNKY CITY EMPIRE — overlay aligné sur citymap.jpg
 * IMPORTANT : le SVG utilise le même ratio que l'image 1920x1080.
 * Avec preserveAspectRatio="xMidYMid slice", les voitures restent
 * calées sur les routes même en mobile recadré.
 * ============================================================ */

const ROADS = [
  // Route chantier haute — derrière les grues, visible sous le casino/concession.
  "M 360 520 C 560 505 770 505 930 520 C 1110 540 1300 520 1540 485",
  // Avenue centrale — longe la casse et le centre, descend vers la ville abandonnée.
  "M 215 690 C 420 660 630 655 800 675 C 990 700 1125 675 1265 615 C 1435 540 1600 535 1780 585",
  // Grande route basse — celle où les voitures doivent rouler au premier plan.
  "M 35 905 C 230 855 455 805 655 785 C 845 765 1035 790 1215 825 C 1425 865 1640 835 1885 735",
  // Voie opposée basse, légèrement décalée dans le même boulevard.
  "M 1880 790 C 1640 895 1425 925 1205 885 C 1010 850 830 825 650 845 C 445 865 240 915 35 965",
  // Bretelle verticale visible à gauche de la casse.
  "M 610 1065 C 620 930 640 805 665 700 C 700 555 735 455 785 340",
  // Bretelle droite vers garage/ville abandonnée.
  "M 1290 1045 C 1265 910 1250 805 1270 690 C 1290 575 1355 475 1460 365",
];

type CarSpec = {
  color: string;
  accent: string;
  duration: number;
  delay: number;
  pathIdx: number;
  flip?: boolean;
  scale?: number;
};

const CARS: CarSpec[] = [
  { color: "#d83a2a", accent: "#7c1c10", duration: 24, delay: -2, pathIdx: 1, scale: 1.02 },
  { color: "#f5c542", accent: "#9c7a1c", duration: 26, delay: -11, pathIdx: 2, scale: 1.05 },
  { color: "#2b6ed8", accent: "#143f7c", duration: 23, delay: -8, pathIdx: 2, scale: 1.04 },
  { color: "#e8edf2", accent: "#8a8e94", duration: 25, delay: -17, pathIdx: 3, flip: true, scale: 1.0 },
  { color: "#12151a", accent: "#050607", duration: 27, delay: -6, pathIdx: 3, flip: true, scale: 1.0 },
  { color: "#3a8a48", accent: "#1c4a22", duration: 31, delay: -21, pathIdx: 0, scale: 0.92 },
  { color: "#d97a2a", accent: "#7a3a10", duration: 29, delay: -14, pathIdx: 1, scale: 0.96 },
  { color: "#b81c4a", accent: "#5c0a20", duration: 33, delay: -3, pathIdx: 4, scale: 0.9 },
  { color: "#1a3a6a", accent: "#0a1c40", duration: 35, delay: -18, pathIdx: 5, flip: true, scale: 0.92 },
  { color: "#8f969e", accent: "#3a3e44", duration: 28, delay: -25, pathIdx: 0, flip: true, scale: 0.9 },
];

const LAMPS: [number, number][] = [
  [420, 655], [600, 650], [805, 675], [1015, 680], [1240, 625], [1460, 560],
  [280, 855], [485, 805], [700, 790], [930, 795], [1160, 825], [1410, 860], [1645, 825],
  [645, 880], [682, 690], [1280, 880], [1275, 690],
];

function CarSVG({ color, accent, scale = 1 }: { color: string; accent: string; scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <ellipse cx="0" cy="8" rx="31" ry="14" fill="rgba(0,0,0,0.42)" />
      <path d="M -30 -10 C -24 -18 18 -18 28 -8 L 34 0 L 27 10 C 12 18 -20 17 -31 9 L -36 0 Z" fill={accent} opacity="0.95" />
      <path d="M -28 -12 C -18 -19 16 -18 28 -8 L 33 0 L 26 9 C 11 15 -18 15 -30 8 L -35 0 Z" fill={color} />
      <path d="M -10 -12 L 13 -11 C 19 -8 22 -4 23 0 C 20 5 16 8 10 10 L -12 10 C -18 7 -20 4 -21 0 C -20 -5 -17 -9 -10 -12 Z" fill="#101b2b" opacity="0.94" />
      <path d="M 12 -10 C 20 -8 25 -4 27 0 C 24 3 20 6 12 8 L 8 2 L 8 -6 Z" fill="#d8f2ff" opacity="0.34" />
      <path d="M -13 -10 C -20 -8 -24 -4 -25 0 C -23 4 -19 7 -13 8 L -9 3 L -9 -6 Z" fill="#d8f2ff" opacity="0.22" />
      <rect x="10" y="-18" width="12" height="5" rx="2" fill="#08090b" />
      <rect x="10" y="13" width="12" height="5" rx="2" fill="#08090b" />
      <rect x="-24" y="-17" width="12" height="5" rx="2" fill="#08090b" />
      <rect x="-24" y="12" width="12" height="5" rx="2" fill="#08090b" />
      <circle cx="33" cy="-5" r="2.2" fill="#fff7c0" />
      <circle cx="33" cy="5" r="2.2" fill="#fff7c0" />
      <circle cx="-32" cy="-5" r="2" fill="#ff3028" />
      <circle cx="-32" cy="5" r="2" fill="#ff3028" />
      <path d="M -3 -9 C 7 -10 17 -7 23 -2" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.22" />
    </g>
  );
}

function TowTruckSVG({ color, accent }: { color: string; accent: string }) {
  return (
    <g>
      <ellipse cx="0" cy="9" rx="44" ry="17" fill="rgba(0,0,0,0.46)" />
      <path d="M -45 -13 L 5 -17 L 12 15 L -42 16 Z" fill="#262b30" />
      <path d="M -38 -9 L -3 -11 L 1 10 L -35 11 Z" fill="#6b4a35" />
      <path d="M 8 -16 L 42 -12 L 46 11 L 12 16 Z" fill={color} />
      <path d="M 19 -12 L 39 -9 L 40 7 L 20 10 Z" fill="#0c1a2e" opacity="0.95" />
      <path d="M -2 -17 L -20 -30" stroke="#ffb22e" strokeWidth="5" strokeLinecap="round" />
      <circle cx="24" cy="-18" r="5" fill="#ffae00">
        <animate attributeName="opacity" values="1;0.25;1" dur="0.42s" repeatCount="indefinite" />
      </circle>
      <rect x="-31" y="-22" width="13" height="6" rx="2" fill="#07080a" />
      <rect x="-31" y="15" width="13" height="6" rx="2" fill="#07080a" />
      <rect x="18" y="-22" width="13" height="6" rx="2" fill="#07080a" />
      <rect x="18" y="15" width="13" height="6" rx="2" fill="#07080a" />
      <circle cx="46" cy="-5" r="2.8" fill="#fff7c0" />
      <circle cx="46" cy="6" r="2.8" fill="#fff7c0" />
      <line x1="13" y1="0" x2="42" y2="0" stroke={accent} strokeWidth="1.2" opacity="0.7" />
    </g>
  );
}

function Lamp({ x, y, night }: { x: number; y: number; night: number }) {
  const lit = night > 0.32;
  return (
    <g transform={`translate(${x},${y})`}>
      {lit && (
        <circle r="46" fill="#ffd66a" opacity={night * 0.28}>
          <animate attributeName="opacity" values={`${night * 0.2};${night * 0.36};${night * 0.2}`} dur="3s" repeatCount="indefinite" />
        </circle>
      )}
      <path d="M 0 30 L 0 0 L -18 -7" stroke="#191b1f" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="-20" cy="-7" r="6" fill={lit ? "#fff5b0" : "#4f5148"} />
      {lit && <circle cx="-20" cy="-7" r="12" fill="#ffd66a" opacity="0.35" />}
    </g>
  );
}

export default function CityTraffic() {
  const [night, setNight] = useState(0.25);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = (performance.now() % 180000) / 180000;
      const daylight = Math.max(0, Math.sin(t * Math.PI * 2));
      setNight(0.18 + (1 - daylight) * 0.72);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3 }}
    >
      <defs>
        {ROADS.map((d, i) => (
          <path key={i} id={`jce-road-${i}`} d={d} />
        ))}
        <filter id="jce-soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      <g opacity="0.26">
        {ROADS.map((d, i) => (
          <path key={i} d={d} stroke="#0b0d10" strokeWidth={i >= 4 ? 34 : 46} fill="none" strokeLinecap="round" />
        ))}
        {ROADS.slice(0, 4).map((d, i) => (
          <path key={`dash-${i}`} d={d} stroke="#f6d56a" strokeWidth="2.4" strokeDasharray="18 18" fill="none" opacity="0.72" />
        ))}
      </g>

      <g filter="url(#jce-soft-shadow)">
        {LAMPS.map(([x, y], i) => (
          <Lamp key={i} x={x} y={y} night={night} />
        ))}
      </g>

      {CARS.map((car, i) => (
        <g key={i} filter="url(#jce-soft-shadow)">
          <CarSVG color={car.color} accent={car.accent} scale={car.scale} />
          <animateMotion
            dur={`${car.duration}s`}
            begin={`${car.delay}s`}
            repeatCount="indefinite"
            rotate="auto"
            keyPoints={car.flip ? "1;0" : "0;1"}
            keyTimes="0;1"
          >
            <mpath href={`#jce-road-${car.pathIdx}`} />
          </animateMotion>
        </g>
      ))}

      <g filter="url(#jce-soft-shadow)">
        <TowTruckSVG color="#ff8800" accent="#7a3a00" />
        <animateMotion dur="34s" begin="-4s" repeatCount="indefinite" rotate="auto">
          <mpath href="#jce-road-1" />
        </animateMotion>
      </g>
      <g filter="url(#jce-soft-shadow)">
        <TowTruckSVG color="#f5c542" accent="#7a5a10" />
        <animateMotion dur="38s" begin="-19s" repeatCount="indefinite" rotate="auto" keyPoints="1;0" keyTimes="0;1">
          <mpath href="#jce-road-3" />
        </animateMotion>
      </g>

      <rect width="1920" height="1080" fill="#0a1530" opacity={night * 0.25} pointerEvents="none" />
    </svg>
  );
}