# Junky City Empire - APK avec Live Updates

Ce projet utilise **Capacitor** pour empaqueter le jeu web en APK Android avec un système de **mises à jour automatiques du contenu**.

---

## Architecture des mises à jour

1. **Le jeu web** est déployé sur le web (URL publique)
2. **L'APK Android** est un wrapper Capacitor qui charge le jeu
3. **Le `version.json`** est généré automatiquement à chaque build avec la version et la date
4. **L'APK vérifie** au démarrage si une nouvelle version existe
5. **Si nouvelle version** → notification à l'utilisateur + rechargement automatique

---

## Prérequis

- Node.js / Bun
- Android Studio (pour compiler l'APK)
- Java JDK 17+
- Android SDK

---

## Installation initiale (une seule fois)

```bash
# 1. Build le jeu
bun run build

# 2. Init Capacitor avec la plateforme Android
npx cap add android

# 3. Sync les fichiers
npx cap sync
```

---

## Build de l'APK

```bash
# Build + sync auto
bun run cap:build

# Ouvrir dans Android Studio
bun run cap:android
```

Dans Android Studio :
- `Build` → `Generate Signed Bundle / APK`
- Choisir `APK`
- Sélectionner ton keystore (ou créer un nouveau)
- Build !

---

## Déploiement des mises à jour (sans republier l'APK)

1. Modifier le jeu
2. Incrémenter `GAME_VERSION` dans `vite.config.ts` (optionnel, mais recommandé)
3. Build et déployer sur le web :
   ```bash
   bun run build
   # Puis publier sur Lovable
   ```
4. Les joueurs qui ouvrent l'APK verront automatiquement la notification de mise à jour

---

## Comment ça marche

Le fichier `src/lib/live-updater.ts` gère tout :
- Vérifie `version.json` toutes les 5 minutes
- Compare la version embarquée avec la version distante
- Affiche une notification jaune "Nouvelle mise à jour !"
- Recharge l'app pour appliquer la mise à jour

Le composant `src/components/UpdateNotification.tsx` affiche l'UI de notification.

---

## Personnalisation

### Changer la fréquence de vérification
Dans `src/lib/live-updater.ts` :
```ts
const UPDATE_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
```

### Changer la version du jeu
Dans `vite.config.ts` :
```ts
const GAME_VERSION = "1.1.0";
```

### Désactiver les mises à jour
Retirer le `<UpdateNotification />` de `src/game/HomeScreen.tsx`.

---

## Notes importantes

- **Capacitor** charge les fichiers web depuis le dossier `dist/` embarqué dans l'APK
- Quand une mise à jour est détectée, l'app se recharge pour charger les nouveaux assets
- Le système fonctionne aussi en mode web (notification + reload)
- Les données de sauvegarde (localStorage) sont conservées lors du reload
