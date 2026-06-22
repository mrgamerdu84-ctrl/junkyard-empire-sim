
## Objectif

1. Que **toutes les routes** de la map soient utilisées (y compris la route du haut actuellement bloquée).
2. Plus de **distance de sécurité** entre voitures pour éviter qu'elles se collent.
3. Voir les **taxis concurrents** circuler sur la map, **chacun à la couleur de son QG**.

---

## 1. Activer la route du haut (`CityTraffic.tsx`)

Aujourd'hui, `VILLAGE_PATHS = new Set([1])` exclut la route du haut (le « village ») du trafic. La route est tracée (pointillés visibles) mais aucune voiture n'y est jamais affectée.

Action :
- Vider `VILLAGE_PATHS` → `new Set<number>()`. Toutes les `ROADS[0..3]` deviennent disponibles pour `buildCarsFromCustom` + `rerollSpec` (qui passent déjà par `allowedPaths` / `civilAllowed`).
- Conserver `VILLAGE_PATHS` comme export (utilisé ailleurs pour les piétons / clients) — juste vide, donc plus aucun path n'est filtré.
- Vérifier `PhotoPedestrians` et les `PARKING_ZONES` : si une zone de parking tombait pile sur la route du haut, OK ; sinon en ajouter 2-3 le long de cette route dans `parkingZones.ts` pour que des voitures s'y garent aussi.

## 2. Plus de distance entre voitures (`CityTraffic.tsx`)

Constantes actuelles trop serrées :
- `SAFE_GAP = 70` (distance désirée)
- `BRAKE_GAP = 140` (début de freinage)
- `CROSS_LANE_RADIUS = 50` (anti-collision intersections)

Action : passer à des valeurs plus aérées, type :
- `SAFE_GAP = 110`
- `BRAKE_GAP = 220`
- `CROSS_LANE_RADIUS = 75`
- `MIN_SPEED_RATIO = 0.18` (descend un poil plus bas en cas de bouchon, évite les blocages)

Ça augmente la « bulle » autour de chaque voiture sans tout figer.

## 3. Taxis rivaux colorés visibles sur la map

Aujourd'hui `CityCompetitors.tsx` n'affiche que des **bâtiments QG fixes**. Aucune voiture rivale ne roule.

Action — ajouter une couche **taxis rivaux** dans `CityTraffic.tsx` (même SVG, même réseau de routes pour rester cohérent) :

- Lire la liste des concurrents (id, color, bankrupt, taxiCount) via un event/window store partagé exposé par `CityCompetitors`. Le plus simple sans gros refactor : `CityCompetitors` publie `window.__jceCompetitors = [...]` à chaque update + dispatch `jce:competitors-changed`, et `CityTraffic` écoute.
- Dans `CityTraffic`, créer un nouveau set d'entités `RivalTaxi` (parallèle aux `CarState`, partageant les mêmes `pathRefs` / `lanes`) :
  - 1 à 2 taxis par concurrent vivant (max ~10 taxis rivaux au total pour rester léger).
  - Sprite simple : un rectangle de taxi avec `fill = competitor.color`, contour noir, petit damier blanc sur le toit pour bien dire « taxi ».
  - Roule sur n'importe quelle `ROADS[i]` autorisée, comme les civils, avec le même système de freinage / lanes / feux rouges → ils se mêlent au trafic.
  - Disparaissent (fade out) quand le concurrent passe `bankrupt`.
- Petite étiquette flottante optionnelle au-dessus (1ʳᵉ lettre du concurrent) pour les identifier sans surcharger.

## 4. Validation

Avant de clôturer :
- Rafraîchir la map et vérifier visuellement qu'au moins 1-2 voitures roulent sur la route du haut.
- Vérifier qu'on n'a plus de voitures qui se touchent sur les axes principaux.
- Vérifier qu'on voit au moins 4 taxis colorés (un par couleur de QG actif) circuler.
- Vérifier qu'un concurrent en faillite voit ses taxis disparaître.

---

## Détails techniques

- Fichiers touchés : `src/game/CityTraffic.tsx` (principal), `src/game/CityCompetitors.tsx` (publication de la liste), éventuellement `src/game/parkingZones.ts` (ajout de zones sur la route du haut).
- Aucune migration DB, aucune dépendance ajoutée.
- Pas de modif du gameplay joueur / missions / économie.
