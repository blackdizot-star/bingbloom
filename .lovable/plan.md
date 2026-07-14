# 10-Task Implementation Plan

## Task 1 — Remove ad CTA buttons
In `src/components/InlineAdRow.tsx`, delete the entire glowing CTA button block (Watch Now / Learn More / Try It Out / Tap to Open), the `CTAS` array, the `InAppBrowserSheet` mount, `SMARTLINK` constant, and the `<style>` keyframes. Keep only the `NativeAd` grid and "Sponsored" label.

## Task 2 — Guarantee ad fill (retry until served)
Update `src/components/AdsterraIframeAd.tsx` and `src/components/NativeAd.tsx` to:
- Retry the iframe/script mount every 8s if the container's `iframe`/child has 0 height (fallback fill detection)
- Add `key={rot}` remount every 30s instead of 45s
- Preload the Adsterra invoke script on first paint
- On mount failure or blank frame, swap to a secondary Adsterra key (add `AD_KEY_ALT`) so a slot never stays empty
Log `[Ad] filled` / `[Ad] refilled` for verification.

## Task 3 — YouTube live channels source
Extend `src/lib/iptv.ts` with a new exported `fetchYouTubeLiveChannels()` returning `IptvChannel[]`. Hardcode the curated list (handle → `https://www.youtube.com/@<handle>/live` — resolved through a new edge function `youtube-live-resolver` that uses `yt-dlp`-style HTML scrape to return the current `.m3u8` HLS URL, cached 5 min). Channels: CazeTV, AlJazeeraEnglish, NASA, LinusTechTips, nprmusic, AirlineVideosLive, BigJetTV, JellesMarbleRuns, KittenAcademy, LofiGirl, FreiGilson, PastorJerryEze, BBCNews, SkyNews, CBSNews, NBCNews, FoxNews, Bloomberg, CheddarNews, TED, LiveModeTV, WillowbyCricbuzz, AFTV, footballdaily, Copa90, SkySports, Thogden. Group: `News`, `Sports`, `Music`, `Space`, `Tech`, `Entertainment`.

## Task 4 — YouTube resolver edge function
Create `supabase/functions/youtube-live-resolver/index.ts`. Input: `?handle=CazeTV`. Fetches `https://www.youtube.com/@<handle>/live`, extracts `hlsManifestUrl` from the ytInitialPlayerResponse JSON, returns `{ url, title, thumbnail }`. CORS enabled, 5-min in-memory cache. Falls back to embed iframe URL if HLS extraction fails.

## Task 5 — Live TV player supports HLS + YouTube embed fallback
In `LiveTVPage.tsx`, change `HlsPlayer` to `LiveChannelPlayer` that:
- If `channel.kind === 'youtube'` and HLS resolution fails → render `<iframe src="https://www.youtube.com/embed/live_stream?channel=<id>&autoplay=1" allow="autoplay; fullscreen">`
- Otherwise use current HLS logic
- Overlay the channel logo in the top-left of the player at 40px height while it loads (`PlayerBrandLoader` pattern).

## Task 6 — Merge & validate channels, prioritize working ones
In `fetchIptvChannels`, merge IPTV-org list + YouTube list. Add a lightweight HEAD validator (through proxy) that runs in the background per channel; channels that fail are demoted to the bottom and tagged `offline`. Only channels with `status === 'ok'` show first. Cache validation results in `localStorage` for 30 min. Sports/News groups pinned to the top.

## Task 7 — Full-world map globe visual
Replace the CSS spinning-orb `GlobeVisual` in `LiveTVPage.tsx` with an SVG world map (equirectangular). Use a lightweight inline SVG (natural-earth simplified) stored at `src/assets/world-map.svg` with country paths in `#1e3a5f` on `#050810`, animated shimmer overlay. Add small pulsing dots at approx lat/lng for each channel's country. Layout mirrors tvgarden.world: full-bleed map on left, sticky right sidebar with search + country/category chips + channel list (already close — refine spacing and add hovering tooltips).

## Task 8 — Autoplay-next countdown for movies & TV episodes
In `src/components/MoviePlayer.tsx`, add an `onEnded` handler and expose an `onNext` prop. When the underlying `<iframe>` cannot fire `ended`, poll `postMessage` from the frame; also expose a manual timer that starts when user clicks "Finished". When `ended`:
- Show a bottom-right card: next item poster, title, "Playing in 5…4…3…" countdown, "Play now" and "Cancel" buttons.
- After 5s auto-invoke `onNext()`.
Wire `TvWatchPage.tsx` to advance to the next episode (`episodeNumber + 1`, roll over to next season via TMDB `season/{n+1}` fetch). Wire `MovieWatchPage.tsx` to advance to the first recommended movie from `PlayerRecommendations`.

## Task 9 — TV/channel logo on player + home
- On the Live TV player overlay, show `activeChannel.logo` top-left (48×48, rounded, backdrop blur) for the first 4s of playback and on pause.
- On `HomePage.tsx`, add a `LiveTvRow` (already exists) that surfaces the top 12 validated channels using their logos (uploaded assets in `src/assets/livetv/*`). Ensure the uploaded logos (`cnn`, `bbc`, `foxnews`, `msnbc`, `cnbc`, `bloomberg`) are wired into the channel objects by matching `name.toLowerCase().includes(...)` in the merge step of Task 6.

## Task 10 — Verify build & ad fill
- `bunx tsgo --noEmit` for typecheck.
- Playwright headless smoke:
  1. `/live-tv` — assert ≥30 channels render, click CazeTV, screenshot player.
  2. `/` — assert LiveTvRow shows logos.
  3. `/watch/movie/<id>` — assert no CTA buttons in ad row; wait for `[Ad] filled` console log.
- Deploy `youtube-live-resolver` function.
- Manual verify ad slots on mobile viewport (390×547) — no empty gray boxes after 10s.

## Technical notes
- No schema changes; new edge function only.
- Ad refill loop must not exceed 1 network request per 8s per slot.
- YouTube HLS extraction is best-effort; embed iframe is the guaranteed fallback so channels always play.
- World map SVG kept under 40KB to stay inline.
