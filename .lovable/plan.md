## Problème
La musique s'arrête après une lecture. L'attribut `loop` est présent dans le JSX mais peut être ignoré (CDN qui sert le mp3 sans support des range requests, ou réhydratation React qui réinitialise la propriété).

## Correctif
Dans `src/game/TaxiTycoon.tsx` :

1. **Forcer `loop` côté JS** sur l'élément audio dès qu'il est monté, et ajouter un handler `onEnded` de secours qui remet `currentTime = 0` et relance `play()` — ceinture + bretelles.

2. Ajuster le bouton musique : au clic « play », s'assurer que `a.loop = true` avant l'appel à `play()`.

```tsx
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
```

Et dans le handler du bouton :
```ts
a.loop = true;
a.volume = 0.45;
a.play().catch(() => {});
```

Aucun autre fichier touché.