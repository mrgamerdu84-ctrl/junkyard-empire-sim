import { useEffect, useState } from "react";

const MAP_W = 1920;
const MAP_H = 1080;

// Position du manoir : coin bas-droite de la map, loin des routes
// Les routes principales passent à ~x=879 (vertical) et ~y=591 (horizontal)
// À x=1750, y=880 on est bien dans la zone résidentielle bas-droite
const MX = 1750;
const MY = 880;

// Échelle réduite pour ne pas déborder : manoir compact 200x160px
function ManorGroup() {
  const [gateOpen, setGateOpen] = useState(false);
  const [limoInside, setLimoInside] = useState(false);

  useEffect(() => {
    const onArrive = () => {
      setGateOpen(true);
      setTimeout(() => setLimoInside(true), 2000);
      setTimeout(() => setGateOpen(false), 4500);
    };
    const onLeave = () => {
      setGateOpen(true);
      setTimeout(() => setLimoInside(false), 1000);
      setTimeout(() => setGateOpen(false), 3500);
    };
    const onVisit = () => {
      setGateOpen(true);
      setTimeout(() => setGateOpen(false), 5000);
    };
    window.addEventListener("jce.baron.arrives", onArrive);
    window.addEventListener("jce.baron.leaves", onLeave);
    window.addEventListener("jce.baron.playervisit", onVisit);
    return () => {
      window.removeEventListener("jce.baron.arrives", onArrive);
      window.removeEventListener("jce.baron.leaves", onLeave);
      window.removeEventListener("jce.baron.playervisit", onVisit);
    };
  }, []);

  return (
    <g transform={`translate(${MX},${MY})`}>

      {/* ── ENCEINTE ── */}
      {/* Ombre portée */}
      <rect x={-102} y={-52} width={204} height={158} rx={4}
        fill="#000" opacity={0.35} transform="translate(4,4)" />
      {/* Mur extérieur */}
      <rect x={-102} y={-52} width={204} height={158} rx={4}
        fill="#1a1208" stroke="#5a3e28" strokeWidth={8} />
      {/* Cour intérieure */}
      <rect x={-96} y={-46} width={192} height={146} rx={2}
        fill="#120d06" />

      {/* ── BÂTIMENT PRINCIPAL ── */}
      <rect x={-72} y={-38} width={144} height={90} rx={3}
        fill="#2d1f0e" stroke="#7a5c30" strokeWidth={2} />
      {/* Pierres apparentes */}
      {[-68,-52,-36,-20,-4,12,28,44,60].map((x, i) => (
        <rect key={i} x={x} y={-38 + (i % 2) * 8} width={14} height={7}
          fill="none" stroke="#4a3018" strokeWidth={0.5} />
      ))}

      {/* Toit central */}
      <polygon points="0,-58 -76,-38 76,-38"
        fill="#1a0f05" stroke="#7a5c30" strokeWidth={1.5} />
      {/* Œil-de-bœuf */}
      <circle cx={0} cy={-44} r={6}
        fill="#f59e0b" opacity={0.85} stroke="#7a5c30" strokeWidth={1} />

      {/* ── TOURS ── */}
      <rect x={-88} y={-42} width={20} height={96} rx={2}
        fill="#231508" stroke="#6b5128" strokeWidth={1.5} />
      <polygon points="-78,-58 -88,-42 -68,-42"
        fill="#150d04" stroke="#6b5128" strokeWidth={1} />
      <rect x={-84} y={-10} width={10} height={13} rx={1}
        fill="#f59e0b" opacity={0.65} />

      <rect x={68} y={-42} width={20} height={96} rx={2}
        fill="#231508" stroke="#6b5128" strokeWidth={1.5} />
      <polygon points="78,-58 68,-42 88,-42"
        fill="#150d04" stroke="#6b5128" strokeWidth={1} />
      <rect x={74} y={-10} width={10} height={13} rx={1}
        fill="#f59e0b" opacity={0.65} />

      {/* ── FENÊTRES ── */}
      {[-44,-20,4,28].map((wx, i) => (
        <g key={i}>
          <rect x={wx} y={-20} width={14} height={18} rx={2}
            fill="#f59e0b" opacity={0.75} />
          <line x1={wx + 7} y1={-20} x2={wx + 7} y2={-2}
            stroke="#b8860b" strokeWidth={0.8} />
          <line x1={wx} y1={-11} x2={wx + 14} y2={-11}
            stroke="#b8860b" strokeWidth={0.6} />
        </g>
      ))}

      {/* ── PORTE ── */}
      <rect x={-10} y={36} width={20} height={26} rx={2}
        fill="#0f0a05" stroke="#b8860b" strokeWidth={1.2} />
      <path d="M -10 36 A 10 10 0 0 1 10 36"
        fill="#1a0f05" stroke="#b8860b" strokeWidth={1.2} />
      <circle cx={6} cy={49} r={2} fill="#f59e0b" />

      {/* ── ALLÉE ── */}
      <rect x={-7} y={62} width={14} height={42}
        fill="#2a1a08" />
      {[0,1,2,3].map(i => (
        <rect key={i} x={-6} y={64 + i * 9} width={12} height={1.2}
          fill="#3d2e18" opacity={0.6} />
      ))}

      {/* ── LANTERNES ── */}
      <rect x={-20} y={58} width={2.5} height={14} fill="#5a3e28" />
      <rect x={-23} y={50} width={8} height={9} rx={1}
        fill="#f59e0b" opacity={0.9} />
      <rect x={17} y={58} width={2.5} height={14} fill="#5a3e28" />
      <rect x={15} y={50} width={8} height={9} rx={1}
        fill="#f59e0b" opacity={0.9} />

      {/* ── PORTAIL ── */}
      {/* Piliers */}
      <rect x={-22} y={96} width={10} height={20} rx={1}
        fill="#5a3e28" stroke="#7a5c30" strokeWidth={1} />
      <circle cx={-17} cy={94} r={4} fill="#7a5c30" />
      <rect x={12} y={96} width={10} height={20} rx={1}
        fill="#5a3e28" stroke="#7a5c30" strokeWidth={1} />
      <circle cx={17} cy={94} r={4} fill="#7a5c30" />

      {/* Battant gauche */}
      <g style={{
        transformOrigin: "-12px 106px",
        transform: `rotate(${gateOpen ? -70 : 0}deg)`,
        transition: "transform 0.8s ease",
      }}>
        <rect x={-12} y={96} width={12} height={20} rx={1}
          fill="#3d2810" stroke="#b8860b" strokeWidth={1} />
        {[0, 1].map(i => (
          <line key={i} x1={-10} y1={100 + i * 7} x2={-2} y2={100 + i * 7}
            stroke="#b8860b" strokeWidth={0.6} />
        ))}
      </g>

      {/* Battant droit */}
      <g style={{
        transformOrigin: "12px 106px",
        transform: `rotate(${gateOpen ? 70 : 0}deg)`,
        transition: "transform 0.8s ease",
      }}>
        <rect x={0} y={96} width={12} height={20} rx={1}
          fill="#3d2810" stroke="#b8860b" strokeWidth={1} />
        {[0, 1].map(i => (
          <line key={i} x1={2} y1={100 + i * 7} x2={10} y2={100 + i * 7}
            stroke="#b8860b" strokeWidth={0.6} />
        ))}
      </g>

      {/* ── LIMOUSINE GARÉE ── */}
      {limoInside && (
        <g transform="translate(38, 10)">
          <rect x={-20} y={-8} width={40} height={16} rx={3}
            fill="#1a0a0a" stroke="#8b0000" strokeWidth={1.2} />
          <rect x={-14} y={-6} width={10} height={8} rx={1}
            fill="#1e3a5f" opacity={0.7} />
          <rect x={4} y={-6} width={10} height={8} rx={1}
            fill="#1e3a5f" opacity={0.7} />
          <circle cx={-11} cy={8} r={3} fill="#222" stroke="#555" strokeWidth={0.8} />
          <circle cx={11} cy={8} r={3} fill="#222" stroke="#555" strokeWidth={0.8} />
        </g>
      )}

      {/* ── BOUTON VISITE ── */}
      <g
        onClick={() => window.dispatchEvent(new CustomEvent("jce.baron.playervisit"))}
        style={{ cursor: "pointer", pointerEvents: "auto" }}
      >
        <rect x={-40} y={120} width={80} height={20} rx={4}
          fill="#7f1d1d" stroke="#b8860b" strokeWidth={1.2} opacity={0.95} />
        <text x={0} y={134} textAnchor="middle"
          fontSize={8} fill="#fbbf24" fontWeight="bold"
          style={{ fontFamily: "sans-serif" }}>
          🤝 RENDRE VISITE
        </text>
      </g>

      {/* ── LABEL ── */}
      <text x={0} y={150} textAnchor="middle"
        fontSize={9} fontWeight="bold" fill="#b8860b"
        style={{ fontFamily: "serif", letterSpacing: 1.5 }}>
        MANOIR DU BARON
      </text>

    </g>
  );
}

export default function BaronManor() {
  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 6,
      }}
    >
      <ManorGroup />
    </svg>
  );
}