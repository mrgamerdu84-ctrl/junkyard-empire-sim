import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.junkycityempire.game",
  appName: "Junky City Empire",
  webDir: "dist",
  server: {
    // En production, l'APK charge les fichiers embarqués
    // Pour les live updates, on peut switcher sur l'URL distante
    androidScheme: "https",
    iosScheme: "https",
  },
  plugins: {
    // Configuration pour les mises à jour automatiques
    LiveUpdates: {
      enabled: true,
      checkInterval: 300, // Vérifier toutes les 5 minutes
    },
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
};

export default config;
