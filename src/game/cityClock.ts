// =============================================================
// Lot 4 — Horloge interne de la ville
// 300 s réelles = 24 h dans le jeu. On en dérive l'heure, le jour
// de la semaine et un coefficient de densité (heures de pointe,
// nuit, week-end, vacances scolaires).
// =============================================================

const DAY_MS = 300_000; // 5 min réelles = 1 journée

export type Period =
  | "night"        // 22h-6h
  | "earlyMorning" // 6h-7h30
  | "rushAM"       // 7h30-9h
  | "day"          // 9h-12h, 14h-16h30
  | "lunch"        // 12h-14h
  | "rushPM"       // 16h30-18h30
  | "evening";     // 18h30-22h

export type GameTime = {
  hour: number;          // 0-23.999
  minute: number;        // 0-59
  dayOfWeek: number;     // 0 dim ... 6 sam (basé sur l'origine du jeu)
  isWeekend: boolean;
  isHoliday: boolean;    // vacances simulées : tous les 9 jours
  period: Period;
  density: number;       // 0-1.6, coefficient pour le trafic et la criminalité
  label: string;         // "Lundi 08:42"
};

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function detectPeriod(h: number, isWeekend: boolean): Period {
  if (h < 6 || h >= 22) return "night";
  if (h < 7.5) return "earlyMorning";
  if (!isWeekend && h < 9) return "rushAM";
  if (h < 12) return "day";
  if (h < 14) return "lunch";
  if (h < 16.5) return "day";
  if (!isWeekend && h < 18.5) return "rushPM";
  return "evening";
}

function densityFor(period: Period, isWeekend: boolean, isHoliday: boolean): number {
  let base = 0;
  switch (period) {
    case "night":        base = 0.15; break;
    case "earlyMorning": base = 0.45; break;
    case "rushAM":       base = 1.55; break;
    case "day":          base = 0.85; break;
    case "lunch":        base = 1.05; break;
    case "rushPM":       base = 1.50; break;
    case "evening":      base = 0.70; break;
  }
  if (isWeekend) base *= 0.55;
  if (isHoliday) base *= 0.5;
  return Math.max(0.05, base);
}

export function getGameTime(now: number = performance.now()): GameTime {
  const totalDays = now / DAY_MS;
  const dayIndex = Math.floor(totalDays);
  const frac = totalDays - dayIndex;
  const hourF = frac * 24;
  const hour = Math.floor(hourF);
  const minute = Math.floor((hourF - hour) * 60);
  const dayOfWeek = ((dayIndex % 7) + 7) % 7;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isHoliday = dayIndex % 9 === 0; // simule des vacances ponctuelles
  const period = detectPeriod(hourF, isWeekend);
  const density = densityFor(period, isWeekend, isHoliday);
  const label = `${DAYS[dayOfWeek]} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return { hour: hourF, minute, dayOfWeek, isWeekend, isHoliday, period, density, label };
}

export function periodLabel(p: Period): string {
  switch (p) {
    case "night": return "Nuit";
    case "earlyMorning": return "Petit matin";
    case "rushAM": return "Pointe matin";
    case "day": return "Journée";
    case "lunch": return "Déjeuner";
    case "rushPM": return "Pointe soir";
    case "evening": return "Soirée";
  }
}
