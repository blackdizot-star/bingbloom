# Full Overhaul Plan — 10 Tasks

All ten tasks will be implemented in a single build pass. Each task lists what changes and which files are touched.

## 1. Remove the "How BingBloom Stays Free" sponsor CTA popup
Delete the entire `SponsorPopup` intro/thanks dialog while keeping every other ad slot on the site intact.
- Remove the `<SponsorPopup />` mount from `src/App.tsx` (or wherever it's rendered).
- Delete `src/components/SponsorPopup.tsx`.
- Leave `NativeAd`, `InlineAdRow`, `AdsterraIframeAd`, and `AdBanner` untouched — only the popup goes away.

## 2. Remove the 300×250 banner from the player pages
Drop the standalone 300×250 `AdsterraIframeAd` block that sits between the player and the movie/TV title on both watch pages, and also remove it from the desktop sidebar so the sidebar starts directly with "Up Next" / "Episodes".
- `src/pages/MovieWatchPage.tsx`: remove the `hidden lg:flex justify-center` `<AdsterraIframeAd />` block and both sidebar `<AdsterraIframeAd />` instances.
- `src/pages/TvWatchPage.tsx`: same removals (main column + sidebar top and bottom).

## 3. Shrink banner ads on desktop so they're visible but not huge
Cap the desktop rendered size of every banner slot to a tasteful width and center it, keeping mobile untouched.
- `src/components/AdsterraIframeAd.tsx`, `src/components/AdBanner.tsx`, `src/components/InlineAdRow.tsx`: wrap the ad frame in a container with `max-w-[336px] lg:max-w-[468px] mx-auto` and constrain heights (`h-[100px] lg:h-[90px]`) so oversized 728×90 / 300×600 fills don't blow up desktop pages.

## 4. Remove the Prev / Pause / Next control buttons from the player
The player will no longer render the custom prev, play/pause, next overlay row (iframe sources have their own controls). Fullscreen and blocker/server toggles stay.
- `src/components/MoviePlayer.tsx`: delete the bottom control bar containing `SkipBack`, `Play/Pause`, `SkipForward`; remove `togglePlayPause`, `handlePrev`, `handleNext`, `playing` state, and the corresponding key bindings for Space/Enter/Arrows. Keep `F` fullscreen and `Esc`.
- `src/pages/TvWatchPage.tsx`: stop passing `onPrev` / `onNext` to `MoviePlayer` and drop the `goPrevEpisode` / `goNextEpisode` memos.

## 5. Restore the small compact source-toggle buttons
Return the old small pill toggle for "Fast Stream" / "HD Stream" instead of the large two-button row currently in the player.
- `src/components/MoviePlayer.tsx`: replace the current large full-width buttons with a compact inline pill group (`text-[10px]`, `px-2 py-1`, rounded-full) matching the previous small style, positioned in the top-left overlay of the player.

## 6. Remove ads between the player and the title, and tighten desktop width
Delete the sponsor `InlineAdRow` block that sits directly beneath the player above the title, and slightly reduce the desktop player max width so the page feels less oversized.
- `src/pages/MovieWatchPage.tsx` and `src/pages/TvWatchPage.tsx`: remove the `<div className="mt-2"><InlineAdRow count={4} /></div>` block that sits between the player and the metadata. Change the outer wrapper from `max-w-[1400px]` to `max-w-[1180px]` and the sidebar column from `340px` to `320px`; change the player column wrapper's `lg:max-w-none` to `lg:max-w-[820px]` so the video isn't stretched.

## 7. Redesign the Downloads page to match the player layout
`DownloadPage` gets a player-style shell: a big media hero on the left (like the player), and a right sidebar with "Suggested Downloads" mimicking the player's "Up Next" list.
- `src/pages/DownloadPage.tsx`: rebuild as a two-column layout (`lg:grid lg:grid-cols-[minmax(0,1fr)_320px]`). Left column: sticky backdrop hero + Offline Downloader card. Right column: sticky "Suggested Downloads" list built from `useTrendingMovies` / `useTrendingTv` with the same card styling as the watch page's Up Next items, each linking to `/download/movie/:id`.

## 8. Redesign Live TV as a globe + sidebar, add official logos, use iptv-org for streams
Replace the current search+chip+list UI with a split view: a rotating globe / world visual on the left and a right sidebar of countries/channels with real logos. Streams come from `iptv-org/iptv` country playlists and are validated to guarantee playback.
- Save the uploaded logos as Lovable assets (CNN, BBC, Fox News, MSNBC, CNBC, Bloomberg) under `src/assets/livetv/` via `lovable-assets`, then map channel names → local logos in a `CHANNEL_LOGOS` dictionary in `src/lib/iptv.ts`.
- `src/lib/iptv.ts`: pull from `https://iptv-org.github.io/iptv/index.country.<code>.m3u` for a curated set of countries (US, GB, KE, ZA, DE, FR, IN, JP, BR, AU) plus categories (News, Sports, Documentary). Validate each stream via the existing proxy validator; drop ones that don't return HLS. Attach official logos when the channel name matches the map.
- `src/pages/LiveTVPage.tsx`: rebuild as `lg:grid lg:grid-cols-[minmax(0,1fr)_360px]`. Left: an animated CSS globe (radial-gradient sphere + slow rotation, subtle grid overlay). Right: sticky sidebar with country tabs at the top and a scroll list of channels using the official logos. Selecting a channel activates the existing `HlsPlayer` in place of the globe (same "one plays, others stay on the right" pattern as the movie/TV watch pages).
- The player view keeps `ProgrammeLineup` below the video.

## 9. Ensure all ads still render across the app
After removing the sponsor popup and the 300×250 slots, verify every remaining ad still initializes.
- Confirm `InlineAdRow` still renders inside `HomePage` and both watch pages (below cast + between rows), `AdBanner` inside `AppLayout` footer strip, and `AdsterraIframeAd` inside the sidebars that keep it (none on watch pages after task 2 — keep it in `HomePage`/`LibraryPage` if already present).
- Add a `useEffect` mount log guard in `AdsterraIframeAd` to `console.debug` when it mounts, so we can validate visually.

## 10. TV player right-side "now playing / up next" parity
Make the TV watch page's right sidebar behave exactly like the movie watch page: currently-playing episode highlighted at top, the rest listed below in the same card style, sticky under the header. The mobile horizontal episode strip stays.
- `src/pages/TvWatchPage.tsx`: ensure the sidebar list auto-scrolls the active episode into view on mount (`useEffect` + `scrollIntoView({ block: "nearest" })`), matches the movie sidebar's card metrics (`w-[140px] aspect-video` thumb, `text-[12px]` title), and stays sticky with `top-14`.

---

## Technical notes

- **No backend changes** — everything is frontend edits. Supabase functions and tables stay as they are.
- **Assets** — the six network logos the user attached (CNN, BBC, Fox News, MSNBC, CNBC, Bloomberg) are added via the Lovable assets CLI so they're CDN-hosted, not committed as binaries.
- **IPTV streams** — validation reuses the existing `supabase/functions/proxy` edge function; no new function needed.
- **Ad sizing** — no third-party SDK changes; only the outer `<div>` sizing wrappers change so the network-served creatives are constrained.
- **Removed files**: `src/components/SponsorPopup.tsx`.
- **Edited files**: `src/App.tsx`, `src/components/MoviePlayer.tsx`, `src/components/AdsterraIframeAd.tsx`, `src/components/AdBanner.tsx`, `src/components/InlineAdRow.tsx`, `src/pages/MovieWatchPage.tsx`, `src/pages/TvWatchPage.tsx`, `src/pages/DownloadPage.tsx`, `src/pages/LiveTVPage.tsx`, `src/lib/iptv.ts`.
