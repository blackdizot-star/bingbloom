// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://bingbloom.lovable.app";

interface ImageRef { loc: string; caption?: string; }
interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  images?: ImageRef[];
}

// 15+ image references — used both inline in sitemap entries and as evergreen
// poster/backdrop links that crawlers can discover.
const IMG = {
  hero: "https://image.tmdb.org/t/p/w1280/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
  trending1: "https://image.tmdb.org/t/p/w780/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  trending2: "https://image.tmdb.org/t/p/w780/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
  trending3: "https://image.tmdb.org/t/p/w780/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg",
  movies1: "https://image.tmdb.org/t/p/w780/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  movies2: "https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
  tv1: "https://image.tmdb.org/t/p/w780/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg",
  tv2: "https://image.tmdb.org/t/p/w780/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
  anime1: "https://image.tmdb.org/t/p/w780/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
  anime2: "https://image.tmdb.org/t/p/w780/x4HHy6V7TbXmoEgKQTwwR7BdY9k.jpg",
  animation1: "https://image.tmdb.org/t/p/w780/askg3SMvhqEl4OL52YuvdtY40Yb.jpg",
  doc1: "https://image.tmdb.org/t/p/w780/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
  music1: "https://image.tmdb.org/t/p/w780/uOw5JD8IlD546feZ6oxbIjvN66P.jpg",
  podcast1: "https://image.tmdb.org/t/p/w780/zfwEPjB1cASgGCw5ercAh50WiHl.jpg",
  livetv1: "https://image.tmdb.org/t/p/w780/qhb1qOilapbapxWQn9jtRCMwXJF.jpg",
} as const;

const entries: SitemapEntry[] = [
  { path: "/",           changefreq: "daily",   priority: "1.0", images: [{ loc: IMG.hero, caption: "BingBloom — stream movies, TV, anime, live channels and music free" }] },
  { path: "/home",       changefreq: "daily",   priority: "1.0", images: [{ loc: IMG.hero, caption: "BingBloom home — trending movies and shows" }] },
  { path: "/movies",     changefreq: "daily",   priority: "0.9", images: [{ loc: IMG.movies1, caption: "Browse movies on BingBloom" }, { loc: IMG.movies2, caption: "Popular movies streaming free" }] },
  { path: "/tv",         changefreq: "daily",   priority: "0.9", images: [{ loc: IMG.tv1, caption: "Browse TV series on BingBloom" }, { loc: IMG.tv2, caption: "Trending TV shows" }] },
  { path: "/anime",      changefreq: "daily",   priority: "0.8", images: [{ loc: IMG.anime1, caption: "Stream anime free on BingBloom" }, { loc: IMG.anime2 }] },
  { path: "/animation",  changefreq: "weekly",  priority: "0.7", images: [{ loc: IMG.animation1, caption: "Animated movies and series" }] },
  { path: "/documentary",changefreq: "weekly",  priority: "0.7", images: [{ loc: IMG.doc1, caption: "Documentary films and series on BingBloom" }] },
  { path: "/live-tv",    changefreq: "daily",   priority: "0.8", images: [{ loc: IMG.livetv1, caption: "80+ live TV channels worldwide" }] },
  { path: "/novels",     changefreq: "weekly",  priority: "0.6" },
  { path: "/podcasts",   changefreq: "weekly",  priority: "0.6", images: [{ loc: IMG.podcast1, caption: "Podcasts on BingBloom" }] },
  { path: "/music",      changefreq: "weekly",  priority: "0.6", images: [{ loc: IMG.music1, caption: "Music streaming on BingBloom" }] },
  { path: "/search",     changefreq: "weekly",  priority: "0.7" },
  { path: "/watch",      changefreq: "daily",   priority: "0.7" },
  { path: "/install",    changefreq: "monthly", priority: "0.8" },
  { path: "/my-list",    changefreq: "monthly", priority: "0.4" },
  { path: "/liked",      changefreq: "monthly", priority: "0.4" },
  { path: "/library",    changefreq: "monthly", priority: "0.4" },
  { path: "/my-downloads", changefreq: "monthly", priority: "0.5" },
  { path: "/contact",    changefreq: "yearly",  priority: "0.3" },
  { path: "/support",    changefreq: "yearly",  priority: "0.3" },
  { path: "/help",       changefreq: "yearly",  priority: "0.3" },
  { path: "/privacy",    changefreq: "yearly",  priority: "0.3" },
  { path: "/follow-us",  changefreq: "monthly", priority: "0.5" },
  { path: "/welcome",    changefreq: "monthly", priority: "0.5" },
  { path: "/profile",    changefreq: "monthly", priority: "0.3" },
  { path: "/settings",   changefreq: "monthly", priority: "0.3" },
  { path: "/signin",     changefreq: "monthly", priority: "0.5" },
  { path: "/register",   changefreq: "monthly", priority: "0.5" },
  { path: "/onboarding/phone",   changefreq: "monthly", priority: "0.3" },
  { path: "/onboarding/genres",  changefreq: "monthly", priority: "0.3" },
  { path: "/onboarding/titles",  changefreq: "monthly", priority: "0.3" },
  { path: "/onboarding/social",  changefreq: "monthly", priority: "0.3" },
  { path: "/onboarding/done",    changefreq: "monthly", priority: "0.3" },
  // Genre landing pages
  { path: "/genre/28",   changefreq: "weekly",  priority: "0.6" }, // Action
  { path: "/genre/35",   changefreq: "weekly",  priority: "0.6" }, // Comedy
  { path: "/genre/18",   changefreq: "weekly",  priority: "0.6" }, // Drama
  { path: "/genre/27",   changefreq: "weekly",  priority: "0.6" }, // Horror
  { path: "/genre/878",  changefreq: "weekly",  priority: "0.6" }, // Sci-Fi
  { path: "/genre/10749",changefreq: "weekly",  priority: "0.6" }, // Romance
  { path: "/genre/53",   changefreq: "weekly",  priority: "0.6" }, // Thriller
  { path: "/genre/16",   changefreq: "weekly",  priority: "0.6" }, // Animation
  { path: "/genre/80",   changefreq: "weekly",  priority: "0.6" }, // Crime
  { path: "/genre/14",   changefreq: "weekly",  priority: "0.6" }, // Fantasy
  { path: "/genre/9648", changefreq: "weekly",  priority: "0.6" }, // Mystery
  { path: "/genre/12",   changefreq: "weekly",  priority: "0.6" }, // Adventure
  // Sample evergreen detail pages (popular TMDB IDs)
  { path: "/movie/872585",  changefreq: "weekly", priority: "0.7", images: [{ loc: IMG.trending1, caption: "Oppenheimer" }] },
  { path: "/movie/693134",  changefreq: "weekly", priority: "0.7", images: [{ loc: IMG.trending2, caption: "Dune: Part Two" }] },
  { path: "/movie/569094",  changefreq: "weekly", priority: "0.7", images: [{ loc: IMG.trending3, caption: "Spider-Man: Across the Spider-Verse" }] },
  { path: "/tv/94605",      changefreq: "weekly", priority: "0.7", images: [{ loc: IMG.tv1, caption: "Arcane" }] },
  { path: "/tv/1399",       changefreq: "weekly", priority: "0.7", images: [{ loc: IMG.tv2, caption: "Game of Thrones" }] },
  { path: "/tv/66732",      changefreq: "weekly", priority: "0.7" }, // Stranger Things
  { path: "/tv/60625",      changefreq: "weekly", priority: "0.7" }, // Rick and Morty
  // Corporate / legal / info pages
  { path: "/faq",                changefreq: "monthly", priority: "0.5" },
  { path: "/investors",          changefreq: "monthly", priority: "0.5" },
  { path: "/ways-to-watch",      changefreq: "monthly", priority: "0.6" },
  { path: "/corporate",          changefreq: "yearly",  priority: "0.4" },
  { path: "/legal-notices",      changefreq: "yearly",  priority: "0.3" },
  { path: "/jobs",               changefreq: "monthly", priority: "0.5" },
  { path: "/terms",              changefreq: "yearly",  priority: "0.4" },
  { path: "/only-on-bingbloom",  changefreq: "monthly", priority: "0.6" },
  { path: "/redeem",             changefreq: "monthly", priority: "0.4" },
  { path: "/speed-test",         changefreq: "yearly",  priority: "0.3" },
  { path: "/ad-choices",         changefreq: "yearly",  priority: "0.3" },
  { path: "/media",              changefreq: "monthly", priority: "0.4" },
  { path: "/gift-cards",         changefreq: "monthly", priority: "0.4" },
  { path: "/cookie-preferences", changefreq: "yearly",  priority: "0.3" },
  { path: "/legal-guarantee",    changefreq: "yearly",  priority: "0.3" },
];

const SITEMAP_NS = `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`;

function generateSitemap(entries: SitemapEntry[]) {
  const description =
    "BingBloom — stream and download movies, TV shows, anime, live TV channels, podcasts and music. " +
    "Visit https://bingbloom.lovable.app";
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
    `<!-- ${description} -->`,
    `<urlset ${SITEMAP_NS}>`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
