import { Link } from "react-router-dom";
import { Radio, Tv } from "lucide-react";
import { TVAPP_CHANNELS } from "@/lib/iptv";
import bingLogo from "@/assets/bingbloom-logo.jpeg";

// Official channel logos so the row renders instantly without needing a playlist fetch.
const CHANNEL_LOGOS: Record<string, string> = {
  "bbc-news": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2022_%28Boxed%29.svg/512px-BBC_News_2022_%28Boxed%29.svg.png",
  "cnn": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/512px-CNN.svg.png",
  "fox-news": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Fox_News_Channel_logo.svg/512px-Fox_News_Channel_logo.svg.png",
  "msnbc": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/MSNBC_2015_logo.svg/512px-MSNBC_2015_logo.svg.png",
  "cnbc": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/512px-CNBC_logo.svg.png",
  "bloomberg": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/New_Bloomberg_Logo.svg/512px-New_Bloomberg_Logo.svg.png",
  "sky-news": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Sky_News_2020.svg/512px-Sky_News_2020.svg.png",
  "al-jazeera-english": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Aljazeera_eng.svg/512px-Aljazeera_eng.svg.png",
  "espn": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/512px-ESPN_wordmark.svg.png",
  "espn2": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/ESPN2_logo.svg/512px-ESPN2_logo.svg.png",
  "fox-sports-1": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/2015_Fox_Sports_1_logo.svg/512px-2015_Fox_Sports_1_logo.svg.png",
  "nfl-network": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/NFL_Network_logo.svg/512px-NFL_Network_logo.svg.png",
  "nba-tv": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/NBA_TV.svg/512px-NBA_TV.svg.png",
  "mlb-network": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/MLB_Network_logo.svg/512px-MLB_Network_logo.svg.png",
  "mtv": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/MTV-2021.svg/512px-MTV-2021.svg.png",
  "comedy-central": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Comedy_Central_2018.svg/512px-Comedy_Central_2018.svg.png",
  "tnt": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/TNT_Logo_2016.svg/512px-TNT_Logo_2016.svg.png",
};

interface Item {
  slug: string;
  name: string;
  logo?: string;
  to: string;
  bing?: boolean;
}

/** Compact horizontal row of curated live TV channels — Bing TV pinned first. */
const LiveTvRow = () => {
  // Prioritize the 7 named news channels + Bing TV first.
  const priorityOrder = ["bbc-news", "cnn", "fox-news", "msnbc", "cnbc", "bloomberg", "sky-news"];
  const priority = priorityOrder
    .map((slug) => TVAPP_CHANNELS.find((c) => c.slug === slug))
    .filter((c): c is (typeof TVAPP_CHANNELS)[number] => Boolean(c));
  const rest = TVAPP_CHANNELS.filter((c) => !priorityOrder.includes(c.slug)).slice(0, 14);

  const items: Item[] = [
    { slug: "bing-tv", name: "Bing TV", logo: bingLogo, to: "/live/bing-tv", bing: true },
    ...priority.map((c) => ({ slug: c.slug, name: c.name, logo: CHANNEL_LOGOS[c.slug], to: `/live-tv?ch=${encodeURIComponent(c.slug)}` })),
    ...rest.map((c) => ({ slug: c.slug, name: c.name, logo: CHANNEL_LOGOS[c.slug], to: `/live-tv?ch=${encodeURIComponent(c.slug)}` })),
  ];

  return (
    <section className="mt-6 md:mt-10 px-[5%]">
      <div className="mb-2 flex items-end justify-between md:mb-4">
        <h2 className="text-base font-bold text-foreground md:text-2xl flex items-center gap-2">
          <Radio className="h-4 w-4 md:h-5 md:w-5 text-primary" /> Live TV
        </h2>
        <Link to="/live-tv" className="text-xs text-primary/90 hover:text-primary md:text-sm">All ›</Link>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {items.map((ch) => (
          <Link
            key={ch.slug}
            to={ch.to}
            className="group flex-shrink-0 w-[120px] sm:w-[140px] md:w-[160px]"
          >
            <div className={`aspect-video rounded-lg overflow-hidden relative shadow-md transition-transform duration-200 group-hover:-translate-y-1 ring-1 ${ch.bing ? "ring-[#E50914]/70" : "ring-border"}`} style={{ background: ch.bing ? "linear-gradient(135deg,#1a0f10,#000)" : undefined }}>
              {ch.logo ? (
                <img
                  src={ch.logo}
                  alt={ch.name}
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-contain p-3 ${ch.bing ? "" : "bg-white/95"}`}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-foreground/70 bg-gradient-to-br from-surface-2 to-black">
                  <Tv className="h-7 w-7" />
                </div>
              )}
              <div className="absolute top-1 left-1 rounded-sm bg-primary px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wide text-primary-foreground">
                LIVE
              </div>
            </div>
            <p className="mt-1 text-[11px] md:text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary">
              {ch.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default LiveTvRow;

