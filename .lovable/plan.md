# Sponsor Education Modal + Ad Placement Pass

## 1. Sponsor Education Modal (new)

**New file:** `src/components/SponsorEducationModal.tsx`

- Full-screen overlay (`fixed inset-0 z-[100] bg-black/80 backdrop-blur`) — non-dismissable by outside click or ESC. User MUST tap the CTA to close (boosts engagement).
- Card: `#1A1A1A`, rounded 12px, max-w-[400px], centered, white text, red `#E50914` CTA.
- Title: "🤝 How BingBloom Stays Free". Body copy per spec.
- CTA: "Got it – let's watch! →" — on click:
  1. Fires a native ad reveal (mounts `NativeAd` with the `11098740` In-Page Push key inside the same modal footer for ~4s so user actually sees an ad they can click), then
  2. Closes modal and marks localStorage.
- Return-visit variant (view count ≥ 2): show a short **"Thanks for supporting BingBloom 💛"** message instead of the education copy, same CTA behavior.

**Frequency logic (localStorage):**
- `bb_sponsor_shown_count` — total lifetime shows (cap = 3).
- `bb_sponsor_last_shown` — ms timestamp; require ≥ 24h gap between shows after the first.
- `bb_sponsor_session_shown` — sessionStorage flag; max 1 per visit.
- Trigger: mount a `<SponsorEducationGate />` in `AppLayout`. After **15 s** on the page (per visit), if session flag not set AND count < 3, show modal. First visit ever → education variant. Subsequent → thank-you variant.

**Wire-up:** import `<SponsorEducationGate />` inside `AppLayout` (top-level, once).

## 2. Ad Placement Pass (restore/extend the old 4-up `InlineAdRow`)

All slots use the existing `<InlineAdRow count={4} />` (already the premium look).

| Location | File | Position |
|---|---|---|
| Below player (movie) | `src/pages/MovieWatchPage.tsx` | Immediately under `<MoviePlayer/>`, before "You May Also Like" |
| Below player (TV) | `src/pages/TvWatchPage.tsx` | Same position under player |
| Movie detail — above cast | `src/pages/MovieDetailPage.tsx` | Insert `<InlineAdRow count={4}/>` directly above the Cast section |
| TV detail — above cast | `src/pages/TVDetailPage.tsx` | Same |
| Movies page — top | `src/pages/MoviesPage.tsx` | First child under the `<h1>` header block |
| Anime page — top | `src/pages/AnimePage.tsx` | First child under header |
| Explore / discover cards | `src/pages/SearchPage.tsx` (Explore grid) | Inject an `<InlineAdRow count={4}/>` after every 5 result cards |

Existing `HomePage` and `AppLayout` end-of-page ads stay untouched.

## 3. Sitemap resubmit to Google Search Console

Re-POST all three sitemaps (they exist in `/public`):
- `https://bingbloom.lovable.app/sitemap-index.xml`
- `https://bingbloom.lovable.app/sitemap.xml`
- `https://bingbloom.lovable.app/video-sitemap.xml`
- `https://bingbloom.lovable.app/faq-sitemap.xml`

Via `PUT /webmasters/v3/sites/<site>/sitemaps/<encoded-url>` through the connector gateway. Confirm 200/204 for each.

## Technical notes

- The `NativeAd` component already exists and accepts an ad key; confirm it supports the `11098740` In-Page Push key or add a new `NativeAd variant="inpage-push"` prop that swaps the script src to `//pl11098740…/invoke.js` (verify against existing pattern in `NativeAd.tsx`).
- Modal uses shadcn `Dialog` with `onPointerDownOutside` and `onEscapeKeyDown` preventDefault so user is forced to tap CTA.
- SSR-safe: guard all `localStorage`/`sessionStorage` reads with `typeof window !== 'undefined'`.
- No changes to routing, backend, or existing ad components — purely additive.

## Files touched

**New:** `src/components/SponsorEducationModal.tsx`, `src/components/SponsorEducationGate.tsx`
**Edited:** `AppLayout.tsx`, `MovieWatchPage.tsx`, `TvWatchPage.tsx`, `MovieDetailPage.tsx`, `TVDetailPage.tsx`, `MoviesPage.tsx`, `AnimePage.tsx`, `SearchPage.tsx`, possibly `NativeAd.tsx` (add In-Page Push key)
**Runtime:** GSC sitemap PUT calls via curl
