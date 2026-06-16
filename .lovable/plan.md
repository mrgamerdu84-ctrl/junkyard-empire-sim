## Objectif

Ajouter une page "Règles du jeu" accessible en jeu, qui explique clairement le fonctionnement à Niki (et à tout nouveau joueur) — gameplay uniquement, sans jargon technique.

## 1. Bouton d'accès

Ajout d'un bouton 📖 dans le HUD, à côté du bouton ⚙ Admin (en haut à droite). Au clic, ouverture d'un panneau plein écran (overlay sombre + carte centrale) avec les règles. Bouton de fermeture × en haut.

## 2. Contenu du panneau Règles

Sections, en français, ton clair et concis :

- **🎯 But du jeu** — Faire prospérer ta compagnie de taxis : achète des voitures, prends des clients, gagne de l'argent, améliore ton QG.
- **🚖 Les taxis** — Tu en achètes au QG. Ils sortent automatiquement chercher les clients. Tu peux limiter combien sortent en même temps (Panel Admin → Trafic).
- **👥 Les clients** — Ils apparaissent au bord des routes (📍 point bleu). Le taxi le plus proche est envoyé. Le client a 35 secondes de patience avant de partir.
- **💰 Les courses** — Le tarif dépend de la distance et du niveau de ton QG. Tu encaisses à l'arrivée du client.
- **🏛️ Le QG** — 5 niveaux (Garage abandonné → QG Taxicorp). Plus haut = plus de taxis autorisés, meilleurs tarifs, clients plus fréquents.
- **📜 Les contrats** — Missions optionnelles (X clients servis, Y $ gagnés, série sans rater). Récompense en cash + bonus temporaire ×2 sur les tarifs.
- **⚙ Panel Admin** — Permet d'ajuster en direct : nombre de taxis actifs max, cooldown de sortie, position et taille du QG, fréquence des clients, etc.
- **💡 Astuces** — Réguler le trafic pour éviter les embouteillages ; placer le QG près d'une zone dense ; améliorer le QG dès que possible.

## 3. Style visuel

Même esprit que le Panel Admin (fond `#14171c`, accent jaune `#f5c542`, bord arrondi, typo system-ui). Lisible sur mobile et desktop (largeur max ~520px, scroll vertical).

## 4. Fichiers touchés

- `src/game/RulesPanel.tsx` *(nouveau)* — composant overlay + contenu des règles.
- `src/game/TaxiTycoon.tsx` — ajout du bouton 📖 dans le HUD et montage du `<RulesPanel />`.

Pas de changement de logique de jeu, pas de modification de l'export ZIP.
