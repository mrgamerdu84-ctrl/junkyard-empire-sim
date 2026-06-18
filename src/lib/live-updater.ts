// Système de mise à jour automatique pour le jeu Junky City Empire
// Ce fichier est utilisé par l'APK Capacitor pour vérifier et appliquer les mises à jour

export interface VersionInfo {
  version: string;
  buildId: string;
  builtAt: number;
  changelog?: string;
  required?: boolean;
}

const UPDATE_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const VERSION_URL = "/version.json";

class LiveUpdater {
  private currentVersion: VersionInfo | null = null;
  private checkTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: ((update: VersionInfo) => void)[] = [];

  async init() {
    // Charger la version actuelle depuis le localStorage (ou les assets embarqués)
    const stored = localStorage.getItem("junky_current_version");
    if (stored) {
      this.currentVersion = JSON.parse(stored);
    }

    // Vérifier immédiatement au démarrage
    await this.checkForUpdate();

    // Puis vérifier périodiquement
    this.checkTimer = setInterval(() => this.checkForUpdate(), UPDATE_CHECK_INTERVAL);
  }

  onUpdateAvailable(listener: (update: VersionInfo) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  async checkForUpdate(): Promise<VersionInfo | null> {
    try {
      const response = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!response.ok) return null;

      const remoteVersion: VersionInfo = await response.json();

      // Ajouter une propriété version si elle n'existe pas (retrocompatibilité)
      if (!remoteVersion.version) {
        remoteVersion.version = remoteVersion.buildId;
      }

      // Comparer les versions
      if (this.isNewerVersion(remoteVersion)) {
        console.log("[LiveUpdater] Nouvelle version disponible:", remoteVersion.version);
        this.listeners.forEach((l) => l(remoteVersion));
        return remoteVersion;
      }

      return null;
    } catch (err) {
      console.warn("[LiveUpdater] Échec de la vérification de mise à jour:", err);
      return null;
    }
  }

  private isNewerVersion(remote: VersionInfo): boolean {
    if (!this.currentVersion) return true;
    return remote.builtAt > this.currentVersion.builtAt;
  }

  async applyUpdate(version: VersionInfo): Promise<void> {
    // Stocker la nouvelle version
    localStorage.setItem("junky_current_version", JSON.stringify(version));

    // Si on est dans Capacitor, on peut forcer le rechargement
    if (typeof (window as any).Capacitor !== "undefined") {
      // Dans Capacitor, on recharge l'app pour charger les nouveaux assets
      window.location.reload();
    } else {
      // En web standard, on recharge aussi
      window.location.reload();
    }
  }

  destroy() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }
}

export const liveUpdater = new LiveUpdater();
