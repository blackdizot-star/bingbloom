## Task 1 — True end-of-video autoplay

In `MoviePlayer.tsx`, remove any pre-emptive countdown triggers. Detect the true end of playback:

- For iframe sources: listen for `postMessage` events with `type: 'ended'|'video-ended'|'complete'` and player-specific hooks (VidSrc / Smashy). Add a fallback timer set to `runtime` from TMDB, but only trigger if user hasn't paused.
- For HLS/native `<video>`: bind `onEnded`.
When end fires → render Up-Next card (poster of next item, title, 5s countdown, "Play now" / "Cancel"). After 5s auto-navigate. No countdown shows before end.
Wire `TvWatchPage` to advance to next episode (roll to next season via TMDB). Wire `MovieWatchPage` to first suggestion.

## Task 2 — Ads always filled (3s refill, no blanks)

Update `NativeAd.tsx` + `AdsterraIframeAd.tsx`:

- Reduce empty-slot refill check from 8s → **3s**.
- remove it from 30s to at most 5s 
- Add a third fallback key rotation (primary → alt → primary reload) so a slot never stays gray.
- Render a low-key skeleton with "Sponsored" label so the space never looks blank while waiting.
- Preload the Adsterra invoke script once at app boot in `main.tsx`.

## Task 3 — Live TV: full iptv-org catalog, globe hero, working-only

In `src/lib/iptv.ts`:

- Fetch `https://iptv-org.github.io/api/streams.json` + `channels.json` + `categories.json` and join client-side.
- Filter to streams where `status !== 'error'` and URL responds `200` via a background HEAD probe (through existing `proxy` edge function). Cache probe results 30 min in `localStorage`.
- Group by category (News, Sports, Movies, Music, Kids, Entertainment) and country. Pin News + Sports.
- Remove YouTube-live channels that don't resolve — drop the youtube resolver path from the UI unless it returns HLS.
In `LiveTVPage.tsx`:
- Replace world-map with an animated CSS globe (rotating sphere with meridian grid + glow) at hero position. Keep the sticky sidebar with search + category chips + channel list. Only channels flagged `status: 'ok'` render.        also the homepage use the tv logos and inip the player the full logo on the player as the link loads 

## Task 4 — Remove redirect message from player

In `MoviePlayer.tsx`, delete the "You may see redirects for ~5s" banner/toast and the 5-second overlay entirely.

## Task 5 — Player toolbar: single row + F fullscreen

Rework `MoviePlayer.tsx` toolbar:

- Hide the ad-blocker toggle button (default-on, no UI).
- One row: `[Source pill group] [Download] [Fullscreen icon]` — flex, wraps only on <360px.
- Fullscreen becomes an icon button (Maximize2 lucide icon) that calls `requestFullscreen` on the player wrapper and locks orientation to landscape on mobile.
- Add global keyboard: `f` → toggle fullscreen (desktop only; ignore if input focused).

## Task 6 — Desktop keyboard shortcuts + fire Explore icon

- Add shortcuts (desktop / TV): `f` fullscreen, `space` play/pause, `←/→` skip (postMessage), `m` mute (where applicable), `?` show shortcut sheet. Register in `MoviePlayer.tsx` with a small `ShortcutsHelp` popover.
- In `BottomNav.tsx` (and desktop `TopBar.tsx` if Explore lives there), swap Explore icon → `Flame` from lucide-react.
- Remove the ad row that currently sits on the Explore page (`SearchPage.tsx` or explore route).

## Task 7 — Downloads rebuild (MovieBox-style + full player parity)

Rebuild `DownloadPage.tsx` and `MyDownloadsPage.tsx`:

- Hero download card: poster left, title/meta/size/quality right, primary "Download" button, secondary "Watch offline".
- Right sticky sidebar "Suggested Downloads" (from TMDB similar/recommended).
- Offline player: reuse `MoviePlayer` shell but backed by cached blob URL from `offlineDownloads.ts`. Show same Up-Next card, same suggestion sidebar, same fullscreen/shortcut toolbar. Use `useMovieRecommendations` for cached-suggestion rail below.
- Match spacing, typography, sticky header, and background color of the online watch pages exactly.

## Task 8 — Full light-mode theming

Audit for hardcoded dark colors (`bg-[#0A0A0A]`, `bg-black/…`, `text-white`) in: `MovieWatchPage`, `TvWatchPage`, `MoviePlayer`, `DownloadPage`, `LiveTVPage`, `BottomNav`, `TopBar`, `Footer`, `HomePage` hero.

- Replace with semantic tokens (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`).
- Confirm `.light` class overrides in `index.css` cover the token set used. Add missing tokens (e.g. `--player-bg`) with light/dark values.
- Test by toggling `ThemeToggle` — no black patches remain.

## Task 9 — Prune non-working stream sources

- In `MoviePlayer.tsx`, keep only sources that have been verified working: **movies111** and **smashystreams**. Remove any leftover fallbacks (VidSrc dead mirrors, YouTube trailer fallbacks that hit CORS).
- In `iptv.ts` (Live TV), drop YouTube-live channels whose resolver returns non-HLS embed-only (they intermittently fail); keep only iptv-org HLS URLs that pass the HEAD probe from Task 3.
- Log `[Player] source ok` / `[Player] source failed → switching`.

## Task 10 — Centered desktop top nav + verify build

- In `TopBar.tsx`, change desktop layout: logo left, nav links centered (`mx-auto`), profile/search right. Use `max-w-[1180px] mx-auto` container so it aligns with the watch page.
- Ensure mobile bottom nav unchanged.
- Final verification:
  - `bunx tsgo --noEmit`
  - Playwright: `/home` (centered nav, Flame icon), `/watch/movie/<id>` (single-row toolbar, no redirect banner, F toggles fullscreen, no blank ads after 5s), `/live-tv` (globe visible, ≥50 channels, all ok), `/downloads/<id>` (matches watch layout), toggle light mode and screenshot all pages.

## Technical notes

- No schema changes.
- Ad refill loop capped at 1 request / 3s / slot to respect Adsterra.
- HEAD-probe for IPTV uses existing `proxy` edge function; results cached in `localStorage` under `iptv:probe:<url>`.
- Fullscreen orientation lock guarded by feature-detect (`screen.orientation?.lock`).
- Light-mode audit is presentational only — no business-logic changes.