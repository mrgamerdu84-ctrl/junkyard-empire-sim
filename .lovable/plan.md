
## Objectif

Nettoyer la carte pour que tu repartes d'une base vide côté trafic. Tu géreras toi-même les voitures civiles et les véhicules spéciaux (GIGN, etc.) plus tard.

## Ce qui est retiré (dans `src/game/CityTraffic.tsx`)

1. **Toutes les voitures civiles** : la liste `CARS` est vidée (berlines, hatch, vans, camions, police, transport de fonds, GIGN).
2. **Le camion GIGN** : déjà inclus dans la suppression ci-dessus (entrée `kind: "gign"`).
3. **Les radars de vitesse** : suppression de `RADAR_SPECS`, du rendu des plots radar sur la route, des flashs, et du compteur d'amendes (HUD "📸 Amendes" retiré).

## Ce qui reste intact

- Les **taxis du joueur** (gérés dans `TaxiTycoon.tsx`, fichier non touché).
- Les **piétons** sur les trottoirs.
- Les **feux rouges** aux intersections + passages piétons.
- Les **concurrents IA** (QG sur la carte du Lot 3).
- Le **cycle jour/nuit** et l'éclairage.
- Toute l'infrastructure (paths, voies, helpers) — pour que tu puisses réinjecter des véhicules quand tu veux, simplement en remettant des entrées dans `CARS`.

## Détails techniques

- `CARS: CarSpec[] = []` au lieu de la liste actuelle de ~33 véhicules.
- Boucle d'animation conservée mais `activeCars` sera vide → aucun coût CPU.
- `RADAR_SPECS = []`, état `radars`/`flashes`/`totalFines` retirés, badge HUD radar retiré.
- Imports `RadarSvg` retirés si plus utilisés.
