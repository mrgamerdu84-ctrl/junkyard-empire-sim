      const speakBrowser = () => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) { wrapDone(); return; }
        try {
          // 1. On stoppe proprement toute lecture en cours
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
          }
          
          const u = new SpeechSynthesisUtterance(text);
          
          // 2. On configure la langue et on force la récupération des voix
          u.lang = l === "en" ? "en-US" : "fr-FR";
          
          // Sécurité mobile : Si getVoices() est vide, on réveille le système
          let v = pickVoice(l);
          if (!v) {
            window.speechSynthesis.getVoices(); // Force le rechargement
            v = pickVoice(l);
          }
          if (v) u.voice = v;

          // 3. On attache les événements AVANT toute action
          u.onend = () => wrapDone();
          u.onerror = (e) => {
            console.warn("[Radio] TTS Error:", e);
            wrapDone();
          };

          // 4. On lance la voix et on force le canal audio mobile à s'activer
          window.speechSynthesis.speak(u);
          
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch (err) {
          console.warn("[Radio] speakBrowser error:", err);
          wrapDone();
        }
      };
