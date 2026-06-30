
# BingBloom: player polish, ad expansion, Movie FAQ rewrite, 250-URL sitemap

## 1. Player server reorder + branded loader + "Coming Soon" fallback
**File:** `src/components/VideoPlayer.tsx` (and `MoviePlayer.tsx` if it owns the server list)
- Reorder the `servers[]` array so the **current 2nd server becomes index 0** (default), then the HD server, then the rest.
- Replace the TMDB error/empty state with a centered **BingBloom logo + "Coming soon"** caption (use `src/assets/bingbloom-official-logo.png`).
- Replace the spinner shown while a stream resolves with a **bouncing BingBloom logo** (CSS `animate-bounce`, ~56px). Logo hides as soon as `playing`/`canplay` event fires.

**New component:** `src/components/PlayerBrandLoader.tsx`
```tsx
// <img class="w-14 h-14 animate-bounce drop-shadow-[0_0_20px_rgba(229,9,20,0.5)]" />
// + "Loading stream…" small caption
```
Used by both the player loading state and the "Coming Soon" empty state (variant prop).

## 2. Native ads — new placements (mobile-optimized, lazy)
Use the existing `NativeAd` component (already iframe-isolated). Add a small wrapper `<LazyNativeAd>` that mounts via `IntersectionObserver` so off-screen ads don't slow the page on phones.

**File:** `src/components/LazyNativeAd.tsx` (new) — wraps `NativeAd inline compact`, renders placeholder until 200px from viewport.

Placements (additive, do NOT remove existing `InlineAdRow` slots):
- `src/pages/HomePage.tsx` — insert `<LazyNativeAd placement="home-row-1"/>` between Popular Movies and Trending Movies (after row 2), and `<LazyNativeAd placement="home-row-2"/>` between Top Rated TV and Airing Today (after row 4 of the second cluster). Trending↔Top Rated already separated by existing slot — keep.
- `src/pages/SearchPage.tsx` — interleave `<LazyNativeAd placement="search-mid"/>` after the 5th result and `placement="search-bottom"` after the last result.
- `src/pages/MovieDetailPage.tsx` — `<LazyNativeAd placement="movie-details"/>` below the description, `placement="movie-cast"` between cast and similar.
- `src/pages/TVDetailPage.tsx` / `EpisodesList.tsx` — every 3 episodes inject `<LazyNativeAd placement="tv-episodes"/>`.
- `src/components/AppLayout.tsx` — desktop-only right rail (`hidden lg:block w-72`) with `<LazyNativeAd placement="sidebar"/>` sticky at top-24. Mobile unchanged.
- `src/pages/MovieWatchPage.tsx` / `TvWatchPage.tsx` — `<LazyNativeAd placement="player-below"/>` directly under the player, above recommendations.

All slots use `compact inline` so they're <80px tall on mobile.

## 3. Movie FAQ rewrite (`/movie-faq`)
**File:** `src/pages/MovieFAQ.tsx` — full rewrite.
- H1: "BingBloom Movie FAQ – Your Free Streaming Guide".
- Intro 2-3 sentences with link to `/` and `/install`.
- 25 questions/answers exactly as specified, rendered with shadcn `Accordion` (collapsible, dark theme, red `#E50914` accent on triggers).
- Each answer contains at least one internal `<Link>` to `/`, `/install`, `/movies`, `/live`, or `/music`.
- Bottom "Follow Us" section with 6 social links (Twitter, Instagram, TikTok, Reddit, Telegram, Discord) using `lucide-react` icons.
- FAQPage JSON-LD via existing `faqSchema()` helper covering all 25 Q&A.
- Add `SocialMediaPosting`/`Organization.sameAs` JSON-LD listing all social URLs (extend `seoSchemas.ts` with `organizationWithSocialsSchema`).
- Meta title: "BingBloom Movie FAQ – Your Free Streaming Guide"; description as specified.
- Mobile-first card layout, `bg-[#0A0A0A]`, accent `#E50914` kept inline since it matches existing brand.

Route already registered in `App.tsx` — verify.

## 4. Sitemap — clean 250 entries with real TMDB titles
**File:** `scripts/generate-sitemap.ts` — rewrite generator.
- Static pages: `/`, `/movies`, `/tv`, `/anime`, `/live`, `/music`, `/podcasts`, `/shorts`, `/search`, `/install`, `/blog`, `/movie-faq`, `/my-list`, `/my-downloads`, `/help`, `/faq`, `/privacy`, `/terms`, `/contact`, `/about` (~20).
- Fetch from TMDB (no key needed via existing `tmdb-proxy`, but generator runs at build → use direct `api.themoviedb.org/3` with `VITE_TMDB_KEY` env if present; fallback to bundled snapshot list).
  - 10 pages of `popular` movies → 200 entries → `/movie/{id}` (slug: `/movie/{id}` matches current route).
  - 2 pages of `popular` tv → 40 entries → `/tv/{id}`.
- Each dynamic entry includes `<image:image><image:loc>https://image.tmdb.org/t/p/w500{poster_path}</image:loc></image:image>` (add `xmlns:image` to urlset) and `<lastmod>` = today.
- Total ≈ 260; cap at 250 to satisfy user spec.
- Blog posts from `src/data/blogPosts.ts` appended.

**File:** `public/sitemap.xml` — regenerated on `predev`/`prebuild`.

## 5. GSC resubmit
After build, re-POST sitemap via `webmasters/v3/sites/.../sitemaps/...sitemap.xml` and run URL-inspect on `/movie-faq`, `/install`, `/blog`, and 3 sample `/movie/{id}` pages.

## 6. Verify
- `bun run build` succeeds; sitemap log shows 250 entries.
- Open `/` → bouncing logo (briefly) → trailer/hero loads.
- Open a movie → server menu shows new default first; force broken stream → "Coming soon" logo card appears.
- `/movie-faq` → 25 accordions, social icons, JSON-LD in head.
- Mobile viewport: ad slots ≤ 80px, no layout shift.

## Files added
- src/components/PlayerBrandLoader.tsx
- src/components/LazyNativeAd.tsx

## Files edited
- src/components/VideoPlayer.tsx (server reorder, loader, fallback)
- src/components/MoviePlayer.tsx (if it has its own server list)
- src/pages/HomePage.tsx (ad slots)
- src/pages/SearchPage.tsx (interleave ads)
- src/pages/MovieDetailPage.tsx (ad slots)
- src/pages/TVDetailPage.tsx + src/components/EpisodesList.tsx (ad every 3 episodes)
- src/components/AppLayout.tsx (desktop sidebar ad)
- src/pages/MovieWatchPage.tsx + src/pages/TvWatchPage.tsx (post-player ad)
- src/pages/MovieFAQ.tsx (full rewrite — 25 Q&A, socials, JSON-LD)
- src/lib/seoSchemas.ts (organization+sameAs helper)
- scripts/generate-sitemap.ts (TMDB fetch, 250 entries, image namespace)
- public/sitemap.xml (regenerated)
