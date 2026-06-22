// =============================================================
// Zones de parking pré-définies (placement MANUEL).
//
// Chaque zone est un point d'ancrage fixe en coordonnées SVG
// (viewBox 1920×1080). Une voiture en stationnement se positionne
// EXACTEMENT sur ces coordonnées, parallèle au trottoir.
//
// Les voitures garées n'utilisent PAS le réseau de waypoints du
// trafic — elles sont téléportées/alignées sur la zone.
//
// Pour ajuster :
//   - x, y : coordonnées dans le viewBox 1920×1080
//   - angle : rotation en degrés (0 = nez vers la droite, 90 = vers le bas)
//   - side : 1 = trottoir à droite du sens de la voiture, -1 = à gauche
//            (utilisé pour décaler le conducteur vers le trottoir)
// =============================================================

export type ParkingZone = {
  id: string;
  x: number;
  y: number;
  angle: number;
  side: 1 | -1;
};

// Première vague — répartie le long des grandes artères diagonales.
// À ajuster visuellement selon retours joueur.
export const PARKING_ZONES: ParkingZone[] = [
  // Artère nord (ROADS[0], diagonale haut-droite → centre)
  { id: "n1", x: 1780, y: 130,  angle: -28, side:  1 },
  { id: "n2", x: 1560, y: 250,  angle: -28, side:  1 },
  { id: "n3", x: 1320, y: 360,  angle: -25, side:  1 },
  { id: "n4", x: 1050, y: 480,  angle: -15, side: -1 },

  // Centre — zone commerçante
  { id: "c1", x: 880,  y: 470,  angle:   0, side:  1 },
  { id: "c2", x: 720,  y: 530,  angle:  15, side: -1 },

  // Artère sud (ROADS[2], diagonale bas-droite → centre)
  { id: "s1", x: 1700, y: 1000, angle:  28, side: -1 },
  { id: "s2", x: 1480, y: 880,  angle:  28, side: -1 },
  { id: "s3", x: 1240, y: 760,  angle:  28, side: -1 },
  { id: "s4", x: 970,  y: 660,  angle:  18, side:  1 },

  // Descente ouest (commune aux deux grandes routes)
  { id: "w1", x: 540,  y: 720,  angle:  25, side:  1 },
  { id: "w2", x: 380,  y: 800,  angle:  25, side:  1 },
  { id: "w3", x: 220,  y: 880,  angle:  25, side:  1 },
  { id: "w4", x: 90,   y: 970,  angle:  25, side:  1 },
];

/** Renvoie les zones non occupées par les voitures actuellement en parking. */
export function pickFreeZone(occupied: Set<string>): ParkingZone | null {
  const free = PARKING_ZONES.filter(z => !occupied.has(z.id));
  if (free.length === 0) return null;
  return free[Math.floor(Math.random() * free.length)];
}
