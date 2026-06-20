import { useState, useEffect } from "react";

// CONFIGURATION DU TRAFIC
const VOIE_DROITE = [
  { x: 10, y: 50 },
  { x: 50, y: 50 },
  { x: 90, y: 50 }
];

const VOIE_GAUCHE = [
  { x: 90, y: 56 },
  { x: 50, y: 56 },
  { x: 10, y: 56 }
];

type Voiture = {
  id: string;
  voie: "droite" | "gauche";
  indexEtape: number;
  x: number;
  y: number;
  vitesse: number;
};

type CrimeEvent = {
  id: string;
  type: "cambriolage" | "braquage";
  statut: "en_cours" | "police_en_route" | "intercepte";
};

export default function Index() {
  // RESSOURCES DU TYCOON
  const [argent, setArgent] = useState<number>(1500);
  const [ferraille, setFerraille] = useState<number>(50);

  // ÉTATS TRAFIC & CRIMES
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [activeCrime, setActiveCrime] = useState<CrimeEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const recupererPieces = () => {
    setFerraille((prev) => prev + 10);
    setArgent((prev) => prev + 250);
  };

  // BOUCLE DU TRAFIC
  useEffect(() => {
    const intervalTrafic = setInterval(() => {
      if (voitures.length < 5) {
        const vaADroite = Math.random() > 0.5;
        setVoitures((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            voie: vaADroite ? "droite" : "gauche",
            indexEtape: 0,
            x: vaADroite ? VOIE_DROITE[0].x : VOIE_GAUCHE[0].x,
            y: vaADroite ? VOIE_DROITE[0].y : VOIE_GAUCHE[0].y,
            vitesse: 1.5
          }
        ]);
      }
    }, 3500);
    return () => clearInterval(intervalTrafic);
  }, [voitures]);

  useEffect(() => {
    const boucleMouvement = setInterval(() => {
      setVoitures((prevVoitures) =>
        prevVoitures
          .map((voiture) => {
            const pointsCibles = voiture.voie === "droite" ? VOIE_DROITE : VOIE_GAUCHE;
            const cibleActuelle = pointsCibles[voiture.indexEtape];
            if (!cibleActuelle) return null;

            const diffX = cibleActuelle.x - voiture.x;
            const diffY = cibleActuelle.y - voiture.y;
            const distance = Math.sqrt(diffX * diffX + diffY * diffY);

            if (distance < 2) {
              return { ...voiture, indexEtape: voiture.indexEtape + 1 };
            }
            return {
              ...voiture,
              x: voiture.x + (diffX / distance) * voiture.vitesse,
              y: voiture.y + (diffY / distance) * voiture.vitesse
            };
          })
          .filter((v): v is Voiture => v !== null)
      );
    }, 50);
    return () => clearInterval(boucleMouvement);
  }, []);

  // BOUCLE DES CRIMES
  useEffect(() => {
    const initialCrime = setTimeout(() => {
      if (!activeCrime) {
        setActiveCrime({ id: "init", type: "braquage", statut: "en_cours" });
        setLogs((prev) => ["🚨 ALERTE : Un braquage commence à la casse !", ...prev]);
      }
    }, 4000);

    const boucleCrimes = setInterval(() => {
      if (!activeCrime) {
        const typeCrime = Math.random() > 0.5 ? "braquage" : "cambriolage";
        setActiveCrime({ id: Math.random().toString(), type: typeCrime, statut: "en_cours" });
        setLogs((prev) => [`🚨 ALERTE : Tentative de ${typeCrime} !`, ...prev]);
      }
    }, 15000);

    return () => {
      clearTimeout(initialCrime);
      clearInterval(boucleCrimes);
    };
  }, [activeCrime]);

  const deployerPolice = () => {
    if (!activeCrime) return;
    setActiveCrime({ ...activeCrime, statut: "police_en_route" });
    setLogs((prev) => ["CNC 🚓 : Les sirènes hurlent, la police arrive !", ...prev]);

    setTimeout(() => {
      setActiveCrime({ ...activeCrime, statut: "intercepte" });
      setLogs((prev) => [
        "💥 FUSILLADE ! Échanges de tirs devant la casse !",
        "👮 Les suspects sont maîtrisés.",
        ...prev
      ]);
      setTimeout(() => setActiveCrime(null), 4000);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase">
              Junky City Empire
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Gestionnaire de Casse Automobile</p>
          </div>
          <div className="flex gap-4 text-xs font-bold font-mono">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-emerald-800/60 text-emerald-400">
              💵 {argent} €
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-amber-800/60 text-amber-500">
              ⚙️ {ferraille} Uts
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-6 pb-12">
        <section className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase">Centre de Contrôle</h2>
            <p className="text-xs text-slate-400 mt-1">Transformez vos carcasses en profits.</p>
          </div>
          <button 
            onClick={recupererPieces}
            className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider"
          >
            ⚙️ Recycler des carcasses (+250€)
          </button>
        </section>

        {/* SECTION TRAFIC */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider text-center">
            🚦 SÉCURITÉ ROUTIÈRE (VOIES RESPECTÉES)
          </h3>
          <div className="mt-3 bg-slate-950 p-3 rounded-lg text-[11px] font-mono">
            <div>Voitures en circulation : <span className="text-yellow-400 font-bold">{voitures.length} / 5</span></div>
            <div className="mt-2 max-h-24 overflow-y-auto text-slate-400 text-[10px]">
              {voitures.map((v) => (
                <div key={v.id} className="border-b border-slate-900 pb-0.5">
                  🚗 Axe {v.voie === "droite" ? "Droit (->)" : "Gauche (<-)"} | X:{Math.round(v.x)} Y:{Math.round(v.y)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION MENACES & POLICE */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border-2 border-red-900 shadow-xl">
          <h3 className="text-xs font-black text-red-500 uppercase tracking-widest text-center">
            🚨 ALARMES & CRIMINALITÉ
          </h3>
          {activeCrime ? (
            <div className="mt-3 bg-red-950/40 border border-red-800 p-3 rounded-xl text-xs">
              <div className="font-bold">INFRACTION : <span className="text-red-400 uppercase">{activeCrime.type}</span></div>
              <div className="mt-1 font-mono text-yellow-400">SITUATION : {activeCrime.statut.toUpperCase()}</div>
              {activeCrime.statut === "en_cours" && (
                <button
                  onClick={deployerPolice}
                  className="mt-3 w-full bg-blue-600 text-white font-black py-2 rounded-xl border border-blue-400 text-xs uppercase"
                >
                  BC 🚓 : ENVOYER LES UNITÉS SUR PLACE
                </button>
              )}
            </div>
          ) : (
            <div className="mt-3 bg-emerald-950/30 border border-emerald-800 p-2 rounded-xl text-center text-xs text-emerald-400">
              🟢 Zone sous contrôle. Aucune menace.
            </div>
          )}

          <div className="mt-3 border-t border-slate-800 pt-2 bg-slate-950 p-2 rounded-lg">
            <span className="text-[9px] text-slate-500 font-bold uppercase">Flux Radio :</span>
            <div className="mt-1 max-h-24 overflow-y-auto text-[10px] font-mono text-slate-300 flex flex-col gap-1">
              {logs.map((log, index) => (
                <div key={index} className={`pb-1 border-b border-slate-900 ${log.includes('💥') ? 'text-orange-400 font-bold' : ''}`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
               }
