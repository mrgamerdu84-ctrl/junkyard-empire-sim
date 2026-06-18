import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.junkycityempire.game",
  appName: "Junky City Empire",
  webDir: "dist",
  server: {
    url: "https://junkyard-empire-sim.lovable.app",
    androidScheme: "https",
    iosScheme: "https",
    cleartext: false,
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
