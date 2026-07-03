# Sponsor Modal v2 + Install Button + Ad Fixes + Video Sitemap

## 1. Rewrite Sponsor Modal (mandatory, 3×/session)

**Replace** `SponsorEducationGate.tsx` + `SponsorEducationModal.tsx` with a single new controller `src/components/SponsorSession.tsx` mounted once in `AppLayout`.

### Storage (sessionStorage — resets on tab close)
- `bingbloom_sponsor_count` — 0 | 1 | 2 | 3
- `bingbloom_page_views` — resets after each modal
- `bingbloom_modal_open_at` — timestamp when smartlink opened (to trigger Thank You on return)

### Trigger logic
- On mount: if count === 0, start a 30 s `setTimeout` → show Modal #1.
- Subscribe to `useLocation()` in a child component; on every pathname change AFTER count ≥ 1 and count < 3, increment page_views. When page_views ≥ 3 → show next modal, reset page_views to 0.
- After count === 3, stop.

### Modal UI (mandatory)
- Fixed overlay `z-[200] bg-[#0A0A0A]/80` — blocks pointer events on the app.
- Card `#1A1A1A`, rounded 12 px, `w-[calc(100vw-2rem)] max-w-[400px]` (mobile compact), centered.
- Title: **🤝 A Word From Our Sponsor**
- Body: "BingBloom is completely free because of our sponsors. Tap continue to support us and keep the app free."
- Warning line: "⚠️ This helps keep the app free for everyone."
- CTA: full-width red `#E50914` button "Continue →".
- NO close button, NO ESC/outside dismiss, NO `<Dialog>` (use plain div — shadcn Dialog auto-adds close). We render our own overlay.

### Continue handler
1. `sessionStorage.setItem('bingbloom_sponsor_count', String(count + 1))`
2. Close modal (React state)
3. `window.open('https://www.effectivecpmnetwork.com/iwr6evary?key=710650d8dcbe7dd3d1aed9c9e4449f7c', '_blank', 'noopener,noreferrer')` — synchronous in click handler
4. Set `bingbloom_modal_open_at = Date.now()`
5. Show "Thank You!" toast-style overlay for 2 s (auto-dismiss via `setTimeout`).

### Thank You screen
- Same overlay style, smaller card, non-blocking after 2 s. Title "Thank You!", body "Thank you for supporting BingBloom. Enjoy your content!"

## 2. Install Button (desktop + phone update button)

Currently `TopBar` (assumed) or nav has an "Update" button on phone. Rework `src/hooks/useInstallPrompt.ts` consumer:

- **Desktop:** add an "Install App" button in `TopBar` (visible on `md:` breakpoint) linking (external, new tab) to `https://bingbloomdownload.lovable.app`.
- **Mobile:** replace the existing update button with an "Install" button linking to the same URL.
- Simple `<a href target="_blank" rel="noopener">` — no PWA prompt logic needed.

## 3. Ad fixes — restore custom sizing, ensure load

- `NativeAd.tsx`: current script may collide when multiple `InlineAdRow` slots share the same `slotId`. Fix: make `slotId` unique per instance (`useId()`), and give each container a proper `min-height` so Adsterra fills it. Ensure the injected script only runs after the container is in the DOM (it already is).
- `InlineAdRow.tsx`: keep 4-up grid on all breakpoints per user request; add explicit `min-h-[70px]` on mobile, `min-h-[90px]` on `md:` so slots render before script fills them (prevents 0-height collapse).
- Verify each existing placement (Home, AppLayout end, Movie/TV watch, Movie/TV detail above cast, Movies/Anime top, Search every 5) still renders — no changes needed beyond the component fix.

## 4. Video sitemap — 25-entry set + resubmit

- Currently `public/video-sitemap.xml` already exists (140 videos per prior log). User asks for a "sitemap of the 25 movies video" — interpret as ensuring a curated top-25 video sitemap and resubmit.
- Update `scripts/generate-sitemap.ts` if needed to cap or add a new `public/top-videos-sitemap.xml` (25 entries from a hand-picked list in `src/data/movies.ts`).
- Add it to `sitemap-index.xml`.
- Resubmit all sitemaps via GSC connector gateway `PUT /webmasters/v3/sites/<encoded-site>/sitemaps/<encoded-sitemap-url>`.

## 5. Cleanup

- Delete `SponsorEducationModal.tsx`, `SponsorEducationGate.tsx`.
- Remove their imports from `AppLayout.tsx`; import `SponsorSession` instead.
- Remove any Adsterra In-Page Push key `11098740` references (previous plan iteration).

## Files

**New:** `src/components/SponsorSession.tsx`, `public/top-videos-sitemap.xml`
**Edited:** `src/components/AppLayout.tsx`, `src/components/NativeAd.tsx`, `src/components/InlineAdRow.tsx`, `src/components/TopBar.tsx`, `public/sitemap-index.xml`, `scripts/generate-sitemap.ts`
**Deleted:** `src/components/SponsorEducationModal.tsx`, `src/components/SponsorEducationGate.tsx`
**Runtime:** GSC sitemap PUT calls (curl via exec)

## Technical notes

- All storage access guarded with `typeof window !== 'undefined'`.
- Modal uses a plain fixed `<div>` (not shadcn Dialog) to guarantee no close affordance and full pointer blocking.
- Router page-view listener lives inside `<BrowserRouter>` — mount `SponsorSession` inside `App.tsx` Routes tree (wrap Routes in a fragment with `<SponsorSession />`), not in `AppLayout` (AppLayout is per-page and would remount).
