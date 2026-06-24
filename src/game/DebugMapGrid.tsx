import { useEffect, useState } from "react";
import { ROADS } from "./CityTraffic";
import { PARKING_ZONES } from "./parkingZones";

/**
 * Surcouche temporaire de calibrage.
 * - Grille 0–1920 × 0–1080 alignée sur l'image (preserveAspectRatio="xMidYMid meet").
 * - Lignes tous les 100 px, label tous les 200 px.
 * - Trace les ROADS avec marqueurs et coordonnées sur chaque waypoint (R{i}-W{j}: x,y).
 * - Trace les PARKING_ZONES avec leur id et coordonnées.
 *
 * Bouton flottant (coin haut-gauche) pour afficher/masquer.
 * État persistant dans localStorage("jce.debug.grid").
 */
export default function DebugMapGrid() {
  const [on, setOn] = useState<boolean>(() => {
    try { return localStorage.getItem("jce.debug.grid") === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem("jce.debug.grid", on ? "1" : "0"); } catch {}
  }, [on]);

  // Parse rapide d'un "M x y L x y L x y …" → [{x,y}, …]
  const roadPts = ROADS.map((d) => {
    const nums = d.replace(/[MLml,]/g, " ").trim().split(/\s+/).map(Number);
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) {
      pts.push({ x: nums[i], y: nums[i + 1] });
    }
    return pts;
  });

  return (
    <>
      <button
        type="button"
        data-no-pan
        onClick={() => setOn((v) => !v)}
        style={{
          position: "fixed",
          left: 8,
          top: 8,
          zIndex: 99999,
          padding: "6px 10px",
          fontSize: 11,
          fontWeight: 800,
          fontFamily: "system-ui, sans-serif",
          borderRadius: 8,
          border: "2px solid #22d3ee",
          background: on ? "#22d3ee" : "rgba(8,10,18,0.92)",
          color: on ? "#04121a" : "#22d3ee",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}
      >
        {on ? "GRID ON" : "GRID OFF"}
      </button>

      {on && (
        <svg
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid meet"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 9000,
            pointerEvents: "none",
          }}
        >
          {/* Grille fine (100px) */}
          {Array.from({ length: 20 }, (_, i) => (i + 1) * 100).map((x) => (
            <line key={`vx${x}`} x1={x} y1={0} x2={x} y2={1080}
                  stroke={x % 200 === 0 ? "#22d3ee" : "#22d3ee55"}
                  strokeWidth={x % 200 === 0 ? 1.2 : 0.6} />
          ))}
          {Array.from({ length: 10 }, (_, i) => (i + 1) * 100).map((y) => (
            <line key={`hy${y}`} x1={0} y1={y} x2={1920} y2={y}
                  stroke={y % 200 === 0 ? "#22d3ee" : "#22d3ee55"}
                  strokeWidth={y % 200 === 0 ? 1.2 : 0.6} />
          ))}
          {/* Labels axes X (tous les 200) */}
          {Array.from({ length: 10 }, (_, i) => (i + 1) * 200).map((x) => (
            <text key={`lx${x}`} x={x + 3} y={14} fill="#22d3ee" fontSize="11" fontFamily="monospace">
              {x}
            </text>
          ))}
          {/* Labels axes Y (tous les 200) */}
          {Array.from({ length: 5 }, (_, i) => (i + 1) * 200).map((y) => (
            <text key={`ly${y}`} x={4} y={y - 3} fill="#22d3ee" fontSize="11" fontFamily="monospace">
              {y}
            </text>
          ))}

          {/* Bord viewBox */}
          <rect x={0} y={0} width={1920} height={1080}
                fill="none" stroke="#facc15" strokeWidth={2} strokeDasharray="8 6" />

          {/* ROADS */}
          {roadPts.map((pts, ri) => {
            const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
            return (
              <g key={`road${ri}`}>
                <path d={d} stroke="#ef4444" strokeWidth={4} fill="none" opacity={0.85} />
                {pts.map((p, wi) => (
                  <g key={`r${ri}w${wi}`}>
                    <circle cx={p.x} cy={p.y} r={7} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
                    <text x={p.x + 10} y={p.y - 8} fill="#fff" stroke="#000" strokeWidth={3}
                          paintOrder="stroke" fontSize="13" fontWeight={800} fontFamily="monospace">
                      R{ri}W{wi} {p.x},{p.y}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}

          {/* PARKING ZONES */}
          {PARKING_ZONES.map((z) => (
            <g key={z.id}>
              <rect x={z.x - 18} y={z.y - 10} width={36} height={20}
                    fill="#22c55e55" stroke="#22c55e" strokeWidth={2}
                    transform={`rotate(${z.angle} ${z.x} ${z.y})`} />
              <circle cx={z.x} cy={z.y} r={4} fill="#22c55e" />
              <text x={z.x + 8} y={z.y + 18} fill="#bbf7d0" stroke="#000" strokeWidth={3}
                    paintOrder="stroke" fontSize="12" fontWeight={800} fontFamily="monospace">
                P:{z.id} {z.x},{z.y}
              </text>
            </g>
          ))}
        </svg>
      )}
    </>
  );
}
