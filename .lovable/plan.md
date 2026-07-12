# Player Overhaul: Sources, Redirect Guard, TV UX, Ads

Goal: ship many working stream sources with a strict redirect-trap, add in-player controls (prev/next/pause/blocker), pre-roll + one-time apology popups, TV/desktop keyboard shortcuts, fix auto-scroll on TV, guarantee ads render on mobile + desktop, and put server picker in a dropdown on all breakpoints.

## Tasks

1. **Expand `PLAYER_SERVERS` in `src/components/MoviePlayer.tsx`.**
   Order (fast-first): `111movies` (labeled "Fast"), `vidsrc` (HD), `warezcdn` (EURL - needs imdbId), `gomo`, `nontongo`, `mostream`, `vidsrc.to`, `vidsrc.xyz`, `2embed`, `autoembed`, `smashystream`, `moviesapi`, `embedsu`. TV variants use `/tv/{id}/{s}/{e}`, movie variants `/movie/{id}`. Skip entries whose template requires an unavailable id (e.g. no imdbId → hide warezcdn). Note: enc-dec / ip-api / ipify / consumet / cors-bypasser / myip / SB Comics / Inshorts are NOT stream providers — do not add as servers.

2. **Server picker → dropdown on every breakpoint.**
   Replace the horizontal chip row with a single `<select>` (native, works on TV remotes) styled to match the player chrome. Show current label + a small "Fast" / "HD" badge. Persist last choice in `localStorage`.

3. **Strict redirect-trap on the player iframe.**
   `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"` (no `allow-top-navigation*`, no `allow-popups-to-escape-sandbox`). Keep `allowFullScreen` and `allow="autoplay; fullscreen; picture-in-picture; encrypted-media"`. Add `referrerPolicy="no-referrer"`.

4. **"Blocker" toggle button in the player toolbar.**
   Restores the old shield toggle. Off = default strict sandbox above. On = also strips `allow-popups`, becoming a hard lock. Label: "Redirect Blocker" with on/off pill. Persist in `localStorage`.

5. **5-second pre-roll notice overlay.**
   Before the iframe mounts for a chosen server, show a dark overlay: "We added more streaming sources — a few may still try to redirect. Please bear with us while we lock them down. Starting in Ns…" with a Skip button. Countdown 5→0, then mount the iframe.

6. **One-time in-player apology popup.**
   Small dismissible toast anchored to the player on first watch per session (`sessionStorage` flag): "Sorry for occasional redirects on some sources. We're actively working on a fix." Includes "Got it" button.

7. **In-player controls row (prev / play-pause / next).**
   Under the player: Previous, Play/Pause (posts `postMessage({action:'toggle'})` to iframe — best-effort), Next. On TV episodes, Prev/Next navigate episodes; on movies, they cycle servers. Large touch targets, focusable with visible `:focus` outline for D-pad.

8. **Keyboard + D-pad shortcuts.**
   Global `keydown` listener mounted only while player page is active: Space/Enter → play/pause, ←/→ → prev/next (episode or server), F → fullscreen, M → mute (postMessage best-effort), Esc → exit fullscreen. `e.preventDefault()` on handled keys so the page doesn't scroll.

9. **Kill TV auto-scroll jump.**
   Wrap player in `.bb-player-shell { contain: layout paint; overflow:hidden; outline:none }`. On player mount, save `window.scrollY`; add a short-lived (1.5s) `scroll` listener that snaps back if the delta was caused by focus (i.e. no user wheel/touch in the last 200ms). Also set `tabindex="-1"` on the iframe wrapper and call `.focus({preventScroll:true})`. In `AndroidManifest`/`MainActivity` no change needed beyond existing config (documented only).

10. **Ads visibility pass + in-app browser for CTAs.**
    - `NativeAd.tsx`: raise mobile min-height to 96, desktop to 260, keep IntersectionObserver gate, force `key={rot}` reload every 45s.
    - `AdsterraIframeAd.tsx`: verify 300×250 renders, add fallback placeholder while loading so slot never collapses.
    - `MovieWatchPage.tsx` / `TvWatchPage.tsx`: on mobile add one `<AdsterraIframeAd />` above the "You May Also Like" row (centered, `mx-auto`) so desktop-only slot is visible on phones too.
    - CTA clicks in `InlineAdRow.tsx` open the existing `InAppBrowserSheet` (bottom sheet already in repo) instead of `_blank`, giving users a Back/Close/Open-externally chrome bar — keeps traffic in-app when the smartlink allows framing, falls back to `window.open` when it doesn't (existing 4.5s timer already handles this).

## Verify

- Build passes.
- Playwright on `/watch/movie/<id>`: dropdown shows all servers; selecting each mounts the iframe; no top-level nav occurs after clicking inside the player (assert `page.url()` unchanged after 5s).
- Pre-roll overlay visible and counts down; skip works.
- Apology toast shows once per session, then hidden after dismiss + reload of same session.
- Prev/Next cycles episodes on TV page, servers on movie page.
- Screenshot mobile + desktop showing `AdsterraIframeAd` filled (or placeholder while loading, never 0-height).
- Keyboard: Space toggles, arrows navigate, F fullscreens, no page scroll on arrow keys.

## Technical notes

Files: `src/components/MoviePlayer.tsx` (big edit), `src/components/AdsterraIframeAd.tsx`, `src/components/NativeAd.tsx`, `src/components/InlineAdRow.tsx`, `src/pages/MovieWatchPage.tsx`, `src/pages/TvWatchPage.tsx`, `src/index.css`. Reuses existing `InAppBrowserSheet.tsx`. No backend / Supabase / manifest changes.
