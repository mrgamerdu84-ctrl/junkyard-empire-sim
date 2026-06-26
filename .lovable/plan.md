# Refonte gameplay — My Taxi World Rivalité v2 (Tycoon Simulation)

On garde la ville, les QG, les territoires, la radio et le moteur véhicules. On change le **cœur de la boucle** : tu ne cliques plus sur des courses une à une, tu **gères une compagnie** qui tourne toute seule pendant que tu prends des décisions stratégiques.

## La nouvelle boucle de jeu

```text
┌──────────────────────────────────────────────────────────┐
│  TES TAXIS ROULENT EN AUTONOMIE (passif temps réel)      │
│           ↓                                              │
│  Tu DÉCIDES : flotte, tarifs, embauches, contrats        │
│           ↓                                              │
│  Événements ville (météo, heure de pointe, grèves…)      │
│           ↓                                              │
│  Bilan journalier → réinvestir / s'étendre / saboter     │
└──────────────────────────────────────────────────────────┘
```

Tu peux toujours **prendre le volant** d'un taxi quand tu veux (mode "tournée perso" pour booster les revenus du jour), mais ce n'est plus obligatoire.

## Les 5 piliers du nouveau gameplay

### 1. Flotte vivante & autonome
- Chaque taxi possède : km au compteur, état mécanique (0-100%), niveau de carburant, chauffeur assigné, livrée.
- Les taxis sortent du QG à l'heure de leur shift, prennent des clients réels sur la carte, rentrent quand fatigués / cassés / pleins.
- **Tu vois ta flotte tourner sur la carte** comme aujourd'hui, mais c'est **ta gestion** qui détermine si ça rapporte.

### 2. Chauffeurs RH (au lieu d'employés génériques)
- Chaque chauffeur a : nom, photo, **3 stats** (Conduite / Service client / Endurance), salaire, moral.
- Bons chauffeurs = + pourboires, - accidents. Mauvais = bouffent la marge.
- Système de **shifts** (jour/nuit), congés, formations payantes pour upgrader les stats.
- Risque de **démission** si moral trop bas (paie/horaires).

### 3. Contrats B2B (cœur de la profondeur)
Au lieu de chasser le client unique, tu signes des **contrats récurrents** :
- Hôtel 4 étoiles → 30 courses/jour garanties, tarif fixe -10%.
- Aéroport → grosses courses mais exige 5 taxis dispo H24.
- Boîte de nuit → courses de nuit uniquement, gros pourboires.
- Hôpital → priorité absolue, pénalités si retard.

Chaque contrat = **objectifs hebdo** à tenir sinon rupture + perte de réputation.

### 4. Économie & décisions qui pèsent
- **Tarifs dynamiques** : tu fixes prix de base, surcharge nuit, surcharge pluie. Trop haut = clients vont chez les rivaux.
- **Carburant** : prix qui fluctue, station essence à acheter pour économiser.
- **Assurances & taxes** : poste de coût mensuel réel.
- **Crédit bancaire** : emprunter pour acheter une 2e flotte, avec intérêts.
- **Bilan journalier** (modal 6h du matin) : recettes / dépenses / bénéf net / cash dispo.

### 5. Expansion par quartier (réutilise les territoires existants)
- Pour s'implanter dans un quartier : ouvrir une **station-relais** (achat foncier + permis mairie).
- Plus tu as de stations, plus ta couverture est large, plus tu rafles de courses face aux rivaux.
- Les rivaux font pareil → vraie guerre économique, pas juste un compteur de courses.

## Événements simulation (ton réaliste)

- **Heure de pointe** matin/soir → demande x3 mais embouteillages.
- **Pluie/neige** → demande +50% mais risque accident +30%.
- **Grève transports** → jackpot d'une journée.
- **Contrôle police** → amendes si chauffeurs en infraction.
- **Panne mécanique aléatoire** si entretien négligé.
- **Inspection mairie** → ferme un taxi si pas en règle.

## Ce qu'on garde tel quel

- Carte ville + QG verrouillés + rivaux qui roulent.
- Radio Célébrer / Droit Libre.
- Territoires (mais transformés en zones de couverture économique).
- Mode "je conduis moi-même" (devient un bonus, pas l'obligation).
- Personnel existant (réutilisé comme base RH).
- Braquages / camion blindé (deviennent **événements aléatoires** qui menacent tes recettes).

## Ce qui disparaît

- Le clic obligatoire sur chaque course.
- La compétition hebdo par compte de courses (remplacée par parts de marché €).
- Le bouton "spawn taxi" instantané.

## Détails techniques

Nouveaux modules :
- `src/game/company.ts` — état compagnie (cash, dette, réputation, parts de marché).
- `src/game/fleet.ts` — gestion taxis individuels (état, shift, chauffeur).
- `src/game/contracts.ts` — moteur de contrats B2B + résolution hebdo.
- `src/game/economy.ts` — tarifs, carburant, taxes, bilans.
- `src/game/simTick.ts` — boucle de simulation 1 tick = 1 minute jeu, génère courses auto.
- `src/game/eventsSim.ts` — événements aléatoires (pluie, grève, panne…).

Refonte UI :
- Console basse → onglets **FLOTTE / RH / CONTRATS / FINANCES / EXPANSION**.
- Modal **Bilan 6h** automatique chaque "jour" jeu.
- Suppression des boutons "course rapide" / "spawn".
- La carte reste le visuel central, mais devient surtout **informationnelle** (où sont mes taxis, où sont les rivaux, où la demande est forte → heatmap).

## Migration douce
Pas de wipe : ton cash actuel, ta flotte et tes territoires conquis sont convertis automatiquement (1 taxi possédé = 1 taxi dans la nouvelle flotte avec chauffeur par défaut).

---

**Si tu valides**, j'attaque dans cet ordre :
1. Moteur de simulation + flotte autonome (le cœur).
2. RH chauffeurs + contrats B2B.
3. Économie (tarifs, carburant, bilan journalier).
4. Expansion stations + événements.
5. Refonte UI console + heatmap demande.

Dis-moi si je pars là-dessus, ou ce que tu veux ajuster avant.
