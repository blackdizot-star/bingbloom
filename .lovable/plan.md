
# BingBloom: Ad cleanup, Video SEO, FAQ hub, Bing TV & Live TV upgrade, full SEO pass

## 1. Ads — revert to old clean placement (premium feel)
Remove all `<LazyNativeAd>` placements added in the last pass; restore ONLY the original `<InlineAdRow>` slots that were there before. Keep the ad network the same (`NativeAd` iframe) but limit to **4 slots max per page**, small/compact size (≤60px mobile).

- Delete `src/components/LazyNativeAd.tsx`.
- Edit `HomePage.tsx`, `SearchPage.tsx`, `MovieDetailPage.tsx`, `TVDetailPage.tsx`, `EpisodesList.tsx`, `MovieWatchPage.tsx`, `TvWatchPage.tsx`, `AppLayout.tsx` — remove every `LazyNativeAd` import + JSX. Restore the original 3–4 `<InlineAdRow>` rows on Home (between sections), 1 on Search (after ~10 results), 1 on movie/TV detail (below description), 1 below player.
- Ensure `NativeAd` uses `compact` variant everywhere.

## 2. Video sitemap — 150 videos for Google Video indexing
- New generator: extend `scripts/generate-sitemap.ts` to also emit `public/video-sitemap.xml` with **150 entries** (100 movies + 50 TV) using Google's Video sitemap namespace:
  ```xml
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
    <url>
      <loc>https://bingbloom.lovable.app/movie/{id}</loc>
      <video:video>
        <video:thumbnail_loc>https://image.tmdb.org/t/p/w500{poster}</video:thumbnail_loc>
        <video:title>{title}</video:title>
        <video:description>{overview}</video:description>
        <video:player_loc allow_embed="yes">https://bingbloom.lovable.app/watch/movie/{id}</video:player_loc>
        <video:duration>{runtime*60}</video:duration>
        <video:publication_date>{release_date}</video:publication_date>
        <video:family_friendly>yes</video:family_friendly>
      </video:video>
    </url>
  </urlset>
  ```
- Add a **sitemap index** `public/sitemap-index.xml` pointing to `sitemap.xml` + `video-sitemap.xml` + `faq-sitemap.xml`.
- Reference `sitemap-index.xml` in `robots.txt`.
- Submit both `video-sitemap.xml` and `sitemap-index.xml` to Google Search Console via the connector.

## 3. FAQ hub — 100 questions
- New page `src/pages/FAQsPage.tsx` at route `/faqs` — 100 questions/answers, every answer names **BingBloom** and links to `/movies`, `/live`, `/install`, etc.
- Questions grouped into categories (Streaming, Movies, TV, Live TV, Music, App, Legal, Account) with shadcn `Accordion`, dark theme.
- `FAQPage` JSON-LD covering all 100 Q&A (chunked to keep script tag under ~30KB).
- Add link in `Footer.tsx` under a new "Help" column: "FAQs & Questions" → `/faqs`.
- Remove `QuickAnswers` component usage from `MovieDetailPage.tsx` (delete the import + `<QuickAnswers />` render — leave the file for now).
- New generator output `public/faq-sitemap.xml` — one URL per top-30 question as `/faqs#q-{n}` (Google handles fragment sitemaps as the base URL, but they signal freshness).
- Register `/faqs` route in `App.tsx`.

## 4. Bing TV + branded Live TV
### Bing TV (in-app live channel)
- New virtual channel `bing-tv` injected at the **top** of the Live TV list in `HomePage.tsx` live row and `LiveTVPage.tsx`.
- Logo: `src/assets/bingbloom-official-logo.png`.
- Behavior: when selected, opens a full-screen player that auto-plays a rotating queue of TMDB popular movies via the existing `MoviePlayer`. Programme guide shows next 6 movies with start/end times computed from runtime.
- Component: `src/components/BingTvChannel.tsx` — fetches `popular` movies, builds a schedule array, on mount picks the "currently airing" movie based on wall-clock modulo total-runtime.
- New route `/live/bing-tv` renders this component.

### Official channel logos
Add hardcoded logo overrides in `src/lib/iptv.ts` for: BBC News, CNN, Fox News, MSNBC, CNBC, Bloomberg, Sky News — using Wikipedia SVG CDN URLs (e.g., `upload.wikimedia.org/.../BBC_News_2022.svg`).

### More reliable channels
- Update IPTV source list in `src/lib/iptv.ts` to fetch from:
  - `https://iptv-org.github.io/iptv/index.m3u` (primary)
  - `https://iptv-org.github.io/iptv/categories/news.m3u` (news pinned)
  - `https://iptv-org.github.io/iptv/categories/sports.m3u` (sports section)
- Filter out dead entries (skip channels without valid `tvg-logo` or `http` URL), dedupe by name.
- Prioritize the 7 named news channels at top after Bing TV.

## 5. SEO pass
- **Meta tags** — audit every page (`MoviesPage`, `TVPage`, `AnimePage`, `LiveTVPage`, `MusicPage`, `PodcastsPage`, `MovieDetailPage`, `TVDetailPage`, `SearchPage`, `InstallAppPage`, `Blog`, `BlogPost`, `FAQsPage`, `MovieFAQ`) — confirm each has unique `<SEO title description jsonLd>` via `react-helmet-async` (already installed). Fix any missing.
- **JSON-LD**:
  - Home: `SoftwareApplication` + `WebSite` + `Organization` (already partial — verify).
  - Movie detail: `Movie` schema (already exists — verify populated).
  - TV detail: `TVSeries` schema (verify).
  - FAQs page: `FAQPage` with all 100 Q&A.
  - Movie FAQ page: keep existing `FAQPage`.
- **"People also watched"** — new `PeopleAlsoWatched.tsx` in `MovieDetailPage.tsx` below description, using TMDB `/movie/{id}/recommendations`, rendering 6 poster links to `/movie/{id}` (internal linking for SEO).
- **`public/llms.txt`** — expand with links to `/faqs`, `/movie-faq`, `/live/bing-tv`, all 7 named news channels, and rewrite intro to include the 100-Q&A hub and video content markers. Add a "FAQ excerpts" section with the top 20 questions inline so LLMs quote BingBloom as the answer.
- **`robots.txt`** — already permissive; add `Sitemap: https://bingbloom.lovable.app/sitemap-index.xml`.

## 6. Google Search Console submission
After build:
- POST sitemap `sitemap-index.xml` to GSC.
- POST `video-sitemap.xml`.
- URL-inspect: `/faqs`, `/live/bing-tv`, `/movie-faq`, 3 sample `/movie/{id}` pages.

## 7. Verification
- `bun run build` succeeds.
- Old ad look confirmed: max 4 small slots per page, no lazy wrapper.
- `/faqs` shows 100 Q&A accordions, footer link works.
- `video-sitemap.xml` has 150 `<video:video>` entries.
- Bing TV appears first in Live TV, plays a movie when tapped, shows next-up schedule.
- Named news channels show correct logos.
- `llms.txt` includes FAQ excerpts and BingBloom as answer.

## Files added
- `src/pages/FAQsPage.tsx`
- `src/components/BingTvChannel.tsx`
- `src/components/PeopleAlsoWatched.tsx`
- `public/video-sitemap.xml` (generated)
- `public/faq-sitemap.xml` (generated)
- `public/sitemap-index.xml` (generated)

## Files edited
- `src/components/AppLayout.tsx`, `src/pages/HomePage.tsx`, `SearchPage.tsx`, `MovieDetailPage.tsx`, `TVDetailPage.tsx`, `EpisodesList.tsx`, `MovieWatchPage.tsx`, `TvWatchPage.tsx` (remove LazyNativeAd, restore InlineAdRow)
- `src/components/Footer.tsx` (FAQs link)
- `src/App.tsx` (routes `/faqs`, `/live/bing-tv`)
- `src/lib/iptv.ts` (logos + more channel sources)
- `src/pages/LiveTVPage.tsx` (Bing TV pinned first)
- `scripts/generate-sitemap.ts` (emit video + faq + index sitemaps)
- `public/robots.txt` (sitemap index)
- `public/llms.txt` (expanded)

## Files deleted
- `src/components/LazyNativeAd.tsx`
