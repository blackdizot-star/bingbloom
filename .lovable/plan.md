# Fix HD Player + Ads Overhaul

Goal: HD (vidsrc) server plays without the "sandboxed frame" error, fullscreen works, no redirect pop-unders escape the app, and the new Adsterra 300x250 sidebar ad renders reliably on desktop with the new smartlink CTA.

## Tasks

1. **Remove `sandbox` from the player iframe (root cause of "restricted frame" error).**
   - In `src/components/MoviePlayer.tsx` delete both `SANDBOX_BLOCKED` / `SANDBOX_FULL` constants and the `sandbox={...}` prop.
   - vidsrc.pm refuses to boot inside any `sandbox` value — must be a plain iframe.

2. **Keep redirects blocked without `sandbox`.**
   - Add `<meta http-equiv="Content-Security-Policy" content="sandbox allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox;">` — no, CSP sandbox has same limits. Instead:
   - Intercept top-nav via `window.open` override in `index.html` (already partially there) + add `onbeforeunload` guard when user hasn't clicked in the last 800ms → cancels programmatic pop-unders.
   - Add `referrerPolicy="no-referrer"` and drop the ad-block ON/OFF toggle button (it's now handled globally).

3. **Fix fullscreen on the HD server.**
   - Add `allow="autoplay; fullscreen *; picture-in-picture; encrypted-media; clipboard-write; web-share"` and `allowFullScreen` (both already present but need to be preserved after sandbox removal).
   - Ensure container `.player-shell` has `:fullscreen { width:100vw; height:100vh; }` CSS so the iframe fills the screen.

4. **Reorder servers so HD is default and clearly first.**
   - Confirm `PLAYER_SERVERS[0].id === "hd"` (already true) and force `serverIdx = 0` on mount if no cached preference.

5. **Swap sidebar ad to new 300x250 unit.**
   - Update `src/components/AdsterraIframeAd.tsx`:
     - `AD_KEY = "2a559855d3a6c946481e0f960f0cf064"`
     - width `300`, height `250`
     - container box `w-[300px] h-[250px]`
   - Keep 45s rotation and `srcDoc` isolation.

6. **Wire the new smartlink as the CTA under every ad slot.**
   - `SMARTLINK = "https://disturbknockedcaterpillar.com/nwjvz3hi?key=3014137aa1fc26af4e61a613a86687ee"`
   - Update `src/components/InlineAdRow.tsx` CTA `href` and any other place the old smartlink was referenced.

7. **Ensure ads render + count as impressions.**
   - In `NativeAd.tsx` bump desktop min-height to 260 and mobile to 100 so Adsterra's viewability check passes.
   - Add `IntersectionObserver` gate: only mount the iframe once the slot enters the viewport (prevents empty iframes above the fold from being counted as unfilled).
   - Force iframe reload via `key={rot}` (already there) — verify 45s tick.

8. **Add the new 300x250 slot into the desktop player sidebar.**
   - `MovieWatchPage.tsx` + `TvWatchPage.tsx`: render `<AdsterraIframeAd />` at the top of the right sidebar with a "Sponsored" label; keep it sticky (`sticky top-20`).

9. **Global redirect kill-switch.**
   - In `index.html` add a small inline script that:
     - overrides `window.open` to only allow calls triggered by a real user gesture (checks `event.isTrusted` via a click listener flag),
     - blocks `window.top.location` writes from iframes by setting `window.name = ""` and `Object.defineProperty` guard.
   - This stops pop-unders even though the player iframe no longer has `sandbox`.

10. **Verify.**
    - Build passes.
    - Playwright: open `/watch/movie/<id>`, screenshot player — no "restricted frame" banner, fullscreen button works.
    - Confirm sidebar 300x250 iframe loads a creative (network request to `disturbknockedcaterpillar.com/2a559855.../invoke.js` → 200).
    - Click a CTA → new tab opens smartlink; no unexpected top-level nav on the app tab.

## Technical notes

- Files touched: `MoviePlayer.tsx`, `AdsterraIframeAd.tsx`, `NativeAd.tsx`, `InlineAdRow.tsx`, `MovieWatchPage.tsx`, `TvWatchPage.tsx`, `index.html`, `src/index.css` (fullscreen rule).
- No backend / Supabase changes.
- Ad-block toggle UI removed from player because redirect protection is now global.
