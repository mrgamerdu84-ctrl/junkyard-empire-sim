import { useState, useEffect } from "react";

const TIPS = [
  "Astuce : klaxonne dans les embouteillages !",
  "Astuce : les missions urgences rapportent le plus",
  "Astuce : garde ton réservoir plein",
  "Astuce : respecte les feux rouges... ou pas",
  "Astuce : les gyrophares attirent l'attention",
  "Astuce : explore la ville pour découvrir des secrets",
  "Astuce : mets ta musique préférée à la radio",
  "Astuce : les courses longues paient mieux",
];

export default function LoadingScreen({ progress }: { progress: number }) {
  const [tip, setTip] = useState(TIPS[0]);
  const [stars, setStars] = useState<{ x: number; y: number; s: number; d: number }[]>([]);

  useEffect(() => {
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    const s = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 55,
      s: Math.random() * 2 + 1,
      d: Math.random() * 3 + 2,
    }));
    setStars(s);
  }, []);

  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="ld-root">
      <style>{`
        .ld-root {
          position: fixed; inset: 0; z-index: 9999;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: #06070a;
          overflow: hidden;
          font-family: system-ui, -apple-system, sans-serif;
        }
        /* Ciel étoilé */
        .ld-stars {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
        }
        .ld-star {
          position: absolute;
          background: #fff;
          border-radius: 50%;
          opacity: 0.8;
          animation: ldTwinkle var(--d) ease-in-out infinite alternate;
        }
        @keyframes ldTwinkle {
          from { opacity: 0.3; transform: scale(0.8); }
          to   { opacity: 1;   transform: scale(1.2); }
        }
        /* Lune */
        .ld-moon {
          position: absolute; top: 6vh; right: 10vw; z-index: 1;
          width: 64px; height: 64px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #fefce8, #fde047 40%, #eab308 100%);
          box-shadow: 0 0 40px 10px rgba(253,224,71,0.25), inset -8px -8px 0 0 rgba(0,0,0,0.15);
        }
        .ld-moon::after {
          content: '';
          position: absolute; top: 12px; left: 22px;
          width: 10px; height: 10px; border-radius: 50%; background: rgba(0,0,0,0.12);
        }
        .ld-moon::before {
          content: '';
          position: absolute; top: 28px; left: 10px;
          width: 6px; height: 6px; border-radius: 50%; background: rgba(0,0,0,0.08);
        }
        /* Silhouette ville */
        .ld-city {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 2;
          height: 22vh;
          background-repeat: repeat-x;
          background-size: auto 100%;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 200'%3E%3Cpath fill='%230e1016' d='M0,200 L0,140 L30,140 L30,90 L60,90 L60,150 L90,150 L90,70 L130,70 L130,160 L160,160 L160,110 L200,110 L200,180 L240,180 L240,80 L270,80 L270,130 L310,130 L310,60 L360,60 L360,170 L400,170 L400,100 L440,100 L440,150 L480,150 L480,70 L520,70 L520,160 L560,160 L560,90 L600,90 L600,140 L640,140 L640,80 L680,80 L680,150 L720,150 L720,110 L760,110 L760,180 L800,180 L800,200 Z'/%3E%3C/svg%3E");
          opacity: 0.85;
        }
        /* Route perspective */
        .ld-road {
          position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); z-index: 3;
          width: 100%; height: 35vh;
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(30,32,40,0.6) 20%,
            rgba(20,22,30,0.95) 100%
          );
          clip-path: polygon(35% 0%, 65% 0%, 85% 100%, 15% 100%);
        }
        .ld-road-lines {
          position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); z-index: 4;
          width: 6px; height: 35vh;
          background: repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.35) 0px,
            rgba(255,255,255,0.35) 18px,
            transparent 18px,
            transparent 42px
          );
          animation: ldRoadMove 0.8s linear infinite;
          clip-path: polygon(0% 0%, 100% 0%, 70% 100%, 30% 100%);
        }
        @keyframes ldRoadMove {
          from { background-position: 0 0; }
          to   { background-position: 0 60px; }
        }
        /* Bordures route */
        .ld-road-left {
          position: absolute; bottom: 0; left: 14.5%; z-index: 4;
          width: 4px; height: 35vh;
          background: repeating-linear-gradient(
            0deg,
            #ef4444 0px, #ef4444 16px,
            #fff 16px, #fff 32px
          );
          animation: ldRoadMove 0.8s linear infinite;
          transform: skewX(8deg);
          opacity: 0.7;
        }
        .ld-road-right {
          position: absolute; bottom: 0; right: 14.5%; z-index: 4;
          width: 4px; height: 35vh;
          background: repeating-linear-gradient(
            0deg,
            #ef4444 0px, #ef4444 16px,
            #fff 16px, #fff 32px
          );
          animation: ldRoadMove 0.8s linear infinite;
          transform: skewX(-8deg);
          opacity: 0.7;
        }
        /* Voiture */
        .ld-car-wrap {
          position: relative; z-index: 10;
          margin-bottom: 8vh;
          animation: ldCarBounce 0.55s infinite alternate ease-in-out;
        }
        @keyframes ldCarBounce {
          from { transform: translateY(0) rotate(0deg); }
          to   { transform: translateY(-6px) rotate(0.5deg); }
        }
        .ld-car-vibrate {
          animation: ldVibrate 0.12s infinite linear;
        }
        @keyframes ldVibrate {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(0.3px, -0.3px); }
          50%  { transform: translate(-0.3px, 0.3px); }
          75%  { transform: translate(0.3px, 0.3px); }
          100% { transform: translate(0, 0); }
        }
        /* Phares */
        .ld-beam-left, .ld-beam-right {
          position: absolute; top: 52px;
          width: 0; height: 0;
          opacity: 0;
          animation: ldBeam 2s ease-in-out infinite alternate;
        }
        .ld-beam-left {
          left: -40px;
          border-left: 60px solid transparent;
          border-right: 0;
          border-top: 14px solid transparent;
          border-bottom: 14px solid transparent;
          border-right: 60px solid rgba(253,224,71,0.15);
          filter: blur(4px);
        }
        .ld-beam-right {
          right: -40px;
          border-right: 60px solid transparent;
          border-left: 0;
          border-top: 14px solid transparent;
          border-bottom: 14px solid transparent;
          border-left: 60px solid rgba(253,224,71,0.15);
          filter: blur(4px);
        }
        @keyframes ldBeam {
          from { opacity: 0.4; }
          to   { opacity: 0.8; }
        }
        /* Fumée échappement */
        .ld-smoke {
          position: absolute; left: -20px; top: 58px;
          display: flex; gap: 4px;
          animation: ldSmoke 1.2s linear infinite;
        }
        @keyframes ldSmoke {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-30px) translateY(-10px); }
        }
        .ld-smoke-p {
          width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.25);
          animation: ldSmokeP 1s ease-out infinite;
        }
        .ld-smoke-p:nth-child(2) { animation-delay: 0.3s; }
        .ld-smoke-p:nth-child(3) { animation-delay: 0.6s; }
        @keyframes ldSmokeP {
          from { transform: scale(1); opacity: 0.4; }
          to   { transform: scale(2.5); opacity: 0; }
        }
        /* Barre */
        .ld-track {
          width: min(320px, 70vw); height: 6px;
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
          overflow: hidden;
          position: relative; z-index: 10;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);
        }
        .ld-fill {
          height: 100%;
          background: linear-gradient(90deg, #eab308, #fde047, #facc15);
          border-radius: 3px;
          transition: width 0.25s ease;
          box-shadow: 0 0 12px rgba(253,224,71,0.45), 0 0 4px rgba(253,224,71,0.8);
          position: relative;
        }
        .ld-fill::after {
          content: '';
          position: absolute; right: 0; top: 0; bottom: 0;
          width: 20px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6));
          animation: ldShimmer 1s linear infinite;
        }
        @keyframes ldShimmer {
          from { transform: translateX(-20px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        /* Texte */
        .ld-title {
          margin-top: 24px;
          color: #fde047;
          font-size: clamp(18px, 4vw, 28px);
          font-weight: 900;
          letter-spacing: 4px;
          text-transform: uppercase;
          text-shadow: 0 0 20px rgba(253,224,71,0.35), 0 2px 4px rgba(0,0,0,0.6);
          animation: ldPulse 1.6s ease-in-out infinite;
          z-index: 10; position: relative;
        }
        @keyframes ldPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }
        .ld-tip {
          margin-top: 10px;
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          font-style: italic;
          text-align: center;
          z-index: 10; position: relative;
          max-width: min(320px, 80vw);
        }
        .ld-pct {
          margin-top: 6px;
          color: rgba(255,255,255,0.35);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          z-index: 10; position: relative;
        }
      `}</style>

      {/* Ciel */}
      <div className="ld-stars">
        {stars.map((s, i) => (
          <div
            key={i}
            className="ld-star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.s}px`,
              height: `${s.s}px`,
              animationDelay: `${Math.random() * 2}s`,
              // @ts-expect-error CSS var
              "--d": `${s.d}s`,
            }}
          />
        ))}
      </div>
      <div className="ld-moon" />

      {/* Ville */}
      <div className="ld-city" />

      {/* Route */}
      <div className="ld-road" />
      <div className="ld-road-left" />
      <div className="ld-road-right" />
      <div className="ld-road-lines" />

      {/* Voiture */}
      <div className="ld-car-wrap">
        <div className="ld-car-vibrate" style={{ position: "relative" }}>
          {/* Phares */}
          <div className="ld-beam-left" />
          <div className="ld-beam-right" />

          {/* Fumée */}
          <div className="ld-smoke">
            <div className="ld-smoke-p" />
            <div className="ld-smoke-p" />
            <div className="ld-smoke-p" />
          </div>

          <svg width="160" height="90" viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
            {/* Ombre */}
            <ellipse cx="80" cy="84" rx="62" ry="5" fill="#000" opacity="0.5" />
            {/* Carrosserie arrière */}
            <path d="M18,58 L18,42 Q18,34 26,32 L48,28 L58,18 Q62,14 68,14 L110,14 Q118,14 124,18 L132,26 L140,30 Q148,34 148,42 L148,58 Z"
                  fill="#ca8a04" stroke="#422006" strokeWidth="2" strokeLinejoin="round" />
            {/* Carrosserie avant (plus clair) */}
            <path d="M20,58 L20,44 Q20,36 28,34 L50,30 L60,20 Q64,16 70,16 L108,16 Q116,16 122,20 L130,28 L138,32 Q146,36 146,44 L146,58 Z"
                  fill="#facc15" stroke="#a16207" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Toit */}
            <path d="M56,28 L64,18 L114,18 L124,28 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            {/* Vitres */}
            <path d="M60,26 L66,20 L100,20 L106,26 Z" fill="#38bdf8" opacity="0.7" />
            <path d="M108,26 L116,20 L122,28 Z" fill="#38bdf8" opacity="0.5" />
            {/* Ligne portière */}
            <path d="M78,20 L78,56" stroke="#a16207" strokeWidth="1" opacity="0.6" />
            {/* Poignée */}
            <rect x="82" y="34" width="10" height="3" rx="1" fill="#713f12" />
            {/* Pare-choc avant */}
            <rect x="14" y="52" width="8" height="8" rx="2" fill="#475569" />
            <rect x="138" y="52" width="8" height="8" rx="2" fill="#475569" />
            {/* Feux avant (blancs) */}
            <ellipse cx="22" cy="48" rx="5" ry="4" fill="#fefce8" />
            <ellipse cx="140" cy="48" rx="5" ry="4" fill="#fefce8" />
            {/* Feux arrière (rouges) */}
            <ellipse cx="22" cy="55" rx="4" ry="3" fill="#ef4444" />
            <ellipse cx="140" cy="55" rx="4" ry="3" fill="#ef4444" />
            {/* Plaque */}
            <rect x="62" y="58" width="36" height="10" rx="2" fill="#f8fafc" stroke="#334155" strokeWidth="1" />
            <text x="80" y="65.5" fontSize="6" fontWeight="900" textAnchor="middle" fill="#0f172a">TAXI-01</text>
            {/* Roues */}
            <g>
              <circle cx="38" cy="60" r="11" fill="#0f172a" stroke="#1e293b" strokeWidth="2.5" />
              <circle cx="38" cy="60" r="5" fill="#94a3b8" />
              <line x1="38" y1="55" x2="38" y2="65" stroke="#475569" strokeWidth="1.5" />
              <line x1="33" y1="60" x2="43" y2="60" stroke="#475569" strokeWidth="1.5" />
            </g>
            <g>
              <circle cx="124" cy="60" r="11" fill="#0f172a" stroke="#1e293b" strokeWidth="2.5" />
              <circle cx="124" cy="60" r="5" fill="#94a3b8" />
              <line x1="124" y1="55" x2="124" y2="65" stroke="#475569" strokeWidth="1.5" />
              <line x1="119" y1="60" x2="129" y2="60" stroke="#475569" strokeWidth="1.5" />
            </g>
            {/* Gyrophare */}
            <rect x="72" y="10" width="16" height="6" rx="1" fill="#475569" />
            <rect x="74" y="7" width="12" height="4" rx="1" fill="#3b82f6" opacity="0.9" />
            <ellipse cx="80" cy="5" rx="6" ry="3" fill="#60a5fa" opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* Barre + texte */}
      <div className="ld-track">
        <div className="ld-fill" style={{ width: `${clamped}%` }} />
      </div>
      <div className="ld-title">Chargement</div>
      <div className="ld-pct">{Math.floor(clamped)}%</div>
      <div className="ld-tip">{tip}</div>
    </div>
  );
}
