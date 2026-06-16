import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Instances, Instance, OrthographicCamera } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ============================================================
 * JUNKY CITY EMPIRE — 3D Living City
 * Semi-isometric, stylised PBR-lite. Tout bouge:
 *  - 12 voitures suivent les routes (splines fermées)
 *  - 2 dépanneuses font la navette Logistique <-> Casse
 *  - Grue animée dans la casse
 *  - Employés patrouillent autour des bâtiments
 *  - Fumée d'usine
 *  - Cycle jour/nuit (lumière + ambient + néons)
 * ============================================================ */

export type Zone3D = {
  id: string;
  name: string;
  pos: [number, number]; // x, z
  color: string;
  size: [number, number, number]; // w, h, d
  roof?: string;
};

export const ZONES_3D: Zone3D[] = [
  { id: "casse",         name: "VOTRE CASSE",         pos: [-28, 14],  color: "#5b4a3a", size: [10, 4, 8], roof: "#2a2017" },
  { id: "garage",        name: "GARAGE EXPRESS",      pos: [ 28, 14],  color: "#3a4555", size: [10, 5, 8], roof: "#1a2230" },
  { id: "carwash",       name: "CAR WASH",            pos: [-22, 28],  color: "#2d6a8a", size: [8,  5, 7], roof: "#143b56" },
  { id: "concession",    name: "CONCESSION PREMIUM",  pos: [ 18, -18], color: "#8a6a2d", size: [12, 6, 8], roof: "#5a4318" },
  { id: "casino",        name: "CASINO",              pos: [-18, -18], color: "#6a1f1f", size: [10,10, 8], roof: "#3a0e0e" },
  { id: "centre",        name: "CENTRE COMMERCIAL",   pos: [  0,  -2], color: "#4a4a55", size: [14, 7,10], roof: "#2a2a35" },
  { id: "ville",         name: "VILLE ABANDONNÉE",    pos: [ 32, -2],  color: "#4a3a3a", size: [9,  6, 7], roof: "#2a1a1a" },
  { id: "construction",  name: "ZONE EN CONSTRUCTION",pos: [  4,  28], color: "#7a6a3a", size: [10, 3, 8], roof: "#3a2f18" },
  { id: "international", name: "CASSE INTERNATIONALE",pos: [ 30,  28], color: "#3a5a3a", size: [11, 5, 8], roof: "#1a3a1a" },
];

/* -------- Road network (splines) -------- */
/* Grid roads: 2 horizontals (z=±7, z=±21), 2 verticals (x=±10, x=±25), wrapped as closed loops. */
function makeLoop(points: [number, number][]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    points.map(([x, z]) => new THREE.Vector3(x, 0.05, z)),
    true,
    "catmullrom",
    0.0,
  );
}

const ROAD_LOOPS = [
  // Outer ring
  makeLoop([[-40, -32], [40, -32], [40, 36], [-40, 36]]),
  // Inner ring
  makeLoop([[-22, -10], [22, -10], [22, 22], [-22, 22]]),
];

const ROAD_SEGMENTS: Array<{ from: [number, number]; to: [number, number]; width?: number }> = [
  // Outer rectangle
  { from: [-40, -32], to: [ 40, -32] },
  { from: [ 40, -32], to: [ 40,  36] },
  { from: [ 40,  36], to: [-40,  36] },
  { from: [-40,  36], to: [-40, -32] },
  // Inner rectangle
  { from: [-22, -10], to: [ 22, -10] },
  { from: [ 22, -10], to: [ 22,  22] },
  { from: [ 22,  22], to: [-22,  22] },
  { from: [-22,  22], to: [-22, -10] },
  // Connectors
  { from: [  0, -32], to: [  0, -10] },
  { from: [  0,  22], to: [  0,  36] },
  { from: [-40,   6], to: [-22,   6] },
  { from: [ 22,   6], to: [ 40,   6] },
];

/* -------- Day/Night controller -------- */
function DayNight({ onPhase }: { onPhase: (p: number) => void }) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambRef = useRef<THREE.AmbientLight>(null);
  const { scene } = useThree();
  useFrame((_, dt) => {
    const t = (performance.now() % 180000) / 180000; // 3 min cycle
    const angle = t * Math.PI * 2;
    const sunY = Math.sin(angle);
    const sunX = Math.cos(angle);
    if (sunRef.current) {
      sunRef.current.position.set(sunX * 50, Math.max(2, sunY * 50 + 10), 20);
      const day = Math.max(0, sunY);
      sunRef.current.intensity = 0.4 + day * 1.2;
      const c = new THREE.Color().lerpColors(
        new THREE.Color("#3b4a7a"), // night
        new THREE.Color("#ffd9a0"), // day
        day,
      );
      sunRef.current.color = c;
    }
    if (ambRef.current) {
      const day = Math.max(0, sunY);
      ambRef.current.intensity = 0.25 + day * 0.45;
    }
    const day = Math.max(0, sunY);
    const fog = new THREE.Color().lerpColors(
      new THREE.Color("#0a0e1a"),
      new THREE.Color("#9fb8d8"),
      day,
    );
    scene.background = fog;
    if (scene.fog && (scene.fog as THREE.Fog).color) (scene.fog as THREE.Fog).color = fog;
    onPhase(day);
    void dt;
  });
  return (
    <>
      <directionalLight ref={sunRef} castShadow shadow-mapSize={[1024, 1024]}>
        <orthographicCamera attach="shadow-camera" args={[-60, 60, 60, -60, 1, 200]} />
      </directionalLight>
      <ambientLight ref={ambRef} />
    </>
  );
}

/* -------- Ground + Roads -------- */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
      <planeGeometry args={[140, 140]} />
      <meshStandardMaterial color="#1f241c" roughness={1} />
    </mesh>
  );
}

function RoadSegments() {
  return (
    <group>
      {ROAD_SEGMENTS.map((s, i) => {
        const dx = s.to[0] - s.from[0];
        const dz = s.to[1] - s.from[1];
        const len = Math.hypot(dx, dz);
        const cx = (s.from[0] + s.to[0]) / 2;
        const cz = (s.from[1] + s.to[1]) / 2;
        const rot = Math.atan2(dz, dx);
        const w = s.width ?? 5;
        return (
          <group key={i} position={[cx, 0.02, cz]} rotation={[0, -rot, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[len, w]} />
              <meshStandardMaterial color="#1a1a1d" roughness={0.95} />
            </mesh>
            {/* Center dashed line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <planeGeometry args={[len, 0.18]} />
              <meshBasicMaterial color="#f5d666" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* -------- Cars (instanced traffic) -------- */
type CarSpec = { curve: THREE.CatmullRomCurve3; offset: number; speed: number; color: string };

function Traffic({ count = 14 }: { count?: number }) {
  const specs = useMemo<CarSpec[]>(() => {
    const palette = ["#e85d3a", "#f5d666", "#3a8ad0", "#86c46a", "#c44569", "#d8d8d8", "#1a1a1a", "#9a6a3a"];
    return Array.from({ length: count }, (_, i) => ({
      curve: ROAD_LOOPS[i % ROAD_LOOPS.length],
      offset: (i / count + Math.random() * 0.05) % 1,
      speed: 0.012 + Math.random() * 0.018,
      color: palette[i % palette.length],
    }));
  }, [count]);

  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((_, dt) => {
    specs.forEach((s, i) => {
      s.offset = (s.offset + s.speed * dt) % 1;
      const p = s.curve.getPointAt(s.offset);
      const t = s.curve.getTangentAt(s.offset);
      const g = refs.current[i];
      if (g) {
        g.position.set(p.x, 0.4, p.z);
        g.rotation.y = Math.atan2(t.x, t.z);
      }
    });
  });

  return (
    <>
      {specs.map((s, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }}>
          <mesh castShadow position={[0, 0.3, 0]}>
            <boxGeometry args={[1.6, 0.55, 3.2]} />
            <meshStandardMaterial color={s.color} metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh castShadow position={[0, 0.85, -0.2]}>
            <boxGeometry args={[1.4, 0.5, 1.7]} />
            <meshStandardMaterial color={s.color} metalness={0.4} roughness={0.25} />
          </mesh>
          {/* windshield */}
          <mesh position={[0, 0.85, 0.55]}>
            <boxGeometry args={[1.35, 0.45, 0.05]} />
            <meshStandardMaterial color="#0b1a2a" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* headlights */}
          <mesh position={[ 0.5, 0.4, 1.55]}>
            <boxGeometry args={[0.3, 0.2, 0.05]} />
            <meshStandardMaterial color="#fff7c0" emissive="#fff2a8" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[-0.5, 0.4, 1.55]}>
            <boxGeometry args={[0.3, 0.2, 0.05]} />
            <meshStandardMaterial color="#fff7c0" emissive="#fff2a8" emissiveIntensity={1.2} />
          </mesh>
          {/* rear lights */}
          <mesh position={[ 0.5, 0.4, -1.55]}>
            <boxGeometry args={[0.3, 0.2, 0.05]} />
            <meshStandardMaterial color="#ff3a2a" emissive="#ff2a1a" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[-0.5, 0.4, -1.55]}>
            <boxGeometry args={[0.3, 0.2, 0.05]} />
            <meshStandardMaterial color="#ff3a2a" emissive="#ff2a1a" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* -------- Tow trucks (shuttle) -------- */
function TowTruck({ phase, color = "#e85d3a" }: { phase: number; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(-22, 0.05, 6),
          new THREE.Vector3(-10, 0.05, 6),
          new THREE.Vector3(  0, 0.05, 6),
          new THREE.Vector3( 10, 0.05, 6),
          new THREE.Vector3( 22, 0.05, 6),
          new THREE.Vector3( 22, 0.05, 22),
          new THREE.Vector3(  0, 0.05, 22),
          new THREE.Vector3(-22, 0.05, 22),
          new THREE.Vector3(-22, 0.05, 6),
        ],
        true,
        "catmullrom",
        0.1,
      ),
    [],
  );
  const t = useRef(phase);
  useFrame((_, dt) => {
    t.current = (t.current + dt * 0.04) % 1;
    const p = curve.getPointAt(t.current);
    const tg = curve.getTangentAt(t.current);
    if (ref.current) {
      ref.current.position.set(p.x, 0.5, p.z);
      ref.current.rotation.y = Math.atan2(tg.x, tg.z);
    }
  });
  return (
    <group ref={ref}>
      {/* Cab */}
      <mesh castShadow position={[0, 0.6, 1.3]}>
        <boxGeometry args={[2, 1.3, 1.8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Bed */}
      <mesh castShadow position={[0, 0.4, -0.8]}>
        <boxGeometry args={[2, 0.4, 3.0]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Hook arm */}
      <mesh castShadow position={[0, 1.0, -2.3]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, 2]} />
        <meshStandardMaterial color="#f5d666" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Carried wreck */}
      <mesh castShadow position={[0, 0.9, -0.8]}>
        <boxGeometry args={[1.5, 0.5, 2.4]} />
        <meshStandardMaterial color="#5a4030" metalness={0.4} roughness={0.7} />
      </mesh>
      {/* Beacon */}
      <mesh position={[0, 1.4, 1.6]}>
        <boxGeometry args={[0.5, 0.15, 0.3]} />
        <meshStandardMaterial color="#ffae00" emissive="#ffae00" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

/* -------- Crane in the junkyard -------- */
function Crane({ pos }: { pos: [number, number] }) {
  const arm = useRef<THREE.Group>(null);
  const hook = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (arm.current) arm.current.rotation.y += dt * 0.3;
    if (hook.current) {
      const t = performance.now() / 1000;
      hook.current.position.y = -2 + Math.sin(t * 1.5) * 1.5;
    }
  });
  return (
    <group position={[pos[0], 0, pos[1]]}>
      {/* Base */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 1, 16]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Tower */}
      <mesh castShadow position={[0, 4, 0]}>
        <boxGeometry args={[0.8, 7, 0.8]} />
        <meshStandardMaterial color="#f5d666" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Rotating arm */}
      <group ref={arm} position={[0, 7.5, 0]}>
        <mesh castShadow position={[3, 0, 0]}>
          <boxGeometry args={[7, 0.4, 0.4]} />
          <meshStandardMaterial color="#f5d666" />
        </mesh>
        <mesh castShadow position={[-1.5, 0, 0]}>
          <boxGeometry args={[2, 0.8, 0.8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <group ref={hook} position={[5.5, 0, 0]}>
          {/* Cable */}
          <mesh position={[0, -1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          {/* Magnet */}
          <mesh castShadow position={[0, -2.2, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.4, 12]} />
            <meshStandardMaterial color="#c0392b" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* -------- Workers (capsules walking a loop) -------- */
function Worker({ center, radius = 3, speed = 0.4, color = "#f5d666" }: { center: [number, number]; radius?: number; speed?: number; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = performance.now() / 1000 * speed;
    if (ref.current) {
      ref.current.position.set(center[0] + Math.cos(t) * radius, 0.5, center[1] + Math.sin(t) * radius);
      ref.current.rotation.y = -t + Math.PI / 2;
      const bob = Math.abs(Math.sin(t * 8)) * 0.08;
      ref.current.position.y = 0.5 + bob;
    }
  });
  return (
    <group ref={ref}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.25, 0.7, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#e8c8a0" />
      </mesh>
    </group>
  );
}

/* -------- Smoke -------- */
function Smoke({ pos }: { pos: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const N = 6;
  useFrame(() => {
    if (!ref.current) return;
    const t = performance.now() / 1000;
    ref.current.children.forEach((c, i) => {
      const local = (t * 0.4 + i / N) % 1;
      c.position.y = local * 4;
      (c as THREE.Mesh).scale.setScalar(0.4 + local * 1.2);
      const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = (1 - local) * 0.5;
    });
  });
  return (
    <group ref={ref} position={pos}>
      {Array.from({ length: N }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#cfcfcf" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* -------- Buildings -------- */
type BuildingProps = {
  zone: Zone3D;
  state: { estAchete: boolean; estFini: boolean; clicsEnregistres: number };
  locked: boolean;
  onClick: () => void;
  nightFactor: number;
  children?: React.ReactNode;
};

function Building({ zone, state, locked, onClick, nightFactor, children }: BuildingProps) {
  const [w, h, d] = zone.size;
  const built = state.estFini;
  const hover = useRef(false);
  const groupRef = useRef<THREE.Group>(null);

  // height grows with construction progress
  const progress = state.estAchete ? Math.max(0.1, Math.min(1, state.clicsEnregistres / 15)) : 0.05;
  const currentH = state.estFini ? h : h * progress;

  return (
    <group
      ref={groupRef}
      position={[zone.pos[0], 0, zone.pos[1]]}
      onPointerOver={(e) => { e.stopPropagation(); hover.current = true; document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { hover.current = false; document.body.style.cursor = "default"; }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Plot */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[w + 4, d + 4]} />
        <meshStandardMaterial color={locked ? "#1a1a1a" : built ? "#3a3022" : "#262626"} />
      </mesh>

      {/* Body */}
      <mesh castShadow receiveShadow position={[0, currentH / 2, 0]}>
        <boxGeometry args={[w, currentH, d]} />
        <meshStandardMaterial
          color={locked ? "#2a2a2a" : zone.color}
          metalness={0.2}
          roughness={0.7}
          emissive={built ? zone.color : "#000"}
          emissiveIntensity={built ? nightFactor * 0.6 : 0}
        />
      </mesh>

      {/* Roof */}
      {state.estFini && (
        <mesh castShadow position={[0, currentH + 0.15, 0]}>
          <boxGeometry args={[w + 0.4, 0.3, d + 0.4]} />
          <meshStandardMaterial color={zone.roof ?? "#222"} />
        </mesh>
      )}

      {/* Windows row (emissive at night when built) */}
      {built &&
        [-1, 1].map((side) =>
          Array.from({ length: Math.floor(w / 1.4) }).map((_, i) => (
            <mesh key={`${side}-${i}`} position={[-w / 2 + 1 + i * 1.4, currentH * 0.55, (d / 2) * side + 0.01 * side]}>
              <boxGeometry args={[0.7, 0.5, 0.05]} />
              <meshStandardMaterial color="#ffefa0" emissive="#ffd966" emissiveIntensity={0.4 + nightFactor * 1.4} />
            </mesh>
          )),
        )}

      {/* Construction scaffolding (when chantier) */}
      {state.estAchete && !state.estFini && (
        <group>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} position={[(w / 2 + 0.2) * sx, h / 2, (d / 2 + 0.2) * sz]}>
              <boxGeometry args={[0.1, h, 0.1]} />
              <meshStandardMaterial color="#f5d666" />
            </mesh>
          ))}
        </group>
      )}

      {children}
    </group>
  );
}

/* ============================================================ */

type City3DProps = {
  zones: Zone3D[];
  states: Record<string, { estAchete: boolean; estFini: boolean; clicsEnregistres: number }>;
  niveau: number;
  unlocks: Record<string, number>;
  onZoneClick: (id: string) => void;
  renderLabel: (zone: Zone3D) => React.ReactNode;
};

export default function City3D(props: City3DProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [night, setNight] = useState(0.5);

  if (!mounted) {
    return <div style={{ width: "100%", height: "100%", background: "#0c0d10" }} />;
  }

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <OrthographicCamera makeDefault position={[60, 55, 60]} zoom={11} near={0.1} far={500} />
      <CamLook />
      <fog attach="fog" args={["#9fb8d8", 80, 220]} />
      <DayNight onPhase={(d) => setNight(1 - d)} />

      <Ground />
      <RoadSegments />

      <Traffic count={14} />
      <TowTruck phase={0} color="#e85d3a" />
      <TowTruck phase={0.5} color="#f5d666" />

      {/* Crane lives at the casse */}
      <Crane pos={[-32, 18]} />

      {/* Smoke stacks */}
      <Smoke pos={[-32, 4, 12]} />
      <Smoke pos={[ 28, 5, 14]} />

      {/* Workers around active buildings */}
      <Worker center={[28, 14]} radius={4} speed={0.5} color="#3a8ad0" />
      <Worker center={[ 0, -2]} radius={5} speed={0.4} color="#86c46a" />
      <Worker center={[-22, 28]} radius={3} speed={0.6} color="#e85d3a" />

      {props.zones.map((z) => {
        const st = props.states[z.id];
        const locked = (props.unlocks[z.id] ?? 1) > props.niveau;
        return (
          <Building
            key={z.id}
            zone={z}
            state={st}
            locked={locked}
            nightFactor={night}
            onClick={() => props.onZoneClick(z.id)}
          >
            <Html
              position={[0, (st.estFini ? z.size[1] : z.size[1] * 0.5) + 2, 0]}
              center
              distanceFactor={18}
              zIndexRange={[10, 0]}
              style={{ pointerEvents: "none" }}
            >
              {props.renderLabel(z)}
            </Html>
          </Building>
        );
      })}
    </Canvas>
  );
}

function CamLook() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}
