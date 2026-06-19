// Petites brèves diffusées par la "Radio Infos" du taxi.
// Chaque news est fournie dans plusieurs langues. La radio choisit la bonne
// version selon la préférence joueur (localStorage "mttw.lang").

export type RadioNews = {
  fr: string;
  en: string;
};

const EVENT = "jce:radio-news";

export function pushNews(news: RadioNews) {
  try {
    window.dispatchEvent(new CustomEvent<RadioNews>(EVENT, { detail: news }));
  } catch {
    // SSR / pas de window — ignore
  }
}

export const RADIO_NEWS_EVENT = EVENT;

// Quelques jingles d'ambiance pour meubler quand il ne se passe rien
export const AMBIENT_NEWS: RadioNews[] = [
  {
    fr: "Vous écoutez Radio Taxi Infos, l'actualité de votre ville en continu.",
    en: "You're listening to Taxi Radio News, your city's live updates.",
  },
  {
    fr: "Trafic globalement fluide en centre-ville, restez prudents au volant.",
    en: "Traffic is smooth downtown, please drive safely.",
  },
  {
    fr: "Bonne course à tous les chauffeurs, et n'oubliez pas votre ceinture.",
    en: "Have a great shift drivers, and don't forget your seatbelt.",
  },
  {
    fr: "Météo: temps clair sur la ville, idéal pour enchaîner les courses.",
    en: "Weather: clear skies across town, perfect for back-to-back rides.",
  },
];
