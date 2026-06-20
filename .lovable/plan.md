- Stratégie : 4 lots successifs

Ta demande est massive. Pour éviter de tout casser et garder le jeu jouable à chaque étape, on avance lot par lot. Tu valides chaque lot avant de passer au suivant.

---

### LOT 1 — Trafic réaliste + Piétons + Véhicules SVG (on commence ici)

**a) Véhicules en SVG vus du dessus (avant pointant vers le haut)**

- Composants SVG dédiés : `CarSvg`, `TruckSvg`, `MoneyTruckSvg`, `GignTruckSvg`, `PoliceSvg`, `AmbulanceSvg`, `FiretruckSvg`, `TaxiSvg`.
- Détails : cabine, pare-brise, roues, gyrophares (animés pour police/GIGN/ambulance/pompiers), bandes réfléchissantes pour fourgons de fonds/GIGN.
- Taille uniforme 36px (règle déjà en place). Rotation appliquée selon le cap du véhicule.

**b) Code de la route strict**

- Refonte de `CityTraffic.tsx` : IMPORTANT pour la refonte du trafic : Garde exactement le tracé actuel des routes, le dessin de la carte et l'emplacement de tous mes bâtiments existants dans CityTraffic.tsx (et les fichiers liés). 

Ne recrée pas une nouvelle carte de zéro. Modifie uniquement la logique de déplacement des voitures à l'intérieur du code actuel pour séparer les voies gauche/droite et ajouter le respect des feux et des piétons.

&nbsp;

**c) Intersections avec feux de signalisation virtuels**

- Chaque intersection a un cycle 2 phases (NS vert / EO rouge, puis inverse) de ~10s + ~2s orange.
- Petits poteaux de feux dessinés en SVG à chaque coin.
- Les véhicules s'arrêtent à la ligne d'arrêt si rouge/orange.

**d) Passages piétons**

- Dessinés (rayures blanches) à proximité de chaque intersection.
- Quand un piéton est sur un passage, les voitures de la voie concernée s'arrêtent.
- Les piétons ne traversent QUE sur ces passages.

**e) Pathfinding piétons sur trottoirs**

- Chaque piéton suit un graphe "trottoirs" (offset fixe du bord de route, côté droit selon sens de marche).
- Aux intersections : choix aléatoire de tourner ou continuer; pour traverser ils rejoignent le passage piéton le plus proche.
- Suppression des positions actuelles qui dérapent au milieu de la route.

**f) Radars de vitesse**

- Petits SVG "radar" posés sur quelques tronçons.
- Si un véhicule du joueur (ou IA) dépasse la vitesse limite du tronçon : flash blanc 150ms + amende → revenu pour la mairie/casse (nouveau compteur `cityRevenue` ou ajout au cash selon ton choix).

---

### LOT 2 — Refonte radio complète

- Remplacement des URLs musicales : mix stations SomaFM (streaming) + 6-8 pistes Pixabay/FMA No-Copyright (boucles courtes) pour les stations locales.
- DJ TTS amélioré : annonce nom de station + titre + transition fluide (déjà fait pour la séquence DJ→musique, on étend avec plus de phrases variées).
- **Flash Infos** toutes les 10 min réelles : jingle court (SVG/synth simple ou TTS), puis récap des derniers événements (`recentEvents` queue : braquages, faillites concurrents, gros profits).
- **Météo réelle** via Open-Meteo (gratuit, sans clé) + géoloc navigateur (fallback Paris). Cache 30 min.
- **Horoscope** : généré dynamiquement (12 signes × textes prédéfinis tirés au hasard par jour, seed = date).
- **Programme TV** : généré dynamiquement (templates plausibles par tranche horaire).

---

### LOT 3 — Concurrents IA + Économie

- Table `competitors` (Lovable Cloud) : id, nom, qg_x, qg_y, cash, parts_marché, ferraille_total, statut (actif/faillite).
- Seed initial : 3-4 concurrents avec QG fixes sur la carte (icônes 🏢 distinctes par concurrent).
- IA tick (toutes les X secondes de jeu) : chaque concurrent gagne/perd cash et ferraille selon un profil.
- Comparaison au joueur : si joueur dépasse seuils → concurrent vers faillite (animation, libération d'actifs revendables).
- Affichage classement + icônes QG persistantes.

---

### LOT 4 — Cycles de trafic + Criminalité équilibrée

- Densité trafic = f(jour, heure) : pointes 7h30-9h / 16h30-18h30 en semaine, fluide week-end, vacances scolaires (multiplicateur 0.5).
- Accidents et contrôles police : passage en événements rares (proba/heure faible, configurable).
- Module criminalité équilibré : braquages plus probables la nuit/zones isolées, intervention police/GIGN avec fusillade scriptée si flagrant délit.

---

## Détails techniques (Lot 1)

Fichiers principalement touchés :

- `src/game/CityTraffic.tsx` — refonte voies, feux, passages piétons, pathfinding piétons, radars
- `src/game/TaxiTycoon.tsx` — branchement nouveaux SVG véhicules, compteur amendes radar
- Nouveaux : `src/game/vehicles/CarSvg.tsx`, `TruckSvg.tsx`, `MoneyTruckSvg.tsx`, `GignTruckSvg.tsx`, `PoliceSvg.tsx`, `AmbulanceSvg.tsx`, `FiretruckSvg.tsx`
- Nouveau : `src/game/traffic/TrafficLights.tsx` (logique cycle + rendu)
- Nouveau : `src/game/traffic/Crosswalks.tsx`
- Nouveau : `src/game/traffic/SpeedRadar.tsx`

Aucune migration DB nécessaire pour le Lot 1 (les compteurs amendes peuvent rester locaux pour l'instant, ou être ajoutés au profil à la fin si tu veux qu'ils persistent).

---

**Je commence par le Lot 1 dès que tu valides.** Les lots 2, 3, 4 viendront ensuite, chacun avec son propre plan détaillé.