// IPTV-org M3U parser + curated official-logo overrides.
// Source: https://iptv-org.github.io/iptv/index.m3u (CORS-enabled)

import cnnLogo from "@/assets/livetv/cnn.png.asset.json";
import bbcLogo from "@/assets/livetv/bbc.png.asset.json";
import foxLogo from "@/assets/livetv/foxnews.png.asset.json";
import msnbcLogo from "@/assets/livetv/msnbc.png.asset.json";
import cnbcLogo from "@/assets/livetv/cnbc.png.asset.json";
import bloombergLogo from "@/assets/livetv/bloomberg.png.asset.json";

export interface IptvChannel {
  name: string;
  url: string;
  logo?: string;
  group?: string;
  country?: string;
  kind?: "hls" | "youtube";
  handle?: string;
  embedUrl?: string;
}


// Official-logo overrides keyed by lowercased channel-name substring match.
export const OFFICIAL_LOGOS: Array<{ match: RegExp; url: string }> = [
  { match: /\bcnn\b/i, url: cnnLogo.url },
  { match: /\bbbc\b/i, url: bbcLogo.url },
  { match: /fox\s*news/i, url: foxLogo.url },
  { match: /\bmsnbc\b/i, url: msnbcLogo.url },
  { match: /\bcnbc\b/i, url: cnbcLogo.url },
  { match: /bloomberg/i, url: bloombergLogo.url },
];

export const applyOfficialLogo = (channel: IptvChannel): IptvChannel => {
  const hit = OFFICIAL_LOGOS.find((o) => o.match.test(channel.name));
  return hit ? { ...channel, logo: hit.url } : channel;
};

// Free-TV/IPTV is community-curated. We validate playlist entries before showing them
// so the page only lists channels with reachable HLS manifests.
const M3U_URL = "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8";
const FALLBACK_M3U_URL = "https://iptv-org.github.io/iptv/index.m3u";
const MAX_CHANNELS = 120;
const VALIDATION_TIMEOUT_MS = 3500;
const MAX_CANDIDATES = 240;
const VALIDATION_CONCURRENCY = 4;
const PREFERRED_COUNTRIES = new Set([
  "US","CA","GB","IE","AU","NZ","DE","FR","ES","IT","NL","BE","PT","SE","NO","DK","FI",
  "PL","CZ","AT","CH","GR","TR","RU","UA","RO","HU",
  "BR","MX","AR","CL","CO","PE",
  "JP","KR","CN","HK","TW","IN","PK","BD","TH","VN","ID","MY","PH",
  "ZA","NG","KE","EG","MA","TN","DZ",
  "AE","SA","QA","IL","JO",
]);
const PREFERRED_GROUPS = [
  "News","Sports","Entertainment","Movies","Music","Kids","Documentary","Science","Lifestyle","Comedy","Religious",
  "United States","Canada","United Kingdom","Australia","Germany","France","Spain","Italy","Brazil","Mexico","Japan","India","South Africa",
];

const VERIFIED_FALLBACK_CHANNELS: IptvChannel[] = [
  { name: "Bloomberg TV", url: "https://bloomberg.com/media-manifest/streams/us.m3u8", logo: "https://i.imgur.com/VnCcH73.png", group: "News", country: "US" },
  { name: "Al Jazeera", url: "https://live-hls-apps-aje-fa.getaj.net/AJE/index.m3u8", logo: "https://i.imgur.com/BB93NQP.png", group: "News", country: "QA" },
  { name: "DW", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8", logo: "https://i.imgur.com/A1xzjOI.png", group: "News", country: "DE" },
  { name: "NHK WORLD JAPAN", url: "https://master.nhkworld.jp/nhkworld-tv/playlist/live.m3u8", logo: "https://i.imgur.com/Mhw1Ihk.png", group: "News", country: "JP" },
  { name: "CGTN Documentary", url: "https://news.cgtn.com/resource/live/document/cgtn-doc.m3u8", logo: "https://i.imgur.com/JHv0WxM.png", group: "Documentary", country: "CN" },
  { name: "NASA TV Media", url: "https://ntv2.akamaized.net/hls/live/2013923/NASA-NTV2-HLS/master.m3u8", logo: "https://i.imgur.com/rmyfoOI.png", group: "Science", country: "US" },
  { name: "TV Cultura", url: "https://player-tvcultura.stream.uol.com.br/live/tvcultura.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/8/82/Cultura_logo_2013.svg", group: "Entertainment", country: "BR" },
  { name: "ICI RDI", url: "https://rcavlive.akamaized.net/hls/live/704025/xcanrdi/master.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/ICI_RDI_logo.svg/640px-ICI_RDI_logo.svg.png", group: "News", country: "CA" },
  { name: "FailArmy", url: "https://failarmy-international-it.samsung.wurl.tv/playlist.m3u8", logo: "https://i.imgur.com/WupT16d.jpg", group: "Entertainment", country: "US" },
  { name: "People Are Awesome", url: "https://jukin-peopleareawesome-2-it.samsung.wurl.tv/playlist.m3u8", logo: "https://i.imgur.com/xwz9zKk.jpeg", group: "Entertainment", country: "US" },
];

// Curated extra sports channels prepended to the live TV directory so the page
// always has a strong sports lineup regardless of community playlist drift.
export const CURATED_SPORTS_CHANNELS: IptvChannel[] = [
  { name: "Red Bull TV", url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master_928.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Red_Bull_TV_logo.svg/512px-Red_Bull_TV_logo.svg.png", group: "Sports", country: "AT" },
  { name: "Stadium", url: "https://stadiumlive-amg.amagi.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Stadium_logo.svg/512px-Stadium_logo.svg.png", group: "Sports", country: "US" },
  { name: "Fubo Sports Network", url: "https://fubo-fubosportsnetwork-1-eu.rakuten.wurl.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Fubo_Sports_Network_logo.svg/512px-Fubo_Sports_Network_logo.svg.png", group: "Sports", country: "US" },
  { name: "World Poker Tour", url: "https://wpt-amg.amagi.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/World_Poker_Tour_logo.svg/512px-World_Poker_Tour_logo.svg.png", group: "Sports", country: "US" },
  { name: "Outside TV", url: "https://outside-amg.amagi.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Outside_TV_logo.svg/512px-Outside_TV_logo.svg.png", group: "Sports", country: "US" },
  { name: "Glory Kickboxing", url: "https://glorykickboxing-amg.amagi.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/GLORY_World_Series_logo.svg/512px-GLORY_World_Series_logo.svg.png", group: "Sports", country: "NL" },
  { name: "Impact Wrestling", url: "https://impactwrestling-amg.amagi.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Impact_Wrestling_logo.svg/512px-Impact_Wrestling_logo.svg.png", group: "Sports", country: "US" },
  { name: "Bundesliga Stream", url: "https://bundesliga-amg.amagi.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Bundesliga_logo_%282017%29.svg/512px-Bundesliga_logo_%282017%29.svg.png", group: "Sports", country: "DE" },
  { name: "MAVTV Select", url: "https://mavtv-amg.amagi.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/MAVTV_logo.svg/512px-MAVTV_logo.svg.png", group: "Sports", country: "US" },
  { name: "Surf Now", url: "https://surfnow-amg.amagi.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Surfing_pictogram.svg/512px-Surfing_pictogram.svg.png", group: "Sports", country: "US" },
  { name: "Sport TV1 KE", url: "https://5cb2ab09b9d7a.streamlock.net/sporttv1/sporttv1/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Football_pictogram.svg/512px-Football_pictogram.svg.png", group: "Sports", country: "KE" },
  { name: "beIN SPORTS XTRA", url: "https://bein-bein-sports-xtra-en-us-plex.amagi.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/BeIN_Sports_logo_%282017%29.svg/512px-BeIN_Sports_logo_%282017%29.svg.png", group: "Sports", country: "QA" },
];

const proxiedStreamUrl = (url: string) => {
  const ref = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  return `https://${ref}.supabase.co/functions/v1/proxy?any=1&url=${encodeURIComponent(url)}`;
};

const attr = (line: string, key: string) => {
  const m = new RegExp(`${key}="([^"]*)"`).exec(line);
  return m ? m[1] : undefined;
};

async function fetchM3U(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`M3U ${res.status}`);
  return res.text();
}

const validateChannel = async (channel: IptvChannel): Promise<IptvChannel | null> => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), VALIDATION_TIMEOUT_MS);
  try {
    const res = await fetch(proxiedStreamUrl(channel.url), {
      signal: controller.signal,
      headers: { Accept: "application/vnd.apple.mpegurl, application/x-mpegURL, */*" },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
    const text = await res.text();
    if (
      text.trimStart().startsWith("#EXTM3U") ||
      contentType.includes("mpegurl") ||
      channel.url.toLowerCase().includes(".m3u8")
    ) {
      return channel;
    }
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
  return null;
};

const validateChannels = async (channels: IptvChannel[]) => {
  const verified: IptvChannel[] = [];
  const queue = [...channels];
  const workers = Array.from({ length: VALIDATION_CONCURRENCY }, async () => {
    while (queue.length > 0 && verified.length < MAX_CHANNELS) {
      const channel = queue.shift();
      if (!channel) return;
      const valid = await validateChannel(channel);
      if (valid && verified.length < MAX_CHANNELS) verified.push(valid);
      // Small jitter so we don't pummel the proxy
      await new Promise((r) => setTimeout(r, 40 + Math.random() * 80));
    }
  });
  await Promise.all(workers);
  return verified;
};

export async function fetchIptvChannels(): Promise<IptvChannel[]> {
  let text: string;
  try {
    text = await fetchM3U(M3U_URL);
  } catch {
    text = await fetchM3U(FALLBACK_M3U_URL);
  }
  const lines = text.split(/\r?\n/);
  const out: IptvChannel[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("#EXTINF")) continue;
    const url = (lines[i + 1] || "").trim();
    if (!url || url.startsWith("#")) continue;
    if (!/^https?:\/\//i.test(url) || seen.has(url)) continue;
    seen.add(url);
    const namePart = line.split(",").slice(1).join(",").trim();
    out.push({
      name: (namePart || "Unknown").replace(/\s*[ⓈⒼ]$/u, ""),
      url,
      logo: attr(line, "tvg-logo"),
      group: attr(line, "group-title") || "Other",
      country: attr(line, "tvg-country"),
    });
  }
  const preferred = out.sort((a, b) => {
    const aScore = Number(PREFERRED_COUNTRIES.has(a.country || "")) * 3 + Number(a.url.startsWith("https://"));
    const bScore = Number(PREFERRED_COUNTRIES.has(b.country || "")) * 3 + Number(b.url.startsWith("https://"));
    return bScore - aScore;
  });
  const curated = preferred.filter(
    (c) => PREFERRED_COUNTRIES.has(c.country || "") || PREFERRED_GROUPS.some((group) => c.group?.includes(group)),
  );
  const candidates = (curated.length > 0 ? curated : preferred).slice(0, MAX_CANDIDATES);
  const verified = await validateChannels(candidates);
  const base = (verified.length > 0 ? verified : VERIFIED_FALLBACK_CHANNELS).map(applyOfficialLogo);
  // Prepend curated sports channels (deduped by URL) so the page always has a sports lineup.
  const seenUrls = new Set(base.map((c) => c.url));
  const sports = CURATED_SPORTS_CHANNELS.filter((c) => !seenUrls.has(c.url)).map(applyOfficialLogo);
  const { buildYouTubeChannels } = await import("./youtubeLive");
  const yt = buildYouTubeChannels();
  return [...yt, ...sports, ...base];
}


// thetvapp.to passive embed channel directory
export interface TvAppChannel {
  name: string;
  slug: string;
  category: string;
}

export const TVAPP_CHANNELS: TvAppChannel[] = [
  // News
  { name: "BBC News", slug: "bbc-news", category: "News" },
  { name: "CNN", slug: "cnn", category: "News" },
  { name: "Fox News", slug: "fox-news", category: "News" },
  { name: "MSNBC", slug: "msnbc", category: "News" },
  { name: "CNBC", slug: "cnbc", category: "News" },
  { name: "Bloomberg", slug: "bloomberg", category: "News" },
  { name: "Sky News", slug: "sky-news", category: "News" },
  { name: "Al Jazeera", slug: "al-jazeera-english", category: "News" },
  // Sports
  { name: "ESPN", slug: "espn", category: "Sports" },
  { name: "ESPN 2", slug: "espn2", category: "Sports" },
  { name: "Fox Sports 1", slug: "fox-sports-1", category: "Sports" },
  { name: "NFL Network", slug: "nfl-network", category: "Sports" },
  { name: "NBA TV", slug: "nba-tv", category: "Sports" },
  { name: "MLB Network", slug: "mlb-network", category: "Sports" },
  { name: "Tennis Channel", slug: "tennis-channel", category: "Sports" },
  // Entertainment
  { name: "MTV", slug: "mtv", category: "Entertainment" },
  { name: "VH1", slug: "vh1", category: "Entertainment" },
  { name: "Comedy Central", slug: "comedy-central", category: "Entertainment" },
  { name: "TNT", slug: "tnt", category: "Entertainment" },
  { name: "TBS", slug: "tbs", category: "Entertainment" },
  { name: "USA Network", slug: "usa-network", category: "Entertainment" },
  { name: "FX", slug: "fx", category: "Entertainment" },
  { name: "AMC", slug: "amc", category: "Entertainment" },
  { name: "Bravo", slug: "bravo", category: "Entertainment" },
  // Discovery / Docs
  { name: "Discovery", slug: "discovery", category: "Documentary" },
  { name: "Animal Planet", slug: "animal-planet", category: "Documentary" },
  { name: "History", slug: "history", category: "Documentary" },
  { name: "National Geographic", slug: "national-geographic", category: "Documentary" },
  { name: "Science", slug: "science", category: "Documentary" },
  { name: "Travel Channel", slug: "travel-channel", category: "Documentary" },
  // Kids
  { name: "Cartoon Network", slug: "cartoon-network", category: "Kids" },
  { name: "Nickelodeon", slug: "nickelodeon", category: "Kids" },
  { name: "Disney Channel", slug: "disney-channel", category: "Kids" },
  { name: "Disney Junior", slug: "disney-junior", category: "Kids" },
  // Lifestyle
  { name: "Food Network", slug: "food-network", category: "Lifestyle" },
  { name: "HGTV", slug: "hgtv", category: "Lifestyle" },
  { name: "TLC", slug: "tlc", category: "Lifestyle" },
  { name: "Lifetime", slug: "lifetime", category: "Lifestyle" },
  { name: "E!", slug: "e", category: "Lifestyle" },
];

export const tvappEmbedUrl = (slug: string) => `https://thetvapp.to/embed/${slug}/`;
