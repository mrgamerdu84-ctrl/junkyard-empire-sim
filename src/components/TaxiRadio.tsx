import { useEffect, useRef, useState } from "react";
import { GAME_ASSETS } from "@/game/gameAssets";
import { RADIO_NEWS_EVENT, AMBIENT_NEWS, type RadioNews } from "@/lib/radioNews";

type Station = {
  id: string;
  name: string;
  emoji: string;
  url?: string;        // pour les stations audio classiques
  loop?: boolean;
  volume?: number;
  tts?: boolean;       // station "infos" : utilise la synthèse vocale
};

const STATIONS: Station[] = [
  { id: "main",    name: "Musique du jeu", emoji: "🎵", url: GAME_ASSETS["audio.music"], loop: true, volume: 0.4 },
  { id: "infos",   name: "Radio Infos",    emoji: "📰", tts: true },
  { id: "pop",     name: "Radio Pop",      emoji: "🎤", url: "https://ice1.somafm.com/poptron-128-mp3", volume: 0.5 },
  { id: "electro", name: "Radio Electro",  emoji: "🎧", url: "https://ice1.somafm.com/groovesalad-128-mp3", volume: 0.5 },
  { id: "rock",    name: "Radio Rock",     emoji: "🎸", url: "https://ice6.somafm.com/thetrip-128-mp3", volume: 0.5 },
];

const STORAGE_KEY = "mttw.taxiRadio"; // id station, ou "off"
const LANG_KEY = "mttw.lang";          // "fr" | "en"

function readPref(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "main";
  } catch {
    return "main";
  }
}

function readLang(): "fr" | "en" {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

function pickVoice(lang: "fr" | "en"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const want = lang === "fr" ? "fr" : "en";
  return (
    voices.find((v) => v.lang?.toLowerCase().startsWith(want + "-")) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith(want)) ||
    null
  );
}

export default function TaxiRadio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [stationId, setStationId] = useState<string>("main");
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const ambientTimerRef = useRef<number | null>(null);
  const ambientIdxRef = useRef<number>(0);

  useEffect(() => {
    setStationId(readPref());
    setLang(readLang());
    setReady(true);
    // Force le chargement des voix (certaines plateformes l'exigent)
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    const onLang = () => setLang(readLang());
    window.addEventListener("jce:lang-changed", onLang);
    return () => window.removeEventListener("jce:lang-changed", onLang);
  }, []);

  // Lit une brève
  const speak = (news: RadioNews) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      const text = lang === "en" ? news.en : news.fr;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "en" ? "en-US" : "fr-FR";
      const v = pickVoice(lang);
      if (v) u.voice = v;
      u.rate = 1.0;
      u.pitch = 1.0;
      u.volume = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      // pas de TTS — silencieusement ignoré
    }
  };

  // Stations audio normales
  useEffect(() => {
    if (!ready) return;
    const a = audioRef.current;
    const st = STATIONS.find((s) => s.id === stationId);

    // Coupe toujours la synthèse vocale entre deux switches
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    if (ambientTimerRef.current) { window.clearInterval(ambientTimerRef.current); ambientTimerRef.current = null; }

    if (!a) return;

    if (!st || st.id === "off") {
      a.pause();
      return;
    }

    if (st.tts) {
      // Station Infos : on coupe l'audio musical et on annonce un jingle d'ouverture
      a.pause();
      speak({ fr: "Radio Infos, votre ville en direct.", en: "Taxi News Radio, your city live." });
      // Brève d'ambiance régulière s'il n'y a pas d'événement
      ambientTimerRef.current = window.setInterval(() => {
        const idx = ambientIdxRef.current % AMBIENT_NEWS.length;
        ambientIdxRef.current++;
        speak(AMBIENT_NEWS[idx]);
      }, 35000);
      return;
    }

    if (st.url) {
      if (a.src !== st.url) a.src = st.url;
      a.loop = !!st.loop;
      a.volume = st.volume ?? 0.5;
      a.play().catch(() => {
        const start = () => {
          a.play().catch(() => {});
          window.removeEventListener("pointerdown", start);
          window.removeEventListener("keydown", start);
          window.removeEventListener("touchstart", start);
        };
        window.addEventListener("pointerdown", start, { once: true });
        window.addEventListener("keydown", start, { once: true });
        window.addEventListener("touchstart", start, { once: true });
      });
    }
  }, [stationId, ready, lang]);

  // Écoute les news temps réel — uniquement si la station Infos est active
  useEffect(() => {
    const onNews = (e: Event) => {
      if (stationId !== "infos") return;
      const detail = (e as CustomEvent<RadioNews>).detail;
      if (!detail) return;
      speak(detail);
    };
    window.addEventListener(RADIO_NEWS_EVENT, onNews);
    return () => window.removeEventListener(RADIO_NEWS_EVENT, onNews);
  }, [stationId, lang]);

  // Cleanup à l'unmount
  useEffect(() => {
    return () => {
      if (ambientTimerRef.current) window.clearInterval(ambientTimerRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try { window.speechSynthesis.cancel(); } catch {}
      }
    };
  }, []);

  const pick = (id: string) => {
    setStationId(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  };

  const setLanguage = (l: "fr" | "en") => {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
    try { window.dispatchEvent(new CustomEvent("jce:lang-changed", { detail: l })); } catch {}
  };

  const current = STATIONS.find((s) => s.id === stationId);
  const active = stationId !== "off";

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        onEnded={(e) => {
          const a = e.currentTarget;
          const st = STATIONS.find((s) => s.id === stationId);
          if (st?.loop) { a.currentTime = 0; a.play().catch(() => {}); }
        }}
      />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Radio du taxi"
        aria-label="Radio du taxi"
        style={{
          position: "fixed", top: 12, right: 12, zIndex: 10000,
          width: 44, height: 44, borderRadius: "50%",
          border: "2px solid #fde047",
          background: active
            ? "linear-gradient(180deg, #ef4444 0%, #991b1b 100%)"
            : "linear-gradient(180deg, #4b5563 0%, #1f2937 100%)",
          color: "#fff7d6", fontSize: 20, fontWeight: 900, cursor: "pointer",
          boxShadow: "0 4px 0 rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 0, lineHeight: 1,
        }}
      >
        📻
      </button>

      {open && (
        <div
          style={{
            position: "fixed", top: 64, right: 12, zIndex: 10001,
            background: "linear-gradient(180deg,#1f2937,#0f172a)",
            border: "2px solid #fde047", borderRadius: 12, padding: 10,
            minWidth: 220, boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            color: "#fff7d6", fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 8, textAlign: "center" }}>
            📻 Radio Taxi
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {STATIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pick(s.id)}
                style={{
                  textAlign: "left", padding: "8px 10px", borderRadius: 8,
                  border: stationId === s.id ? "2px solid #f5c542" : "2px solid rgba(255,255,255,0.15)",
                  background: stationId === s.id ? "#3a2a10" : "rgba(255,255,255,0.04)",
                  color: "#fff7d6", fontWeight: 700, cursor: "pointer",
                }}
              >
                {s.emoji} {s.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => pick("off")}
              style={{
                textAlign: "left", padding: "8px 10px", borderRadius: 8,
                border: stationId === "off" ? "2px solid #f5c542" : "2px solid rgba(255,255,255,0.15)",
                background: stationId === "off" ? "#3a2a10" : "rgba(255,255,255,0.04)",
                color: "#fff7d6", fontWeight: 700, cursor: "pointer",
              }}
            >
              🔇 Éteindre
            </button>
          </div>

          <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px dashed rgba(255,255,255,0.2)" }}>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4, textAlign: "center" }}>
              Langue de la radio infos
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["fr","en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  style={{
                    flex: 1, padding: "6px 0", borderRadius: 6,
                    border: lang === l ? "2px solid #f5c542" : "2px solid rgba(255,255,255,0.15)",
                    background: lang === l ? "#3a2a10" : "rgba(255,255,255,0.04)",
                    color: "#fff7d6", fontWeight: 800, cursor: "pointer",
                  }}
                >
                  {l === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
                </button>
              ))}
            </div>
          </div>

          {current && (
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 8, textAlign: "center" }}>
              En cours : {current.name}
            </div>
          )}
        </div>
      )}
    </>
  );
}
