import { useState, useEffect, useRef } from 'react';

export default function TaxiRadio() {
  const [l, setL] = useState<'fr' | 'en'>('fr');
  const [text, setText] = useState('Bienvenue au Taxi Radio');
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // init safe, uniquement côté client
  useEffect(() => {
    if (typeof window!== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      try { synthRef.current.getVoices(); } catch {}
    }
  }, []);

  const pickVoice = (lang: string) => {
    const synth = synthRef.current;
    if (!synth) return null;
    const voices = synth.getVoices() || [];
    const target = lang === 'en'? 'en' : 'fr';
    return (
      voices.find(v => v.lang.toLowerCase() === (target === 'fr'? 'fr-fr' : 'en-us')) ||
      voices.find(v => v.lang.toLowerCase().startsWith(target)) ||
      null
    );
  };

  const wrapDone = () => {
    console.log('[Radio] fini');
    utteranceRef.current = null;
  };

  const speakBrowser = () => {
    const synth = synthRef.current;
    if (!synth) { wrapDone(); return; }

    try { if (synth.speaking || synth.pending) synth.cancel(); } catch {}

    const u = new SpeechSynthesisUtterance(text || '');
    u.lang = l === 'en'? 'en-US' : 'fr-FR';
    u.rate = 1; u.pitch = 1; u.volume = 1;
    u.onend = wrapDone;
    u.onerror = (e) => { console.warn('[Radio] TTS Error', e); wrapDone(); };
    utteranceRef.current = u;

    const doSpeak = () => {
      const v = pickVoice(l);
      if (v) u.voice = v;
      // délai obligatoire après cancel sur iOS
      setTimeout(() => {
        try {
          synth.speak(u);
          if (synth.paused) synth.resume();
        } catch (e) { console.warn(e); wrapDone(); }
      }, 70);
    };

    const voices = synth.getVoices?.() || [];
    if (!voices.length) {
      synth.onvoiceschanged = () => {
        synth.onvoiceschanged = null;
        doSpeak();
      };
      try { synth.getVoices(); } catch {}
    } else {
      doSpeak();
    }
  };

  return (
    <div>
      {/* tes radios, inchangés visuellement */}
      <label>
        <input type="radio" name="lang" value="fr" checked={l === 'fr'} onChange={() => setL('fr')} /> FR
      </label>
      <label>
        <input type="radio" name="lang" value="en" checked={l === 'en'} onChange={() => setL('en')} /> EN
      </label>

      <textarea value={text} onChange={e => setText(e.target.value)} rows={3} />

      <button onClick={speakBrowser}>Parler</button>
    </div>
  );
}
