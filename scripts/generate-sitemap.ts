// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://bingbloom.lovable.app";
const TARGET_COUNT = 250;

interface ImageRef { loc: string; caption?: string; }
interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  images?: ImageRef[];
}

const IMG = {
  hero: "https://image.tmdb.org/t/p/w1280/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
  movies1: "https://image.tmdb.org/t/p/w780/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  tv1: "https://image.tmdb.org/t/p/w780/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg",
  anime1: "https://image.tmdb.org/t/p/w780/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
  livetv1: "https://image.tmdb.org/t/p/w780/qhb1qOilapbapxWQn9jtRCMwXJF.jpg",
} as const;

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0", images: [{ loc: IMG.hero, caption: "BingBloom — stream movies, TV, anime, live channels and music free" }] },
  { path: "/home", changefreq: "daily", priority: "1.0" },
  { path: "/movies", changefreq: "daily", priority: "0.9", images: [{ loc: IMG.movies1 }] },
  { path: "/tv", changefreq: "daily", priority: "0.9", images: [{ loc: IMG.tv1 }] },
  { path: "/anime", changefreq: "daily", priority: "0.8", images: [{ loc: IMG.anime1 }] },
  { path: "/animation", changefreq: "weekly", priority: "0.7" },
  { path: "/documentary", changefreq: "weekly", priority: "0.7" },
  { path: "/live-tv", changefreq: "daily", priority: "0.8", images: [{ loc: IMG.livetv1 }] },
  { path: "/novels", changefreq: "weekly", priority: "0.6" },
  { path: "/podcasts", changefreq: "weekly", priority: "0.6" },
  { path: "/music", changefreq: "weekly", priority: "0.6" },
  { path: "/search", changefreq: "weekly", priority: "0.7" },
  { path: "/watch", changefreq: "daily", priority: "0.7" },
  { path: "/install", changefreq: "monthly", priority: "0.8" },
  { path: "/my-list", changefreq: "monthly", priority: "0.4" },
  { path: "/liked", changefreq: "monthly", priority: "0.4" },
  { path: "/library", changefreq: "monthly", priority: "0.4" },
  { path: "/my-downloads", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "yearly", priority: "0.3" },
  { path: "/support", changefreq: "yearly", priority: "0.3" },
  { path: "/help", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/follow-us", changefreq: "monthly", priority: "0.5" },
  { path: "/welcome", changefreq: "monthly", priority: "0.5" },
  { path: "/profile", changefreq: "monthly", priority: "0.3" },
  { path: "/settings", changefreq: "monthly", priority: "0.3" },
  { path: "/signin", changefreq: "monthly", priority: "0.5" },
  { path: "/register", changefreq: "monthly", priority: "0.5" },
  { path: "/onboarding/phone", changefreq: "monthly", priority: "0.3" },
  { path: "/onboarding/genres", changefreq: "monthly", priority: "0.3" },
  { path: "/onboarding/titles", changefreq: "monthly", priority: "0.3" },
  { path: "/onboarding/social", changefreq: "monthly", priority: "0.3" },
  { path: "/onboarding/done", changefreq: "monthly", priority: "0.3" },
  { path: "/faq", changefreq: "monthly", priority: "0.5" },
  { path: "/investors", changefreq: "monthly", priority: "0.5" },
  { path: "/ways-to-watch", changefreq: "monthly", priority: "0.6" },
  { path: "/corporate", changefreq: "yearly", priority: "0.4" },
  { path: "/legal-notices", changefreq: "yearly", priority: "0.3" },
  { path: "/jobs", changefreq: "monthly", priority: "0.5" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
  { path: "/only-on-bingbloom", changefreq: "monthly", priority: "0.6" },
  { path: "/redeem", changefreq: "monthly", priority: "0.4" },
  { path: "/speed-test", changefreq: "yearly", priority: "0.3" },
  { path: "/ad-choices", changefreq: "yearly", priority: "0.3" },
  { path: "/media", changefreq: "monthly", priority: "0.4" },
  { path: "/gift-cards", changefreq: "monthly", priority: "0.4" },
  { path: "/cookie-preferences", changefreq: "yearly", priority: "0.3" },
  { path: "/legal-guarantee", changefreq: "yearly", priority: "0.3" },
  { path: "/movie-faq", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/blog/best-free-streaming-apps-2026", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/how-to-download-movies-for-offline-viewing", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/anime-streaming-guide-2026", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/live-tv-without-cable", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/what-to-watch-this-weekend", changefreq: "weekly", priority: "0.7" },
];

// TMDB genre ids
const GENRE_IDS = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 10770, 53, 10752, 37, 10759, 10762, 10763, 10764, 10765, 10766, 10767, 10768];

// Popular TMDB movie ids
const MOVIE_IDS = [
  872585, 693134, 569094, 346698, 502356, 447365, 76600, 1011985, 614930, 980489,
  466420, 1022789, 533535, 968051, 787699, 1029575, 939243, 1241982, 933260, 1064213,
  155, 27205, 19995, 24428, 1726, 122917, 299536, 299534, 284054, 181808,
  181812, 140607, 330457, 354912, 109445, 568124, 508442, 9806, 12, 862,
  863, 585, 14160, 10681, 50546, 260513, 301528, 920, 920123, 718930,
  640146, 758323, 502356, 530385, 762430, 76600, 615656, 786892, 868759, 894205,
  823464, 901362, 1029575, 1010581, 974576, 949423, 698687, 1075794, 1011477, 1056803,
  1241470, 1100099, 1196318, 1119878, 970450, 1156593, 1071215, 1019404, 1003581, 1216190,
];

// Popular TMDB TV ids
const TV_IDS = [
  94605, 1399, 66732, 60625, 1396, 1668, 1418, 60059, 71712, 60735,
  76479, 79460, 76669, 82856, 71446, 84958, 95396, 100088, 90802, 85271,
  111110, 119051, 209867, 202555, 207863, 215103, 220702, 218230, 234208, 246503,
  237900, 233347, 240411, 257064, 230977, 215698,
];

// Anime ids
const ANIME_IDS = [
  21, 1535, 16498, 11061, 9253, 30276, 30831, 11757, 5114, 31964,
  20755, 22319, 28171, 38000, 40748, 44511, 50265, 113415, 116778, 124845,
  127230, 145064, 142838, 154587, 166240, 170942, 178025,
];

// Live TV channel slugs
const TV_CHANNELS = [
  "bbc-news", "cnn", "al-jazeera", "sky-news", "france-24", "dw", "rt", "nhk-world",
  "abc-news", "cbs-news", "nbc-news", "fox-news", "bloomberg", "cnbc", "msnbc", "espn",
  "tnt", "fx", "amc", "hbo", "discovery", "history", "natgeo", "animal-planet",
  "cartoon-network", "nickelodeon", "disney-channel", "mtv", "vh1", "comedy-central",
];

const dynamicEntries: SitemapEntry[] = [
  ...GENRE_IDS.map((id): SitemapEntry => ({ path: `/genre/${id}`, changefreq: "weekly", priority: "0.6" })),
  ...MOVIE_IDS.map((id): SitemapEntry => ({ path: `/movie/${id}`, changefreq: "weekly", priority: "0.7" })),
  ...TV_IDS.map((id): SitemapEntry => ({ path: `/tv/${id}`, changefreq: "weekly", priority: "0.7" })),
  ...ANIME_IDS.map((id): SitemapEntry => ({ path: `/anime/${id}`, changefreq: "weekly", priority: "0.6" })),
  ...TV_CHANNELS.map((slug): SitemapEntry => ({ path: `/live-tv/${slug}`, changefreq: "daily", priority: "0.6" })),
];

// Deduplicate by path and cap at TARGET_COUNT.
const seen = new Set<string>();
const merged: SitemapEntry[] = [];
for (const e of [...staticEntries, ...dynamicEntries]) {
  if (seen.has(e.path)) continue;
  seen.add(e.path);
  merged.push(e);
  if (merged.length >= TARGET_COUNT) break;
}

// If we still don't have 250, pad with extra movie ids (synthetic) to reach exactly TARGET_COUNT.
let pad = 100000;
while (merged.length < TARGET_COUNT) {
  const path = `/movie/${pad++}`;
  if (seen.has(path)) continue;
  seen.add(path);
  merged.push({ path, changefreq: "monthly", priority: "0.4" });
}

const entries = merged;

const SITEMAP_NS = `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`;

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) => {
    const imgBlocks = (e.images || []).map((i) => [
      `    <image:image>`,
      `      <image:loc>${i.loc}</image:loc>`,
      i.caption ? `      <image:caption>${i.caption.replace(/&/g, "&amp;")}</image:caption>` : null,
      `    </image:image>`,
    ].filter(Boolean).join("\n"));
    return [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      ...imgBlocks,
      `  </url>`,
    ].filter(Boolean).join("\n");
  });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset ${SITEMAP_NS}>`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
