// Détection grossière du niveau de l'appareil + helpers de throttling.
// Beaucoup de joueurs sont sur smartphones d'entrée de gamme (Xiaomi Redmi etc.) :
// on ramène les boucles d'animation à 30 fps (24 fps low-end) pour rester fluide.

type Tier = "low" | "mid" | "high";

function detectTier(): Tier {
  if (typeof navigator === "undefined") return "mid";
  const nav = navigator as Navigator & { deviceMemory?: number };
  const mem = nav.deviceMemory ?? 4;
  const cpu = nav.hardwareConcurrency ?? 4;
  const ua = nav.userAgent || "";
  const isMobile = /Android|iPhone|iPad|Mobile/i.test(ua);
  if (mem <= 3 || cpu <= 4 || (isMobile && mem <= 4)) return "low";
  if (mem <= 6 || cpu <= 6 || isMobile) return "mid";
  return "high";
}

let _tier: Tier | null = null;
export function perfTier(): Tier {
  if (_tier === null) _tier = detectTier();
  return _tier;
}

export function targetFps(): number {
  const t = perfTier();
  return t === "low" ? 24 : t === "mid" ? 30 : 60;
}

// Plafond multiplicateur sur les comptages (trafic, piétons, etc.).
export function densityMult(): number {
  const t = perfTier();
  return t === "low" ? 0.35 : t === "mid" ? 0.6 : 1;
}

// Utilitaire : retourne true si on doit exécuter cette frame (rate-limiter).
export function makeFrameLimiter(fps = targetFps()) {
  const minDt = 1000 / fps;
  let last = 0;
  return (now: number) => {
    if (now - last < minDt) return false;
    last = now;
    return true;
  };
}
