import AdBanner from "./AdBanner";

/**
 * Slim banner strip placed directly under the top bar.
 * Uses the smallest leaderboard sizes so it reads as part of the chrome.
 */
const TopBannerStrip = () => (
  <div className="w-full flex justify-center py-1 bg-background/60 border-b border-border/40">
    <AdBanner format="banner-320x50" className="!my-0 md:hidden" label={false} />
    <AdBanner format="banner-728x90" className="!my-0 hidden md:flex" label={false} />
  </div>
);

export default TopBannerStrip;
