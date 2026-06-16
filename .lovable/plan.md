# Plan — Trafic, taxis & station-service

## 1. Débloquer les camions figés (`CityTraffic.tsx`)
Cause : dans la boucle de freinage, dès qu'un véhicule devant ralentit à ~1 px/s, tous ceux derrière s'alignent en cascade et tombent au plancher minimum. Les camions (les plus lents par `duration` élevée) finissent collés.

Correctifs :
- Relever le plancher de vitesse de `1` à `~30 % de baseSpeed` (ils ne peuvent plus se figer).
- Empêcher la cascade : si le leader est lui-même en train de freiner sans obstacle réel devant, ignorer son ralentissement (anti-deadlock).
- Réduire `SAFE_GAP` pour les véhicules longs (truck) pour éviter qu'ils ne se bloquent mutuellement aux courbures du path.

## 2. Variété des trajets taxis (`TaxiTycoon.tsx`)
Aujourd'hui, le pathfinding choisit toujours le même path par défaut. Modifs :
- Quand un taxi part en mission, choisir aléatoirement parmi les chemins disponibles vers la destination (sélection pondérée, pas toujours le plus court).
- Ajouter une petite mémoire « dernier path utilisé » pour pénaliser sa réutilisation immédiate.
- Idem pour le retour au QG.

## 3. Spawn clients sur trottoir (`TaxiTycoon.tsx`)
Les points pickup/dropoff sont posés directement sur la courbe de route. Correctif :
- À la génération d'un job, calculer la normale du path au point choisi et décaler le client de `~22 px` perpendiculairement (côté trottoir aléatoire).
- Le taxi reste sur la route ; le sprite client est décalé.

## 4. Station-service & jauge d'essence (`TaxiTycoon.tsx` + `AdminPanel.tsx`)
- Ajouter `fuel: number` (0–100) sur chaque taxi, sauvegardé.
- Consommation : `−X` par seconde en mouvement (X paramétrable admin, défaut ~0.5).
- Spawn d'une station-service fixe sur la map (sprite simple, à proximité d'une route).
- Si `fuel < 25` ET taxi libre → mode `refueling` : il roule vers la station, attend 4 s (remplissage animé), repart avec `fuel = 100`.
- Slider admin : vitesse de consommation + bouton « refaire le plein de toute la flotte ».
- UI : petite jauge fuel sous chaque taxi dans le panneau de gestion.

## 5. Correction visuelle taxis
- Auditer le composant `Taxi` : retirer halos résiduels, vérifier que la `tintOpacity` du multiply ne dénature pas le sprite, supprimer toute superposition orange/rouge incorrecte.
- S'assurer que le transform JS n'écrase pas le scale (déjà OK via `<g scale>` interne, à confirmer).

## Hors-scope (à traiter plus tard)
Feux rouges, panneaux, piétons supplémentaires, refonte du sprite QG.

## Détails techniques
- `SaveData` bumpé v2 → v3 pour intégrer `fuel` (migration : si absent → 100).
- Nouvelle constante `GAS_STATION_POS = { x, y }` ancrée sur une route existante.
- `AdminConfig` : `fuelConsumption` (0.1–2), `gasStationX/Y`.
- Pathfinding taxi : helper `pickRoute(from, to, excludeIdx?)` retournant un path index aléatoire pondéré.