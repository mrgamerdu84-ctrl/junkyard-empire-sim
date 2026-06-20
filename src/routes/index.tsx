import { useState } from "react";
import TrafficManager from "@/composants/TrafficManager";

export default function Index() {
  // Gestion des ressources du Tycoon (Argent et Ferraille)
  const [argent, setArgent] = useState<number>(1500);
  const [ferraille, setFerraille] = useState<number>(50);

  const recupererPieces = () => {
    setFerraille((prev) => prev + 10);
    setArgent((prev) => prev + 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER : BARRE D'INFOS ET RESSOURCES */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase">
              Junky City Empire
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Gestionnaire de Casse Automobile</p>
          </div>
          
          <div className="flex gap-4 text-xs font-bold font-mono">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-emerald-800/60 text-emerald-400 flex items-center gap-1.5">
              💵 <span>{argent} €</span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-amber-800/60 text-amber-500 flex items-center gap-1.5">
              ⚙️ <span>{ferraille} Uts</span>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-6 pb-12">
        
        {/* SECTION ACTION RECYCLAGE */}
        <section className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-sm font-bold text-slate-200 uppercase">Centre de Contrôle</h2>
            <p className="text-xs text-slate-400 mt-1">Gérez vos carcasses et vos profits.</p>
          </div>
          
          <button 
            onClick={recupererPieces}
            className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wider"
          >
            ⚙️ Recycler des carcasses (+250€)
          </button>
        </section>

        {/* AFFICHAGE DU BLOC COMPLET (TRAFIC + CRIMES ET POLICE) */}
        <section className="w-full">
          <TrafficManager />
        </section>

      </main>

      <footer className="bg-slate-950 border-t border-slate-900 p-3 text-center text-[10px] text-slate-600 font-mono mt-auto">
        Junky City Empire © 2026 - Déploiement Manuel Direct via GitHub.
      </footer>

    </div>
  );
}
