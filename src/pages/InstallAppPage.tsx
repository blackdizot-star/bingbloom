import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { ChevronLeft, Download, Star, Share2, Shield, Smartphone, Check, ChevronDown, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import apkAsset from "@/assets/bingbloom-app.apk.asset.json";

const SCREENSHOTS = [
  "https://image.tmdb.org/t/p/w300/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
  "https://image.tmdb.org/t/p/w300/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  "https://image.tmdb.org/t/p/w300/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
  "https://image.tmdb.org/t/p/w300/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg",
];

const InstallAppPage = () => {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const handleInstall = () => {
    setDownloading(true);
    const a = document.createElement("a");
    a.href = apkAsset.url;
    a.download = "BingBloom.apk";
    a.rel = "noopener";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => { setDownloading(false); setDone(true); }, 1200);
  };

  useEffect(() => { document.title = "Install BingBloom – Free Movies & TV"; }, []);

  return (
    <AppLayout>
      <SEO title="Install BingBloom App" description="Install the free BingBloom Android app to stream and download movies, TV shows, anime and live channels." />

      <div className="max-w-2xl mx-auto px-4 pt-3 pb-10">
        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-primary/20 bg-primary/10 p-3 text-sm text-foreground">
          <BellRing className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="font-semibold text-foreground">New updates are live</p>
            <p className="text-xs text-muted-foreground">Tap the update button below to join our WhatsApp update channel for the latest APK and app news.</p>
          </div>
        </div>
        <Link to="/home" className="inline-flex items-center gap-1 text-xs text-foreground/70 hover:text-foreground mb-3">
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </Link>

        <div className="flex items-start gap-3 mb-4">
          <img src={"/logo-compact.png"} alt="BingBloom" className="w-14 h-14 rounded-2xl flex-shrink-0 shadow-lg" style={{ filter: "drop-shadow(0 0 14px rgba(229,9,20,0.45))" }} />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-foreground leading-tight">BingBloom</h1>
            <p className="text-[11px] text-primary font-medium">Bing Bloom Studios</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Contains ads · Free</p>
          </div>
        </div>

        <div className="grid grid-cols-4 divide-x divide-border/40 border-y border-border/40 py-2 mb-4 text-center">
          <div>
            <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-0.5">4.7 <Star className="w-2.5 h-2.5 fill-primary text-primary" /></p>
            <p className="text-[9px] text-muted-foreground">152K reviews</p>
          </div>
          <div><p className="text-xs font-semibold text-foreground">6 MB</p><p className="text-[9px] text-muted-foreground">Size</p></div>
          <div><p className="text-xs font-semibold text-foreground">10M+</p><p className="text-[9px] text-muted-foreground">Downloads</p></div>
          <div><p className="text-xs font-semibold text-foreground">3+</p><p className="text-[9px] text-muted-foreground">Rated</p></div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <a
            href="https://whatsapp.com/channel/0029VbD2CdHEwEjtJ5Utbo2n"
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-w-[140px] gradient-bb text-primary-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs"
          >
            <BellRing className="w-3.5 h-3.5" /> Check for update
          </a>
          <button
            onClick={() => navigator.share?.({ title: "BingBloom", url: window.location.href }).catch(() => {})}
            className="w-10 grid place-items-center rounded-xl border border-border bg-card"
            aria-label="Share"
          >
            <Share2 className="w-3.5 h-3.5 text-foreground" />
          </button>
          <button
            onClick={() => navigator.share?.({ title: "BingBloom", url: window.location.href }).catch(() => {})}
            className="w-10 grid place-items-center rounded-xl border border-border bg-card"
            aria-label="Share"
          >
            <Share2 className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>

        {/* Install help / permissions accordion */}
        <button
          onClick={() => setHelpOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-border/40 bg-card text-left mb-4"
        >
          <span className="flex items-center gap-2 text-[12px] font-semibold text-foreground">
            <Smartphone className="w-3.5 h-3.5 text-primary" /> Install help & permissions
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${helpOpen ? "rotate-180" : ""}`} />
        </button>
        {helpOpen && (
          <div className="mb-4 rounded-xl border border-border/40 p-3 text-[11px] text-foreground/80 space-y-2 leading-relaxed">
            <p><span className="font-semibold text-foreground">1.</span> Tap <span className="font-semibold">Install</span> above to download <span className="font-mono">BingBloom.apk</span>.</p>
            <p><span className="font-semibold text-foreground">2.</span> Your browser may ask for permission to download or install apps from unknown sources — tap <span className="font-semibold">Allow</span>.</p>
            <p><span className="font-semibold text-foreground">3.</span> Open the downloaded file and tap <span className="font-semibold">Install</span>.</p>
            <p className="flex items-start gap-1.5 text-[11px] mt-2 pt-2 border-t border-border/30">
              <AlertTriangle className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <span>If Play Protect blocks the install, tap <span className="font-semibold">More details</span> on the popup, then choose <span className="font-semibold">Install anyway</span>. The app is safe — Play Protect simply doesn't recognise our publisher signature yet.</span>
            </p>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide -mx-1 px-1">
          {SCREENSHOTS.map((src) => (
            <img key={src} src={src} alt="" className="h-32 rounded-xl flex-shrink-0 border border-border/40" />
          ))}
        </div>

        <section className="mb-5">
          <h2 className="text-sm font-semibold text-foreground mb-1.5">About this app</h2>
          <p className="text-xs text-foreground/80 leading-relaxed">
            Stream and download thousands of movies, TV shows, anime, live channels and music — completely free. BingBloom keeps your watchlist in sync, supports offline playback and ships with parental controls.
          </p>
        </section>

        <section className="rounded-2xl border border-border/40 p-3">
          <h2 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-primary" /> Data safety
          </h2>
          <ul className="text-[11px] text-foreground/75 space-y-1">
            <li className="flex gap-2"><Check className="w-3 h-3 text-primary mt-0.5" /> No data shared with third parties</li>
            <li className="flex gap-2"><Check className="w-3 h-3 text-primary mt-0.5" /> Encrypted in transit</li>
            <li className="flex gap-2"><Check className="w-3 h-3 text-primary mt-0.5" /> You can request data deletion</li>
          </ul>
        </section>
      </div>
    </AppLayout>
  );
};

export default InstallAppPage;
