# BingBloom: Bundled Assets + Capacitor APK Readiness

Goal: make every brand image part of the bundled app (so APK builds work fully offline), add an empty/loading state on Explore, and finalize Capacitor config.

## Tasks

1. **Audit current image references** — find every place we use the CDN `.asset.json` logo (splash, header, footer, onboarding, install page, 404, brand logo component) and the install/onboarding hero images.

2. **Bundle brand images locally** — copy the official BingBloom logo into `public/` as `logo-compact.png`, `icon-192.png`, `icon-512.png`, `splash.png`, and `favicon.png` so they ship with the APK (no CDN dependency at runtime).

3. **Update `BrandLogo`, `AppSplashScreen`, `NotFound`, `Footer`** to use `/logo-compact.png` instead of CDN `.asset.json` pointers, keeping the existing wordmark styling.

4. **Onboarding + Install pages** — switch any CDN logo refs in `Welcome`, `OnboardingDone`, `OnboardingGenres`, `OnboardingTitles`, `InstallAppPage`, `DownloadApkPage` to local `/logo-compact.png`.

5. **TopBar (next to the three dashes/hamburger)** — ensure the compact logo from `/logo-compact.png` renders next to the menu icon.

6. **Explore page empty/loading state** — in `SearchPage.tsx`, when results are loading show a branded skeleton list (pulsing logo + shimmer rows); when query has no results show an empty state with the logo and "No results found" copy.

7. **`index.html` head** — point favicon + apple-touch-icon at the new local `/icon-192.png` and `/favicon.png`, keep theme-color `#0A0A0A`.

8. **`public/manifest.json`** — update icon paths to `/icon-192.png` and `/icon-512.png` with `any maskable` purpose, app name BingBloom, theme/background `#0A0A0A`.

9. **Capacitor config** — replace `capacitor.config.json` with a `capacitor.config.ts` containing appId `com.bingbloom.app`, SplashScreen plugin (2000ms, bg `#0A0A0A`, resource `splash`), `allowMixedContent`, and add cap scripts (`cap:sync`, `cap:copy`, `apk:build`) to `package.json`. Add Android `colors.xml` (`splash_background`) and a `drawable/splash.xml` layer-list referencing `@drawable/splash`. Drop a `splash.png` into `android/app/src/main/res/drawable/`.

10. **Verify build** — run `bun run build` to confirm no broken imports, assets resolve, and the bundle includes the new public images.

## Technical notes

- Keep existing CDN `.asset.json` files in place (used elsewhere) but stop referencing them from brand UI. The new `public/*.png` are the canonical local copies for APK packaging.
- `public/*` files are copied verbatim by Vite into `dist/` and packaged into the Capacitor `webDir`, so they're available offline in the APK.
- Do not touch keystore, signing config, or push native gradle changes beyond splash drawable + colors.
