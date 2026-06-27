# BingBloom: AAB build, footer cleanup, 250-page sitemap, APK polish

## Tasks

1. **Footer cleanup** — In `src/components/AppLayout.tsx`, restrict `<Footer />` to only render on `/` (home) and `/settings`. Hide it on `/search` (explore), `/movies`, `/live-tv`, and everywhere else. The footer's content stays unchanged so home + settings still show full footer info.

2. **Expand sitemap to 250 entries** — In `scripts/generate-sitemap.ts`, programmatically add entries to reach 250 URLs total: keep all current static + corporate pages, then add genre permutations (`/genre/<id>` for movies & TV), expanded TMDB sample IDs (popular movies + TV — generate ~150 from a curated id list), anime detail pages (`/anime/<id>` from a curated AniList/MAL id list), and live-tv channel pages. Each entry keeps `<changefreq>` + `<priority>`. Verify count == 250 via `console.log`.

3. **Android icons + splash verification** — Confirm `public/icon-192.png`, `public/icon-512.png`, `public/splash.png`, and all `android/app/src/main/res/mipmap-*` launcher icons exist (already done in prior turn). Re-copy `public/splash.png` → `android/app/src/main/res/drawable/splash.png` to guarantee it ships in the APK.

4. **Android manifest permissions** — Audit `android/app/src/main/AndroidManifest.xml`. Current set already has INTERNET, NETWORK_STATE, storage, downloads, notifications. Add `WAKE_LOCK` (for video playback) and `FOREGROUND_SERVICE` if missing.

5. **Capacitor config completeness** — `capacitor.config.ts` already has appId, SplashScreen plugin, allowMixedContent. No changes needed unless we add StatusBar plugin config (`StatusBar: { style: "DARK", backgroundColor: "#0A0A0A" }`).

6. **Gradle: enable AAB build task** — Add a custom Gradle task or document the existing `bundleRelease` target. Add `apk:build` and `aab:build` npm scripts to `package.json`:
   - `"apk:build": "cd android && ./gradlew assembleRelease"`
   - `"aab:build": "cd android && ./gradlew bundleRelease"`
   - `"android:build": "npm run build && npx cap sync android && npm run apk:build && npm run aab:build"`

7. **README build instructions** — Add a short "Build APK + AAB" section to `README.md` with the exact command sequence the user runs locally after pulling the repo:
   ```
   npm install
   npm run build
   npx cap sync android
   cd android && ./gradlew assembleRelease bundleRelease
   ```
   Outputs:
   - APK: `android/app/build/outputs/apk/release/app-release.apk`
   - AAB: `android/app/build/outputs/bundle/release/app-release.aab`

8. **Verify build** — Run `bun run build` to confirm sitemap generates with 250 entries and no broken imports.

## Technical notes

- Lovable's sandbox cannot run `./gradlew` (no Android SDK). The APK/AAB must be built on the user's local machine after `git pull`. Everything else (icons, splash, manifest, config, web bundle) is pre-wired so the local build is one command.
- Sitemap inflation uses static curated TMDB ids — no runtime API calls during build.
- Footer continues to render its full content on home + settings; only its mount points are restricted.
