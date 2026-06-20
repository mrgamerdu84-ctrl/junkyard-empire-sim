// Petites brèves diffusées par la "Radio Junky Empire Taxi" du taxi.
// Chaque news est fournie en plusieurs langues. La radio choisit la bonne
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

// Jingle de bienvenue (joué à l'ouverture de la radio infos)
export const WELCOME_JINGLE: RadioNews = {
  fr: "Bienvenue dans la radio Junky Empire Taxi, votre radio préférée au volant ! Et n'oubliez pas de télécharger aussi l'application La Jungle de l'Arcade, c'est pas mal pas mal !",
  en: "Welcome to Junky Empire Taxi Radio, your favorite radio behind the wheel! And don't forget to download the La Jungle de l'Arcade app too, it's pretty cool!",
};

// Brèves d'ambiance — météo, événements de la ville, animations.
// Le DJ alterne entre ces brèves quand il ne se passe rien.
export const AMBIENT_NEWS: RadioNews[] = [
  {
    fr: "Vous écoutez Junky Empire Taxi, la radio qui roule avec vous !",
    en: "You're listening to Junky Empire Taxi, the radio that rides with you!",
  },
  {
    fr: "Pub partenaire : téléchargez l'application La Jungle de l'Arcade, plein de jeux rétro à découvrir, c'est pas mal pas mal !",
    en: "Sponsor break: download the La Jungle de l'Arcade app, tons of retro games to discover, pretty cool stuff!",
  },
  {
    fr: "Météo du jour : grand ciel bleu sur toute la ville, parfait pour enchaîner les courses.",
    en: "Today's weather: clear blue skies over the city, perfect for back-to-back rides.",
  },
  {
    fr: "Info circulation : trafic fluide en centre-ville, attention aux radars sur l'avenue principale.",
    en: "Traffic update: smooth flow downtown, watch out for speed cameras on the main avenue.",
  },
  {
    fr: "Événement de l'été : grand festival en plein air ce week-end, attendez-vous à beaucoup de clients !",
    en: "Summer event: big open-air festival this weekend, expect lots of fares!",
  },
  {
    fr: "Bulletin météo : nuit étoilée cette nuit, idéale pour les courses de nuit bien payées.",
    en: "Weather report: starry night tonight, perfect for well-paid night rides.",
  },
  {
    fr: "Côté vie locale : le maire annonce des travaux de rénovation grâce à la caisse de la ville.",
    en: "Local news: the mayor announces renovation works funded by the city treasury.",
  },
  {
    fr: "Rappel auditeurs : l'application La Jungle de l'Arcade est dispo au téléchargement, foncez les amis !",
    en: "Listener reminder: the La Jungle de l'Arcade app is available to download, go grab it folks!",
  },
  {
    fr: "Conseil prudence : bouclez votre ceinture, respectez les feux, et évitez les radars.",
    en: "Safety tip: buckle up, respect the lights, and avoid the cameras.",
  },
  {
    fr: "Météo : averses possibles en fin d'après-midi, prudence sur la chaussée mouillée.",
    en: "Weather: scattered showers expected late afternoon, careful on wet roads.",
  },
  {
    fr: "Événement : marché de nuit ce soir près du port, beaucoup de monde à transporter.",
    en: "Event: night market tonight near the harbor, lots of people to drive around.",
  },
  {
    fr: "Bonne course à tous les chauffeurs, et roulez prudemment.",
    en: "Have a great shift drivers, and drive safely.",
  },
  {
    fr: "Été en ville : températures douces et soleil généreux, les terrasses sont pleines.",
    en: "Summer in the city: mild temperatures and bright sun, terraces are packed.",
  },
  {
    fr: "Flash info : la compagnie rivale tente de débaucher nos clients, restons vigilants !",
    en: "News flash: the rival company is trying to poach our riders, stay sharp!",
  },
  {
    fr: "Coup de cœur de la rédac : La Jungle de l'Arcade, l'appli qui réveille le gamer en vous, foncez la télécharger !",
    en: "Editor's pick: La Jungle de l'Arcade, the app that wakes up the gamer in you, go download it now!",
  },
  {
    fr: "Pause pub : entre deux courses, lancez La Jungle de l'Arcade sur votre téléphone, des heures de fun garanties !",
    en: "Ad break: between two rides, fire up La Jungle de l'Arcade on your phone, hours of fun guaranteed!",
  },
  {
    fr: "Le saviez-vous ? La Jungle de l'Arcade regorge de pépites rétro, dispo dès maintenant en téléchargement.",
    en: "Did you know? La Jungle de l'Arcade is packed with retro gems, available to download right now.",
  },
];

// ===================== Horoscope dynamique =====================
// 12 signes × textes pseudo-aléatoires seedés sur la date du jour :
// tous les joueurs entendent le même horoscope pour un jour donné,
// mais ça change automatiquement chaque jour.
const SIGNS_FR = [
  "Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge",
  "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons",
];
const SIGNS_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const HOROSCOPE_TEMPLATES: RadioNews[] = [
  { fr: "journée pleine d'énergie, foncez sur les opportunités au volant.", en: "an energetic day, grab every opportunity behind the wheel." },
  { fr: "chance financière côté pourboires, restez aimable avec vos clients.", en: "lucky tips coming your way, stay friendly with riders." },
  { fr: "patience recommandée dans le trafic, le calme paiera ce soir.", en: "patience in traffic today, calm will pay off tonight." },
  { fr: "rencontre marquante prévue lors d'une course, ouvrez l'œil.", en: "an interesting encounter during a ride, keep your eyes open." },
  { fr: "petit coup de fatigue en milieu d'après-midi, pensez à la pause café.", en: "a small slump mid-afternoon, time for a coffee break." },
  { fr: "intuition au top, faites confiance à votre GPS intérieur.", en: "sharp intuition today, trust your inner GPS." },
  { fr: "soirée propice aux grosses courses, restez disponible après 22 h.", en: "evening favors big fares, stay available after 10 pm." },
  { fr: "attention aux radars sur votre route habituelle.", en: "watch out for speed cameras on your usual route." },
];

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

export function getHoroscopeNews(): RadioNews {
  const seed = dateSeed();
  const idx = seed % 12;
  const signFr = SIGNS_FR[idx];
  const signEn = SIGNS_EN[idx];
  const tpl = seededPick(HOROSCOPE_TEMPLATES, Math.floor(seed / 12));
  return {
    fr: `Horoscope du jour, ${signFr} : ${tpl.fr}`,
    en: `Today's horoscope, ${signEn}: ${tpl.en}`,
  };
}

// ===================== Programme TV simulé =====================
const TV_SHOWS_FR = [
  "le grand débat politique", "un thriller américain", "une comédie romantique",
  "un documentaire animalier", "le match de la soirée", "une série policière inédite",
  "un télé-crochet musical", "un film d'action culte", "un magazine d'investigation",
];
const TV_SHOWS_EN = [
  "the big political debate", "an American thriller", "a romantic comedy",
  "a wildlife documentary", "tonight's big match", "a brand new crime series",
  "a musical talent show", "a cult action movie", "an investigative magazine",
];
const TV_CHANNELS = ["Canal Junky", "JCE One", "Empire TV", "Junky 24", "Arcade Channel"];

export function getTvProgramNews(): RadioNews {
  const seed = dateSeed();
  const showIdx = Math.floor(seed / 7) % TV_SHOWS_FR.length;
  const chanIdx = Math.floor(seed / 13) % TV_CHANNELS.length;
  const hour = 20 + (seed % 2); // 20h ou 21h
  return {
    fr: `Ce soir à la télé, à ${hour} heures sur ${TV_CHANNELS[chanIdx]} : ${TV_SHOWS_FR[showIdx]}. À ne pas manquer entre deux courses !`,
    en: `On TV tonight at ${hour}:00 on ${TV_CHANNELS[chanIdx]}: ${TV_SHOWS_EN[showIdx]}. Don't miss it between two rides!`,
  };
}

