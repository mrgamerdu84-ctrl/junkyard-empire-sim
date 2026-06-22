
## 1. Couper le bruit des sirènes

- `src/routes/index.tsx` : supprimer le montage de `<AmbientSirens />` (import + balise). Plus aucun son d'ambulance/pompiers/police.

## 2. Taxis rivaux : position, ombre, voie

Dans `src/game/CityRivalTaxis.tsx` :
- Retirer le `rotate(-90)` interne qui désaxe le sprite par rapport à la route.
- Sprite custom (image uploadée par l'utilisateur, nez vers le haut) : appliquer un seul `rotate(90)` sur l'`<image>`, pas sur le groupe ni sur l'ombre.
- Ombre : `ellipse cx=0 cy=0 rx=9 ry=3 opacity=0.3` centrée sous la voiture, plus de gros calque noir qui dépasse.
- `LANE_HALF` alterné selon le sens (`flip`) : les rivaux qui descendent prennent la voie de droite, ceux qui montent l'autre voie — fini les voitures sur le trottoir.

## 3. Musique : démarrage immédiat, plus de coupure "heure d'infos"

Dans `src/components/TaxiRadio.tsx` :
- Supprimer le mode `newsHour` (les 10 premières minutes de chaque heure qui forcent toutes les stations en TTS). Les infos restent uniquement sur "Junky Infos".
- `DJ_FIRST_DELAY_MS` → 0, lancer `a.play()` dès le clic sur une station musicale. Le DJ ne parle plus en intro.

## 4. Synthèse vocale sur mobile

- Dans `speak()`, appeler `/api/public/radio-tts` **sans exiger d'access token** (la route est publique). Si la route renvoie un MP3, on le joue → fonctionne sur Android/iOS.
- `speechSynthesis` reste un dernier recours desktop uniquement.

## 5. Concurrents actifs sur la map (gros morceau)

Aujourd'hui les rivaux roulent en boucle décorative et les missions du joueur (points verts/jaunes/bleus) n'existent que pour lui. Nouveau comportement :

### 5a. Couleur du joueur
- Dans le menu / panel admin, ajouter un sélecteur **"Ma couleur de compagnie"** (palette 8 couleurs). Stocké dans `localStorage` (`jce.player.color`) et exposé sur `window.__jcePlayerColor` + event `jce:player-color-changed`.
- Les marqueurs de mission (pastilles dans `TaxiTycoon.tsx`) prennent cette couleur tant qu'aucun concurrent n'a "réservé" la mission. Verre/jaune/bleu actuels deviennent un dégradé de tailles selon le tarif, pas selon la nature.

### 5b. Concurrents qui chassent les missions
Nouveau module `src/game/CompetitorDispatcher.tsx` :
- Écoute la liste des missions disponibles publiée par `TaxiTycoon` (nouvel event `jce:jobs-changed` avec `{id, x, y, fare, color, takenBy}`).
- Pour chaque concurrent **actif et non-faillite**, si un de ses taxis rivaux est libre, il "vise" la mission la plus proche non encore prise. Il calcule une ETA (distance / vitesse).
- Si l'ETA du concurrent < ETA du joueur (= distance joueur/mission convertie), il **revendique** la mission : la pastille passe à sa couleur ; si le concurrent arrive avant le joueur, il encaisse la course et le joueur ne touche rien (event `jce:job-stolen`).
- Inversement, si le joueur arrive en premier, il "vole" la mission au concurrent : la pastille reprend la couleur du joueur, le concurrent perd son ETA.

### 5c. Rivaux qui sortent du QG, vont chercher le client, déposent, reviennent
Refonte `CityRivalTaxis.tsx` :
- Plus de boucle décorative sur `ROADS`. Chaque concurrent a un pool de N taxis (`taxiCount`), chacun avec un état : `IDLE_AT_HQ → GO_TO_PICKUP → GO_TO_DROPOFF → RETURN_TO_HQ → IDLE`.
- Les positions sont interpolées le long du segment QG ↔ mission ↔ destination ↔ QG (lignes droites suffisent pour rester simple ; pas besoin de pathfinding sur les routes réelles à ce stade).
- Vitesse exprimée en `worldUnits/s`, identique à celle du taxi joueur pour que la course soit équitable.
- Quand un taxi rival arrive au pickup avant le joueur → encaisse la mission, dépose, rentre au QG, devient `IDLE`.
- Quand un taxi rival se fait griller → fait demi-tour, retour QG.

### 5d. Rendu visuel
- Les taxis rivaux restent visibles sur toute la map (sprite custom + ombre propre cf. point 2).
- Une petite ligne pointillée discrète relie chaque taxi rival à sa cible courante (option, désactivable via admin).
- Le compteur HUD ajoute "Missions volées : X" et "Missions arrachées aux rivaux : Y".

### 5e. État partagé
- Source de vérité dans `TaxiTycoon.tsx` : missions, statut, propriétaire courant. Émet `jce:jobs-changed` à chaque tick.
- Source de vérité concurrents : `CityCompetitors` étendu pour exposer `hqX, hqY` (déjà existant) + `taxiCount, color, vehicleUrl`.
- `CompetitorDispatcher` orchestre, `CityRivalTaxis` se contente d'afficher l'état que le dispatcher publie sur `window.__jceRivalTaxis` + event `jce:rival-taxis-changed`.

## Fichiers modifiés / créés

- `src/routes/index.tsx` (retirer sirènes, monter `<CompetitorDispatcher />`)
- `src/game/CityRivalTaxis.tsx` (rendu pur, états dispatcher)
- `src/game/CompetitorDispatcher.tsx` **(nouveau)**
- `src/game/CityCompetitors.tsx` (expose hqX/hqY/taxiCount/color au dispatcher)
- `src/game/TaxiTycoon.tsx` (émet `jce:jobs-changed`, écoute `jce:job-stolen`, couleur joueur sur les pastilles, gestion "mission revendiquée par un rival")
- `src/game/AdminPanel.tsx` (sélecteur "Ma couleur de compagnie")
- `src/components/TaxiRadio.tsx` (suppression `newsHour`, démarrage immédiat, TTS sans token)
