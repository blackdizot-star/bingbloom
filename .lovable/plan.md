# BingBloom — Downloads, MovieBox, Offline & UI Overhaul

## Key technical note (important)
The `moviebox-api` you uploaded is a **Python** library. Lovable apps are client-side React + Vite and **cannot host a persistent Python/FastAPI server**, so the README's FastAPI approach won't run here. The good news: I reverse-engineered the library and confirmed it just calls MovieBox's REST API. I tested the full flow live and it works:

```text
1. POST  /wefeed-h5api-bff/subject/search-suggest   (referer moviebox.ph)   -> Bearer token + cookies
2. POST  /wefeed-h5api-bff/subject/search           (bearer)                -> subjectId + detailPath
3. GET   /wefeed-h5api-bff/subject/download         (referer videodownloader.site) -> real MP4 URLs (360/480/720/1080) + subtitles
```

I'll reimplement this in a **Supabase Edge Function** (Deno/TypeScript) so "Fast Downloads" works fully inside the app — no external server for you to run.

## Task list

**1. MovieBox edge function (`moviebox-resolve`)**
Reimplement the 3-step flow above in Deno. Input: `{ title, year?, mediaType, season?, episode? }`. Output: ranked resolutions with direct MP4 URLs + subtitle tracks. Add input validation, the SSRF-safe fetch pattern already used in the repo, and CORS.

**2. Download-source selection step**
New `DownloadSourceSheet` shown when the Download button is tapped. Two cards:
- **BingBloom** — "current/fast", keeps existing `videodownloader.site` in-app flow.
- **Fast Downloads** — powered by MovieBox edge function.
Flow: choose source → **Next** → source-specific options (resolution for MovieBox) → **Continue**. Wire into `DownloadButton`, the movie/TV/anime detail pages, and the explore (search) results.

**3. In-app downloads + offline playback**
For "Fast Downloads": fetch the chosen MP4 (streamed through the existing `proxy` edge function for CORS), store the blob in IndexedDB via the existing `offlineDownloads.ts`, save metadata via `savedDownloads.ts`. Rebuild `MyDownloadsPage` to list items with progress, play stored blobs inline (`URL.createObjectURL`), and delete. Keep the BingBloom external path as-is.

**4. Explore page download entry**
On `/search` results, add a Download action that opens the same source-selection flow and (for MovieBox) shows the external/source check so users can verify availability before downloading.

**5. New Profile page**
Rebuild `ProfilePage` from scratch with a clean layout (avatar/name, quick links to Downloads, My List, Liked, Settings, Contact). Remove the old/stale routes and links that no longer exist. Only the profile page changes.

**6. Ads in Movies & Anime pages**
Insert 3 ad placements between content rows on `MoviesPage` and `AnimePage` using the existing `AdSlot`/`InlineAdRow`/`NativeAd` components, spaced naturally so they don't disrupt browsing.

**7. Offline app support**
Cache TMDB metadata/listings (React Query persist + IndexedDB) so the app shell and browsing work offline. When a user taps play while offline on a title that isn't downloaded, show a smooth soft popup: "You're offline — connect to the internet to stream this." Downloaded titles still play offline. Verify the existing PWA service worker follows Lovable preview-safety rules.

**8. Desktop onboarding layout**
Give Welcome + onboarding (genres/titles/done) a polished desktop layout (centered split/二-column, larger artwork) while keeping the exact same content and step flow. Mobile layout stays untouched via responsive classes.

**9. Email + contact**
Replace contact email everywhere (Contact page, Footer, Profile) with `hello.bingbloom@gmail.com` as a `mailto:` link that opens the user's email app.

**10. Icons + final QA**
Change the bottom-nav **Home** icon to a standard house icon and the **Movies** icon to a film/clapper icon (currently Home=Clapperboard, Movies=Tv — confusing). Then full pass: typecheck, build, click through download flow, profile, ads, offline popup, and onboarding on desktop + mobile; fix any bugs found.

## Technical details
- Edge function: `supabase/functions/moviebox-resolve/index.ts`, deployed automatically. Token is fetched per-request from the `x-user` header (no secret needed); referer differs per step (the critical detail that makes downloads return real URLs).
- Large video blobs: IndexedDB only (never localStorage). Metadata stays in `savedDownloads.ts`.
- CORS for MP4 fetch: route through existing `proxy` function; respect its existing SSRF blocklist by allowlisting the MovieBox CDN host.
- No database schema changes required. No new secrets required.
- All new colors/styles use existing semantic tokens; no hardcoded palette changes.

## Out of scope / honest limits
- True native external-storage saving needs Capacitor (separate path); IndexedDB is used for PWA offline playback, as your notes suggested.
- MovieBox availability depends on their CDN; some titles legitimately return no downloadable resource — the UI will show a clear "not available from this source, try BingBloom" message.
