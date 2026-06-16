## Le problème

La V1 3D a remplacé la carte `citymap.jpg` (que tu aimais) par un sol noir vide et des cubes. Je rétablis ta map et j'ajoute par-dessus une vraie couche 3D haute qualité — sans toucher au gameplay.

## Approche : hybride 2D + 3D superposé

```text
┌──────────────────────────────────────┐
│  HUD topbar (niveau / argent / XP)   │
├──────────────────────────────────────┤
│  ░░ citymap.jpg (background image) ░░│  ← couche 1 : ta carte
│  ░░  + tint jour/nuit                │
│  ─── Canvas Three.js transparent ────│  ← couche 2 : 3D animée
│      • voitures détaillées           │
│      • dépanneuses                   │
│      • lampadaires qui éclairent     │
│      • arbres, fumée                 │
│  ─── Enseignes Premium Glass ────────│  ← couche 3 : labels HTML
├──────────────────────────────────────┤
│  Toolbar (boutique / construction…)  │
└──────────────────────────────────────┘
```

Pourquoi : ta carte reste intacte et nette, et la 3D vit dessus. Plus jamais d'écran noir.

## Ce que je fais

### 1. Restaurer la carte
- Remettre `citymap.jpg` en `background-image` de `.jce-map` (cover, centrée).
- Garder les enseignes Premium Glass en `position: absolute` aux mêmes coordonnées `top%/left%` qu'avant.

### 2. Calibrer les routes sur la map
- Charger l'image une fois pour repérer les axes principaux (ronds-points, boulevards visibles).
- Définir manuellement des splines `CatmullRomCurve3` qui suivent exactement les routes visibles (4 boucles principales + connecteurs).
- Repère du plan 3D = repère pourcentage de la map, pour que tout reste aligné en redimensionnement.

### 3. Overlay 3D transparent
- `<Canvas>` en `position: absolute; inset: 0; pointer-events: none` avec `gl={{ alpha: true }}` et `scene.background = null`.
- Caméra orthographique top-down très légèrement inclinée (≈ 15°) pour donner du volume sans casser la perspective de la map.
- `pointer-events: auto` uniquement sur les enseignes (clic bâtiments).

### 4. Vraies voitures 3D (≈ 12-16)
- Carrosserie + capot bas + pare-brise inclinés + 4 roues cylindriques + jantes chromées + phares blancs émissifs + feux arrière rouges.
- 8 palettes de peinture (rouge, jaune taxi, bleu, blanc, noir, vert, gris, orange).
- Vitesse variable, rotation tangente à la spline, ombre projetée via `ContactShadows`.

### 5. Dépanneuses (2)
- Cabine + plateau + bras de levage + épave transportée + gyrophare orange clignotant (emissive pulsé).
- Navette entre la Casse et la Logistique sur une spline dédiée.

### 6. Lampadaires (vrais, qui éclairent)
- Mât + bras + abat-jour, alignés le long des routes (≈ 18 lampadaires).
- Halo `emissive` + `pointLight` réel qui s'allume la nuit (intensité pilotée par le cycle jour/nuit).

### 7. Décor
- Arbres bas-poly (tronc cylindrique + 2 cônes verts) placés en bordure.
- Cheminée de fumée animée près de la Casse (particules sphériques montantes, fading).
- Ouvriers (gilet jaune + casque) qui patrouillent autour des bâtiments actifs.

### 8. Cycle jour/nuit
- Sur la map : overlay CSS de teinte (bleu nuit ↔ transparent) qui suit la phase.
- Sur la 3D : lumière directionnelle (soleil), ambient, et `pointLight` des lampadaires qui s'allument.
- Cycle 3 min.

### 9. Performances
- `dpr={[1, 1.5]}`, ombres uniquement sur la directionnelle (shadow map 1024).
- `Environment preset="city"` pour les reflets métalliques sans coût HDR lourd.
- Pas d'effet de post-process.

## Ce que je NE change pas
- Le gameplay (`gestionClicBatiment`, états, XP, niveau, argent).
- Les enseignes Premium Glass Tycoon (mêmes styles, mêmes positions).
- Le HUD topbar et la toolbar du bas.

## Fichiers touchés
- `src/game/City3D.tsx` — réécrit en overlay transparent + splines calées sur la map + détails 3D améliorés.
- `src/routes/index.tsx` — remet `citymap.jpg` en background, repositionne le Canvas en overlay, garde la grille `top%/left%` pour les enseignes.

## Hors scope
- Pas de modèles GLB lourds (perf mobile).
- Pas de son.
- Pas de modification de la carte elle-même.

Validation après build : capture d'écran preview + vérif que les voitures suivent visiblement les routes de la map.
