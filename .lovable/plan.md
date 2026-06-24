## 1. Sync des personnalisations entre appareils (voitures, camion blindé, etc.)

**Problème** : Les véhicules custom (voitures, camion blindé, piétons, sprite du blindé, overrides d'assets) sont stockés uniquement en `localStorage`, donc invisibles sur un autre téléphone.

**Solution** : Sauvegarder ces personnalisations dans Lovable Cloud, liées au compte utilisateur, avec fallback localStorage hors-ligne.

- Nouvelle table `user_customizations` (1 ligne par user) :
  - `custom_vehicles` (JSON — la liste actuelle `jce.customVehicles`)
  - `custom_pedestrians` (JSON — `jce.customPedestrians`)
  - `armored_sprite` (TEXT — `jce.armoredSprite`)
  - `asset_overrides` (JSON — `jce.assetOverrides`)
- RLS : chaque user lit/écrit uniquement sa propre ligne. GRANT authenticated + service_role.
- Hook `useCloudCustomizations()` qui :
  - Au login : télécharge depuis le cloud → écrit dans localStorage → déclenche les events `jce.customVehicles.changed` / reload du sprite blindé.
  - À chaque ajout/suppression : pousse vers le cloud (debounce 800 ms).
- Wrappers `addCustomVehicle`, `removeCustomVehicle`, `setArmoredSprite`, override d'asset → marquent dirty pour upload.

**Résultat** : tu changes une voiture / le camion blindé sur ton téléphone A → tu te connectes sur ton téléphone B → tout est là.

## 2. Phrase de copyright

Ajouter en bas de l'écran d'accueil (`HomeScreen`) et mettre à jour la ligne finale de `mentions-legales.tsx` avec **exactement** :

> 2026 My taxi world rivalité — Tous droits réservés.

## 3. Radios — réparation

Le `<audio>` ne se recharge pas correctement quand on change de piste/station sur certains navigateurs (le `src` change mais `load()` n'est pas appelé) → certaines pistes restent muettes ou bloquées sur la précédente.

Corrections dans `RadioPlayer.tsx` :
- Appeler `audio.load()` à chaque changement de `track.url`.
- Bloquer la lecture suivante tant que `loadedmetadata` n'est pas reçu (évite les `play()` rejetés).
- Logger l'event `error` de l'audio + passer auto à la piste suivante si une piste casse (URL morte).
- Vérifier que les 13 fichiers `.asset.json` pointent vers des URLs valides ; remplacer ceux qui renvoient 404.

## Techniques

- Migration SQL : `public.user_customizations (user_id PK → auth.users, ...)`, GRANT + RLS `auth.uid() = user_id`, trigger `updated_at`.
- Server functions `getMyCustomizations` / `saveMyCustomizations` (avec `requireSupabaseAuth`).
- Pas d'autre changement de logique gameplay.

Fichiers touchés (estimation) :
- nouveau : `supabase/migrations/*_user_customizations.sql`, `src/lib/customizations.functions.ts`, `src/hooks/useCloudCustomizations.ts`
- édités : `src/game/gameAssets.ts`, `src/game/ArmoredTruck.tsx`, `src/game/RadioPlayer.tsx`, `src/game/HomeScreen.tsx`, `src/routes/mentions-legales.tsx`, `src/routes/_authenticated/route.tsx` (montage du hook)
