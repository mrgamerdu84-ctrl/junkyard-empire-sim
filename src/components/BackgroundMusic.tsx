import { useEffect, useRef, useState } from "react";
import { GAME_ASSETS } from "@/game/gameAssets";

const MUSIC_URL = GAME_ASSETS["audio.music"];
const STORAGE_KEY = "mttw.musicOn";

function readPref(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === null ? true : v === "1";
  } catch {
    return true;
  }
}

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState<boolean>(true);
  const [ready, setReady] = useState(false);
  const [radioActive, setRadioActive] = useState<boolean>(false);
  const savedTimeRef = useRef<number>(0);

  // Charge la préférence côté client
  useEffect(() => {
    setOn(readPref());
    setReady(true);
  }, []);

  // Écoute l'état de la radio du taxi
  useEffect(() => {
    const onRadio = (e: Event) => {
      const active = !!(e as CustomEvent<{ active: boolean }>).detail?.active;
      setRadioActive(active);
    };
    window.addEventListener("jce:taxi-radio", onRadio);
    return () => window.removeEventListener("jce:taxi-radio", onRadio);
  }, []);

  // Applique l'état au tag audio
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !ready) return;
    a.loop = true;
    a.volume = 0.4;
    const shouldPlay = on && !radioActive;
    if (shouldPlay) {
      // Reprend là où on s'était arrêté si on revient depuis la radio
      if (savedTimeRef.current > 0 && a.currentTime < 0.1) {
        try { a.currentTime = savedTimeRef.current; } catch {}
      }
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
    } else {
      // Sauvegarde la position avant de couper
      if (!a.paused) savedTimeRef.current = a.currentTime;
      a.pause();
    }
  }, [on, ready, radioActive]);


  const toggle = () => {
    setOn((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_URL}
        loop
        preload="auto"
        onEnded={(e) => {
          const a = e.currentTarget;
          a.currentTime = 0;
          a.play().catch(() => {});
        }}
      />
      <button
        type="button"
        onClick={toggle}
        title={on ? "Couper la musique" : "Activer la musique"}
        aria-label={on ? "Couper la musique" : "Activer la musique"}
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 10000,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "2px solid #fde047",
          background: on
            ? "linear-gradient(180deg, #f5c542 0%, #e0a92a 100%)"
            : "linear-gradient(180deg, #4b5563 0%, #1f2937 100%)",
          color: on ? "#1a1208" : "#f5c542",
          fontSize: 20,
          fontWeight: 900,
          cursor: "pointer",
          boxShadow: "0 4px 0 rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          lineHeight: 1,
        }}
      >
        {on ? "🎵" : "🔇"}
      </button>
    </>
  );
}
