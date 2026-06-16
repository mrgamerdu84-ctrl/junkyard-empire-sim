
# Junky City Empire — Ville 3D Vivante

## Objectif

Passer de la map 2D actuelle à une vraie ville 3D semi-isométrique premium où **tout bouge** : voitures qui suivent les routes, dépanneuses, grues, employés animés, fumée, cycle jour/nuit. Conserver la logique de gameplay déjà en place (économie, bâtiments cliquables, construction par clics, revenus passifs).

## Stack technique

- **Three.js + @react-three/fiber + @react-three/drei** (rendu 3D performant dans React, compatible mobile).
- Géométries primitives stylisées (boxes, cylinders) + matériaux PBR légers — pas de modèles GLB lourds, pour garder le build rapide et l'aspect "semi-réaliste stylisé" type Retown.
- Animations via `useFrame` (boucle render) — pas de lib externe.
- Palette tokenisée dans `src/styles.css` : noir, gris métal, orange, doré (déjà présente).

## Architecture fichiers

```
src/
  routes/index.tsx           → HUD 2D (argent, niveau, file véhicules) + <Canvas> 3D
  game/
    City3D.tsx               → Scene principale <Canvas>, lumières, cycle jour/nuit
    roads.ts                 → Définition des routes (waypoints, splines)
    Ground.tsx               → Sol, trottoirs, marquages routiers
    Roads.tsx                → Rendu des routes
    TrafficCar.tsx           → 1 voiture qui suit une spline en boucle
    Traffic.tsx              → Spawn de N voitures sur les routes
    TowTruck.tsx             → Dépanneuse qui va chercher un véhicule et le ramène
    Crane.tsx                → Grue animée (rotation bras, câble)
    Worker.tsx               → Employé qui marche en boucle autour d'un bâtiment
    Smoke.tsx                → Particules de fumée (cheminées, casse)
    buildings/
      Casse.tsx
      StationLavage.tsx
      Garage.tsx
      Casino.tsx
      CentreCommercial.tsx
      Logistique.tsx
    BuildingZone.tsx         → Wrapper 3D cliquable + label HTML (Html de drei) qui réutilise le style "Premium Glass Tycoon" actuel
    gameStore.ts             → État centralisé (argent, niveau, zones, file véhicules) — extrait de index.tsx
```

## Monde vivant (ce qui bouge)

1. **Trafic urbain** — 8 à 12 voitures suivent des splines `CatmullRomCurve3` qui dessinent les routes. Vitesse variable, orientation tangente à la courbe, feux stop rouges à l'arrière qui s'allument au ralentissement.
2. **Dépanneuses** — 2 dépanneuses font des allers-retours entre la zone Logistique et la Casse, avec une voiture accidentée chargée à l'arrière au retour.
3. **Grue de la casse** — bras qui tourne, câble qui descend/remonte, voiture soulevée puis déposée dans la pile.
4. **Station de lavage** — voiture entre, jets d'eau (plans semi-transparents animés), mousse, sort propre de l'autre côté.
5. **Employés** — petits personnages capsule qui patrouillent autour du Garage et du Centre Commercial.
6. **Fumée** — particules instanced sur les cheminées de la casse et du garage.
7. **Cycle jour/nuit** — lumière directionnelle qui tourne (3 min réelles = 1 cycle), couleur ambient qui passe orange → bleu nuit, lampadaires et néons des bâtiments qui s'allument la nuit (emissive maps).

## Routes & circulation

- Définir un graphe de routes en grille avec quelques courbes, sous forme de splines fermées.
- Chaque voiture reçoit : `curve`, `offset` (0→1), `speed`. À chaque frame : `offset += speed * dt`, position = `curve.getPoint(offset)`, rotation = tangente.
- Voies doubles : deux splines parallèles, sens opposés.
- Intersections gérées simplement par décalages temporels (pas de vraie IA de feux pour V1, mais voitures qui ralentissent si une autre est devant sur la même spline → check distance).

## Bâtiments cliquables (logique conservée)

- Chaque bâtiment 3D est wrappé dans `<BuildingZone>` qui :
  - Affiche un mesh 3D (groupe de boxes stylisées + détails).
  - Superpose un label HTML via `<Html>` de drei, reprenant le style **Premium Glass Tycoon** déjà conçu (verrouillé / achetable / chantier / fini).
  - Gère le clic → `ClicSurBatiment(id)` du store (achat → clics de construction → opérationnel → revenus passifs).
- Les 6 bâtiments du brief sont placés sur la map. Les zones V2/V3 restent verrouillées tant que le niveau / argent requis n'est pas atteint.

## HUD & UX

- Barre supérieure premium : Argent, Niveau, Ferraille, bouton mute, indicateur jour/nuit.
- File de véhicules entrants (déjà existante) en bas à droite avec Accepter / Rejeter.
- Notifications toast (sonner) pour gains, déblocages, niveau up.
- Responsive : `<Canvas>` plein écran, HUD en overlay absolute.

## Progression V1 → V3

- **V1 (cette itération)** : Casse + Station de lavage + Garage opérationnels, monde vivant complet (trafic, dépanneuses, grue, employés, jour/nuit).
- **V2** : Casino + Centre commercial débloquables, plus d'employés, plus de trafic.
- **V3** : Seconde zone de ville (déplacement caméra), seconde casse, skyline étendue.

Le code de V1 prévoit déjà les hooks (zones verrouillées, conditions de déblocage) pour V2/V3 sans refactor.

## Performance mobile

- Instancing (`<Instances>` de drei) pour les voitures de trafic et les arbres/lampadaires.
- `dpr={[1, 1.5]}` sur le Canvas, ombres uniquement sur la lumière principale, shadow map 1024.
- Pas de post-processing lourd ; éventuellement un léger tone mapping ACES.

## Dépendances à ajouter

`three`, `@react-three/fiber`, `@react-three/drei`. Pas d'assets binaires externes — tout est géométrique.

## Hors scope (à confirmer si tu veux les inclure plus tard)

- Sons / musique d'ambiance.
- Sauvegarde en base (Lovable Cloud) — pour l'instant état en mémoire.
- Modèles GLB réalistes de voitures (alternative aux formes stylisées).

Dis-moi si je lance la V1 telle quelle, ou si tu veux ajuster (ex. inclure sons, ou démarrer avec modèles GLB de voitures).
