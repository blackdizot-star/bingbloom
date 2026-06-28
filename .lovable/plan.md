# BingBloom: APK swap, install nudge, downloads manager, subtitles, full SEO

## 1. Replace bundled APK
- Upload `/mnt/user-uploads/BINGBLOOM_APK_APP_OFFICIAL.apk` via `lovable-assets create`, overwrite `src/assets/bingbloom-app.apk.asset.json` with the new CDN URL.
- `InstallAppPage` already reads from that asset → real download stays wired. Verify filename `BingBloom.apk` and `Content-Disposition: attachment` works (it does — Lovable assets CDN serves raw file).

## 2. First-visit install nudge (mobile only)
- New `src/components/InstallNudge.tsx`: small bottom toast (mobile-only via `useIsMobile`), shows once (localStorage flag `bb_install_nudge_v1`), CTA "Install app" → `/install`, dismiss "X".
- Mount in `AppLayout.tsx`; 3s delay; hide on `/install`, `/onboarding/*`, `/welcome`.

## 3. Downloads page in desktop top bar
- Add `Downloads` link next to theme toggle in `TopBar.tsx` (desktop only, `hidden md:inline-flex`) → `/my-downloads` (route already exists).
- Surface badge with active-download count from new downloads store.

## 4. Real download manager (progress / pause / resume + subtitle download)
- New `src/lib/downloadManager.ts`: uses `fetch` + `ReadableStream` reader to download video URL in chunks, stores Blob parts in IndexedDB (`bb-downloads` DB), exposes `start/pause/resume/cancel/list` and a Zustand-like subscribe API. Computes `progress` from `Content-Length`. Resume uses HTTP `Range` headers when server supports; otherwise re-starts from saved byte count.
- Hook `src/hooks/useDownloads.ts` exposing reactive list.
- `MyDownloadsPage.tsx` rewrite: lists items with progress bar (`<Progress />`), Pause/Resume/Cancel/Delete buttons, Open file (assembles Blob → object URL → `<video>` modal).
- Subtitle download: when starting, also fetch `.vtt`/`.srt` URL if provided (from OpenSubtitles search by IMDb id or TMDB title) and store alongside. Best-effort; skip silently on failure.

## 5. Player subtitles section
- `VideoPlayer.tsx`: add subtitle picker dropdown (gear icon → "Subtitles" submenu). Sources:
  1. Downloaded subtitle (if playing local file)
  2. Remote OpenSubtitles search results (English + auto-detect)
  3. "Off"
- Inject `<track kind="subtitles" src=... default>` and toggle `track.mode`.
- New `src/lib/subtitles.ts`: `searchSubtitles(query, imdbId?)` against `https://rest.opensubtitles.org/search` (free, no key) with `X-User-Agent` header, returns `{lang,label,url}[]`. Convert `.srt` → `.vtt` in-browser via tiny converter.

## 6. SEO — robots, sitemap, JSON-LD, meta, FAQ, blog
- **robots.txt**: keep allow-all (already correct), confirm `Sitemap:` directive points to `https://bingbloom.lovable.app/sitemap.xml`.
- **sitemap**: bump `scripts/generate-sitemap.ts` to fetch live TMDB popular movies (≥100) + popular TV (≥20) + season/episode entries for top 5 shows + blog posts + `/movie-faq`. Keep static pages. Cap unchanged or raise to 400+. Add `lastmod=today`.
- **JSON-LD**: extend `SEO.tsx` already supports `jsonLd`. Add helpers in `src/lib/seoSchemas.ts`: `websiteSchema`, `organizationSchema`, `movieSchema`, `tvSeriesSchema`, `softwareApplicationSchema`, `faqSchema`, `breadcrumbSchema`.
- Inject `WebSite + SearchAction` + `SoftwareApplication` on `HomePage`.
- Inject `Movie` schema on `MovieDetailPage` (name, image=poster, datePublished, aggregateRating, director, actors from TMDB credits).
- Inject `TVSeries` schema on `TVDetailPage`.
- **Meta titles**: MovieDetailPage title format `"{title} ({year}) | Watch Free on BingBloom"`, description from TMDB overview (160 char trim).
- **Internal links**: MovieDetailPage already has recommendations row — ensure each card is `<Link to="/movie/:id">` (verify, fix if not).
- **Movie FAQ page** `/movie-faq`: new `src/pages/MovieFAQ.tsx` with 20 Q&A about popular movies + FAQPage schema. Route in `App.tsx`.
- **Quick Answers on movie page**: new `QuickAnswers` component (4 collapsibles: "Where to watch X for free?", "Is X on Netflix?", "Cast of X", "X runtime/rating") injected above recommendations.
- **Blog**: new `src/pages/Blog.tsx` index + `src/pages/BlogPost.tsx` detail. 5 seed posts in `src/data/blogPosts.ts` with full markdown bodies. Routes `/blog` and `/blog/:slug`. Article JSON-LD on each post.

## 7. Performance touch-ups (low-risk only)
- Verify routes in `App.tsx` already use `React.lazy` (they do).
- Add `loading="lazy"` to non-hero `<img>` in cards if missing.
- Skip Partytown / Workbox custom rewrite — vite-plugin-pwa already handles SW.

## 8. Verify
- `bun run build` → must succeed, sitemap log ≥ 250 entries.
- Open `/install` → APK download triggers.
- Open `/my-downloads` → start a sample download, pause, resume, play.
- Open `/movie-faq` and `/blog` → render, JSON-LD in head.

## Files added
- src/components/InstallNudge.tsx
- src/components/QuickAnswers.tsx
- src/lib/downloadManager.ts
- src/lib/subtitles.ts
- src/lib/seoSchemas.ts
- src/hooks/useDownloads.ts
- src/pages/MovieFAQ.tsx
- src/pages/Blog.tsx
- src/pages/BlogPost.tsx
- src/data/blogPosts.ts

## Files edited
- src/assets/bingbloom-app.apk.asset.json (new CDN URL)
- src/components/AppLayout.tsx (mount nudge)
- src/components/TopBar.tsx (Downloads link desktop)
- src/components/VideoPlayer.tsx (subtitle picker)
- src/pages/MyDownloadsPage.tsx (real manager UI)
- src/pages/MovieDetailPage.tsx (Movie schema, title, QuickAnswers)
- src/pages/TVDetailPage.tsx (TVSeries schema)
- src/pages/HomePage.tsx (WebSite + SoftwareApplication schema)
- src/App.tsx (new routes)
- scripts/generate-sitemap.ts (TMDB fetch, blog, faq)
- public/robots.txt (verify)
