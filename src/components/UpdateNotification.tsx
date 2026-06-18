import { useState, useEffect } from "react";
import { liveUpdater, type VersionInfo } from "@/lib/live-updater";
import { Download, X, Sparkles } from "lucide-react";

export function UpdateNotification() {
  const [update, setUpdate] = useState<VersionInfo | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    liveUpdater.init();

    const unsubscribe = liveUpdater.onUpdateAvailable((newVersion) => {
      setUpdate(newVersion);
      setVisible(true);
    });

    return () => {
      unsubscribe();
      liveUpdater.destroy();
    };
  }, []);

  const handleUpdate = async () => {
    if (update) {
      await liveUpdater.applyUpdate(update);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible || !update) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[9999] animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl shadow-2xl p-4 flex items-center gap-3 max-w-md mx-auto">
        <div className="flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">Nouvelle mise à jour !</p>
          <p className="text-white/90 text-xs truncate">
            Version {update.version} disponible
          </p>
        </div>
        <button
          onClick={handleUpdate}
          className="flex-shrink-0 bg-white text-amber-600 font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-white/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Mettre à jour
        </button>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
