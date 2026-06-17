# Rendre la ville vivante (taxis, PNJ, trafic, jour/nuit)

## 1. Nettoyage zone "village" (haut de la map)
Dans `CityTraffic.tsx` et `TaxiTycoon.tsx` :
- Définir une `NO_SPAWN_ZONE` couvrant toute la bande supérieure (villages).
- Filtrer le spawn des clients, PNJ, voitures et camions pour qu'aucun n'apparaisse ni ne traverse cette zone.
- Supprimer les routes/segments qui passent sur les maisons du village.

## 2. Suppression de l'ancien QG + nouveau QG "garage industriel chic"
- Retirer `hq-taxi-depot.png` du rendu (asset gardé mais plus utilisé, ou supprimé).
- Nouveau QG dessiné en SVG vue du ciel : grand toit plat gris béton, marquages jaunes au sol, rangée de places de parking pour taxis (visibles, taxis garés visibles quand inactifs), néons jaunes/noirs, enseigne "TAXI HQ", héliport optionnel niveau max.
- Le QG évolue visuellement avec les upgrades de la boutique existante (+ places de parking visibles selon `hqCapacityLvl`, néons plus lumineux selon `hqRevenueLvl`, etc.).

## 3. Feux rouges automatiques + code de la route
Nouveau système dans `CityTraffic.tsx` :
- Détecter automatiquement chaque intersection (croisement de routes).
- À chaque intersection, créer un objet `TrafficLight` avec cycle vert 8s / orange 2s / rouge 10s, déphasé entre axes N-S et E-O.
- Avant de franchir une intersection, chaque véhicule (taxi, voiture, camion) regarde le feu de sa direction :
  - vert → passe
  - orange → freine si encore loin, passe sinon
  - rouge → s'arrête à la ligne d'arrêt (zone tampon ~20 px).
- Passages piétons : zones marquées juste avant chaque feu. Quand feu véhicule = rouge, le feu piéton est vert → les PNJ peuvent traverser. Les véhicules ne redémarrent que si le passage est libre.
- Respect de la priorité : à un croisement sans feu (ronds-points / petites rues), céder à la voiture déjà engagée.

## 4. Sprites vue du ciel uniformes
Tous les acteurs en vue de dessus (top-down) cohérente avec les taxis :
- PNJ : petit cercle/forme avec tête + épaules vus du dessus (SVG, ~14 px), couleurs variées.
- Voitures civiles : rectangles arrondis vue du ciel avec pare-brise (différentes couleurs/tailles).
- Camions : rectangle plus long avec cabine + remorque.
- Feux rouges : pictogramme vu du ciel (3 pastilles rouge/orange/vert sur poteau, ombre courte).
- Lampadaires : petit cercle lumineux sur trottoir, halo qui s'allume la nuit.

## 5. Cycle jour/nuit 5 minutes
Nouveau hook `useDayNightCycle` :
- Cycle complet 300 s : aube → jour → crépuscule → nuit.
- Overlay SVG plein écran teinté (transparent jour, bleu nuit ~rgba(10,20,50,0.55) la nuit) au-dessus de la map sous l'UI.
- Lampadaires et néons du QG : halo `<radialGradient>` activé quand `phase ∈ {dusk, night, dawn}`.
- Phares des voitures la nuit : 2 petits cônes jaunes devant le véhicule.
- Indicateur d'heure (petite horloge en haut) optionnel.

## 6. Boucle temps réel
- Un seul `requestAnimationFrame` central calcule `dt` (delta-time en secondes) et le passe à : véhicules, PNJ, feux, cycle jour/nuit, clients.
- Tous les mouvements deviennent `pos += speed * dt` au lieu de pas fixes → indépendant du framerate, sensation "temps réel".

## 7. PNJ piétons (densité moyenne)
- ~25-40 PNJ actifs simultanément sur les trottoirs.
- Marchent le long des trottoirs, traversent uniquement aux passages piétons quand feu piéton vert.
- Spawn/despawn aux bords de la map (jamais dans la zone village).

## Détails techniques

**Fichiers touchés**
- `src/game/CityTraffic.tsx` : intersections, feux, passages piétons, sprites top-down, PNJ.
- `src/game/TaxiTycoon.tsx` : nouveau QG SVG, suppression import `hq-taxi-depot`, intégration cycle jour/nuit overlay, respect des feux par les taxis.
- `src/game/adminConfig.ts` : nouvelles options `dayNightSpeed`, `pedestrianDensity`, `trafficLightsEnabled`.
- `src/game/AdminPanel.tsx` : toggles correspondants.
- (optionnel) suppression de `src/assets/hq-taxi-depot.png.asset.json`.

**Structures clés**
```text
TrafficLight { x, y, axis: 'NS'|'EO', state: 'green'|'orange'|'red', t: number }
Intersection { x, y, lights: TrafficLight[2], crosswalks: Crosswalk[4] }
Pedestrian { x, y, path, speed, waitingAt?: Crosswalk }
DayNight { t: 0..1, phase: 'dawn'|'day'|'dusk'|'night' }
```

**Comportement véhicule (pseudo)**
```text
nextLight = lightAhead(vehicle, 60px)
if nextLight.state === 'red'  → target speed 0 at stopLine
if nextLight.state === 'orange' && dist > brakeDist → slow
else → cruise
if crosswalkAhead has pedestrian crossing → stop
```

## Hors scope (à confirmer après)
- Klaxons / sons d'ambiance nuit.
- Météo (pluie, neige).
- Voitures de police / urgences avec priorité.
