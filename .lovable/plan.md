## 1. Météo strictement locale

Côté code, la météo utilise déjà la géoloc du navigateur — donc pour la majorité des joueurs c'est bien leur ville (Marseille, Lyon, etc.) qui est annoncée. Le souci, c'est le **fallback Paris** quand la géoloc est refusée ou échoue : ça donne une fausse météo.

**Changement dans `src/components/TaxiRadio.tsx` :**
- Supprimer le fallback `tryFetch(48.8566, 2.3522, "Paris")`.
- Si la géoloc est refusée / indisponible / timeout → `weatherRef.current = null` et le DJ dit *« météo indisponible pour le moment »* (FR) / *« weather unavailable right now »* (EN) au lieu d'inventer Paris.
- Petit bouton discret « 📍 Activer la météo locale » dans le panneau radio quand la permission est refusée, qui re-déclenche `getCurrentPosition`.

Aucun autre fichier touché pour ce point.

---

## 2. Défi 1v1 asynchrone

### Principe joueur

- Depuis le profil ou le menu, le joueur appuie sur **« Lancer un défi »**.
- Il choisit un adversaire (par pseudo) ou génère un **code de défi** à partager.
- Le défi a une config figée : **durée 5 min**, **même seed de spawn clients** (même densité d'événements), **même ville météo neutre** (pour l'équité on n'utilise pas la météo locale pendant un défi).
- Le défieur joue d'abord → son score est enregistré.
- L'adversaire a **24 h** pour jouer la même config. Notif in-app à l'ouverture du jeu : *« Tu as un défi de @Pseudo, score à battre : 1 240 € »*.
- À la fin de sa partie, les deux voient le résultat : 🏆 gagnant, écart, possibilité de revanche.
- État : `pending` → `accepted` → `completed` / `expired`.

### Backend (Lovable Cloud)

**3 nouvelles tables** + RLS + GRANTs (migration unique) :

- `challenges` : `id, creator_id, opponent_id (nullable si code partagé), share_code (nullable), config jsonb (seed, durée), creator_score, opponent_score, status, winner_id, created_at, expires_at, completed_at`.
- `challenge_invites` : table simple pour résoudre un `share_code` vers un `challenge_id` sans exposer toute la table.
- (réutilise `profiles` existant pour la recherche par pseudo)

**Policies :**
- `SELECT` : autorisé si `auth.uid() IN (creator_id, opponent_id)`.
- `INSERT` : `creator_id = auth.uid()`.
- `UPDATE` : limité au passage `pending→accepted` (l'adversaire s'attribue) et à l'écriture de son propre score, via deux **fonctions SECURITY DEFINER** (`accept_challenge(code)`, `submit_challenge_score(challenge_id, score)`) pour éviter qu'un joueur triche en écrivant le score de l'autre.
- Realtime activé sur `challenges` pour push live des résultats.

### Frontend

- Nouvelle route protégée `src/routes/_authenticated/defis.tsx` : liste des défis envoyés / reçus / terminés, bouton « Nouveau défi », champ pour entrer un code reçu.
- Composant `ChallengeCard` (statut, adversaire, score à battre, CTA).
- Bouton **« Défis »** dans `GameMenu.tsx` avec badge si défis en attente (compte temps réel via subscription).
- Quand on lance une partie depuis un défi, `TaxiTycoon` reçoit un prop `challengeConfig` qui :
  - force la **durée à 5 min** (timer affiché),
  - utilise le **seed** du défi pour le RNG des spawns clients/accidents (refactor mineur du `Math.random()` actuel vers un PRNG seedable type mulberry32, isolé dans `src/game/rng.ts`),
  - désactive la météo dynamique pendant la partie.
- À la fin de la partie défi, appel `submit_challenge_score`, modale résultat avec comparatif.

### Hors scope (volontairement)

- Pas de **temps réel** (pas de 2 taxis sur la même map — c'est le scope « Course temps réel » qu'on a écarté).
- Pas de matchmaking automatique : seulement pseudo ou code.
- Pas de système de classement ELO / saison pour l'instant (peut venir après si tu veux).
- Pas de tournois à plus de 2.

### Étapes d'implémentation

1. Migration SQL : tables + RPC `accept_challenge`, `submit_challenge_score` + RLS + GRANTs + publication realtime.
2. Server fns : `createChallenge`, `listMyChallenges`, `acceptChallenge`, `submitScore`.
3. Refactor RNG du jeu vers `src/game/rng.ts` (PRNG seedable).
4. Page `defis.tsx` + `ChallengeCard` + flow modal « Nouveau défi ».
5. Bouton + badge dans `GameMenu.tsx`.
6. Branchement `TaxiTycoon` ↔ `challengeConfig`.
7. Notif d'arrivée + écran résultat.
8. Bump `public/version.json`.

## Points à confirmer avant de coder

- **Durée 5 min** OK ou tu préfères 3 min / 10 min / au choix du défieur ?
- **Seed partagé** pour que les deux aient exactement les mêmes spawns clients : OK comme principe d'équité ?
- **Expiration 24 h** : OK ou tu veux 48 h / 7 jours ?
- Recherche d'adversaire **par pseudo** (suppose qu'on rend les pseudos cherchables — j'ajouterai une policy `SELECT` minimaliste sur `profiles` qui n'expose que `id, pseudo, avatar_kind`) : OK ?
