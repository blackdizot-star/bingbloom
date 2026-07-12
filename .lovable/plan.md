
# Goal
Kill every iframe embed source in the player. Ship a single native `<video>` player (HLS.js for `.m3u8`, native for `.mp4`) whose stream URLs come from a Deno port of the `Moviebox-API` Python service running as a Supabase edge function. Real MovieBox videos must play end‑to‑end for movies and TV episodes on desktop and mobile.

# Architecture

```text
Browser (MoviePlayer.tsx)
   │  TMDB title + year (+ S/E)
   ▼
edge fn: moviebox-api  (Deno port of api.py)
   ├─ /search  → subjectId + detailPath
   ├─ /detail  → metadata + episodes
   └─ /play    → { hls[], mp4[], captions[] }
   ▼
edge fn: proxy         (injects Referer + CORS for netfilm.world CDN)
   ▼
HLS.js / native <video>
```

All CDN requests go through `proxy` so the browser‑forbidden `Referer` header is added server‑side. HLS manifests are rewritten so each segment URL also flows through `proxy`.

# 10 Tasks (executed in one pass)

1. **Port `api.py` → `supabase/functions/moviebox-api/index.ts`**
   Implement guest bearer‑token bootstrap (read `x-user` header from `/home`), `search`, `search-suggest`, `detail/{slug}`, `play` (subject/play with correct `Referer` = `{domain}/spa/videoPlayPage/movies/{slug}?...`), and `captions`. Cache token in memory; refresh on any subsequent `x-user`.

2. **Harden `proxy` edge function for streaming**
   Ensure it (a) sets `Referer: https://netfilm.world/` and matching `Origin`, (b) forwards `Range` requests + `Content-Range`/`Accept-Ranges` for MP4 seeking, (c) returns permissive CORS, (d) has a `?rewrite=hls` mode that rewrites `.m3u8` playlists so every segment and sub‑playlist URI is wrapped back through `proxy`.

3. **New client resolver `src/lib/moviebox.ts` (rewrite)**
   Expose `resolveMoviebox({ title, year, mediaType, season, episode })`:
   - `POST` search → pick best match by title similarity + year + type
   - `GET detail` → for TV, find matching season/episode subjectId
   - `GET play` → pick highest HLS (preferred) else highest MP4
   - Return `{ kind: "hls"|"mp4", url: proxiedUrl, captions[], poster }`
   - Wrap final URL through `proxy` (with `rewrite=hls` for HLS).

4. **Install and wire HLS.js**
   `bun add hls.js`. Create `src/components/HlsVideo.tsx`: attaches HLS.js on non‑Safari, falls back to native `src=` on Safari/iOS. Handles error recovery (`MEDIA_ERR_DECODE` → `recoverMediaError`, network → `startLoad`).

5. **Rewrite `MoviePlayer.tsx` — remove ALL embed sources**
   Delete `PLAYER_SERVERS`, `ServerId` union, `<iframe>`, dropdown, blocker overlay, "Fast/HD Stream" buttons, redirect apology popup, in‑page browser sheet. Component now renders only `HlsVideo` plus `PlayerBrandLoader`. Props reduce to `{ tmdbId, type, title, year, season?, episode?, poster, backdrop }`. Emits `onReady` / `onError`.

6. **Update watch pages**
   `MovieWatchPage.tsx` and `TvWatchPage.tsx`: drop `server` state, `serverId`/`onServerChange` props, remove imports of removed types. Keep ad rows, suggestions, and layout intact.

7. **Update TV callers**
   `BingTvChannel.tsx`, `EpisodesList.tsx`, and any other consumer of `MoviePlayer`: remove `serverId` and related props/state.

8. **TMDB → MovieBox matching quality**
   In `moviebox-api` search endpoint, accept optional `year` and `type` and rank candidates by (a) normalized title equality, (b) release‑year exact match, (c) `hasResource` truthy, (d) `subjectType` matching movie/series. Return top result plus alternates so the client can retry the second best if `play` returns `hasResource=false`.

9. **Deploy + smoke test with real content**
   Deploy `moviebox-api` and updated `proxy`. Use `supabase--curl_edge_functions` to hit `/search?q=Inception&year=2010` then `/play` and confirm an `.m3u8` or `.mp4` URL is returned. Then drive the running app with Playwright on `/watch/movie/27205` (Inception) and `/watch/tv/94997/1/1`, screenshot the `<video>` element, and assert `readyState >= 2` and `currentTime > 0` after 5 s of playback.

10. **Cleanup & guardrails**
    Delete now‑dead code: old server list, `WhatsAppPopup`/apology player prompts, `InAppBrowserSheet` if only used by removed flows, `vidsrc-stream` edge function references from the player path. Keep the moviebox‑resolve download flow untouched. Add a friendly "This title isn't available on MovieBox yet" state (reuse `PlayerBrandLoader variant="coming-soon"`) for `hasResource=false`.

# Technical notes

- **Auth token**: `h5-api.aoneroom.com` issues a guest JWT via `x-user` response header on `/home`. Persist in module scope; refresh whenever a response includes a new `x-user`.
- **Referer trick**: `subject/play` only returns `streams`/`hls` when `Referer` = `https://<player-domain>/spa/videoPlayPage/movies/{slug}?id=...`. The Deno port must set this exactly.
- **CDN playback**: netfilm.world enforces `Referer`. Browsers cannot set it, so every segment must be proxied. HLS master playlists reference relative or absolute segment URLs — the `rewrite=hls` mode replaces each `URI="..."` and each non‑comment line with `/functions/v1/proxy?url=<encoded>`.
- **Range support in proxy**: forward `Range` header up, pass through `206 Partial Content` + `Content-Range` down. Required for MP4 seeking.
- **HLS.js config**: `enableWorker: true`, `lowLatencyMode: false`, `maxBufferLength: 30`. On fatal error, try one recovery pass, then surface "Coming soon" state.
- **No fallback embeds**: per user directive, if MovieBox has no resource we show "Coming soon" — never fall back to vidsrc/111movies/smashy.

# Files touched
- add `supabase/functions/moviebox-api/index.ts`
- edit `supabase/functions/proxy/index.ts` (Range + hls rewrite)
- rewrite `src/lib/moviebox.ts`
- add `src/components/HlsVideo.tsx`
- rewrite `src/components/MoviePlayer.tsx`
- edit `src/pages/MovieWatchPage.tsx`, `src/pages/TvWatchPage.tsx`
- edit `src/components/BingTvChannel.tsx`, `src/components/EpisodesList.tsx`
- `bun add hls.js`
