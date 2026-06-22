import electro1 from "@/assets/radio/electro/paperplanerecords-automatic_high-512175.mp3.asset.json";
import pop1 from "@/assets/radio/pop/jonasblakewood-pop-524132.mp3.asset.json";
import pop2 from "@/assets/radio/pop/nastelbom-summer-pop-371361.mp3.asset.json";
import pop3 from "@/assets/radio/pop/the_mountain-pop-490010.mp3.asset.json";
import relax1 from "@/assets/radio/relax/the_mountain-deep-emotions-146990.mp3.asset.json";
import retro1 from "@/assets/radio/retro-wave/bodleasons-80s-retro-synth-wave-medium-2-version-223101.mp3.asset.json";
import rock1 from "@/assets/radio/rock/alex-morgan-rock-rock-music-545492.mp3.asset.json";
import rock2 from "@/assets/radio/rock/alex-morgan-rock-rock-music-545498.mp3.asset.json";
import rock3 from "@/assets/radio/rock/nastelbom-rock-rock-music-513418.mp3.asset.json";
import rock4 from "@/assets/radio/rock/paperplanerecords-sweat_on_the_chrome-512180.mp3.asset.json";
import extra1 from "@/assets/iron_tooth.mp3.asset.json";
import extra2 from "@/assets/junky_city_empire.mp3.asset.json";
import extra3 from "@/assets/midnight-fare.mp3.asset.json";

export type RadioTrack = {
  title: string;
  artist: string;
  url: string;
};

export type RadioStation = {
  id: string;
  name: string;
  emoji: string;
  tracks: RadioTrack[];
};

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: "celebrer",
    name: "Célébrer Radio",
    emoji: "🎉",
    tracks: [
      { title: "Summer Pop", artist: "Nastelbom", url: pop2.url },
      { title: "Pop Vibes", artist: "Jonas Blakewood", url: pop1.url },
      { title: "The Mountain", artist: "Pop Mix", url: pop3.url },
      { title: "Automatic High", artist: "Paperplane Records", url: electro1.url },
      { title: "80s Retro Synth", artist: "Bodleasons", url: retro1.url },
      { title: "Iron Tooth", artist: "Junky City", url: extra1.url },
      { title: "Junky City Empire", artist: "Junky City", url: extra2.url },
    ],
  },
  {
    id: "droitlibre",
    name: "Droit Libre",
    emoji: "🎵",
    tracks: [
      { title: "Rock Music 1", artist: "Alex Morgan", url: rock1.url },
      { title: "Rock Music 2", artist: "Alex Morgan", url: rock2.url },
      { title: "Rock Anthem", artist: "Nastelbom", url: rock3.url },
      { title: "Sweat on the Chrome", artist: "Paperplane Records", url: rock4.url },
      { title: "Deep Emotions", artist: "The Mountain", url: relax1.url },
      { title: "Midnight Fare", artist: "Junky City", url: extra3.url },
      { title: "Summer Pop", artist: "Nastelbom", url: pop2.url },
      { title: "Pop Vibes", artist: "Jonas Blakewood", url: pop1.url },
      { title: "The Mountain", artist: "Pop Mix", url: pop3.url },
      { title: "Automatic High", artist: "Paperplane Records", url: electro1.url },
      { title: "80s Retro Synth", artist: "Bodleasons", url: retro1.url },
      { title: "Iron Tooth", artist: "Junky City", url: extra1.url },
      { title: "Junky City Empire", artist: "Junky City", url: extra2.url },
    ],
  },
];
