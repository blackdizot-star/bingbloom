import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Heart, Check, Play } from "lucide-react";
import NativeAd from "./NativeAd";

const KEY = "bingbloom_sponsor_popup_shown";
const PENDING = "bingbloom_sponsor_pending";
const SMARTLINK =
  "https://disturbknockedcaterpillar.com/nwjvz3hi?key=3014137aa1fc26af4e61a613a86687ee";

const SponsorPopup = () => {
  const [open, setOpen] = useState(false);
  const [thanks, setThanks] = useState(false);

  // Show once per visit (session), 30s after entry
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;
    const t = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(KEY, "1");
    }, 30000);
    return () => window.clearTimeout(t);
  }, []);

  // When user returns after tapping Continue, show thanks then auto-close after 5s
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (sessionStorage.getItem(PENDING) !== "1") return;
      sessionStorage.removeItem(PENDING);
      setThanks(true);
      setOpen(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    if (!thanks || !open) return;
    const t = window.setTimeout(() => {
      setOpen(false);
      setThanks(false);
    }, 5000);
    return () => window.clearTimeout(t);
  }, [thanks, open]);

  const handleContinue = () => {
    sessionStorage.setItem(PENDING, "1");
    // Open in a new tab; fall back to top-level nav if popups are blocked
    // so the CTA reliably works on mobile browsers.
    const win = window.open(SMARTLINK, "_blank", "noopener,noreferrer");
    if (!win) window.location.href = SMARTLINK;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setOpen(false); setThanks(false); } }}>
      <DialogContent className="w-[92vw] max-w-sm p-5 sm:p-6 rounded-2xl border-primary/20 bg-background">
        {thanks ? (
          <div
            className="flex flex-col items-center text-center gap-3 py-2 animate-fade-in"
            aria-live="polite"
          >
            <div className="relative w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center animate-scale-in">
              <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              <Check
                className="w-9 h-9 text-green-500"
                strokeWidth={3}
                style={{
                  strokeDasharray: 40,
                  strokeDashoffset: 40,
                  animation: "tick-draw 0.6s ease-out 0.15s forwards",
                }}
              />
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold">Thank you!</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Your support keeps BingBloom free for everyone. Enjoy streaming!
            </DialogDescription>
            <style>{`@keyframes tick-draw { to { stroke-dashoffset: 0; } }`}</style>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-3 pt-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold">
              BingBloom is free
            </DialogTitle>
            <DialogDescription className="text-[12px] text-muted-foreground">
              Tap the sponsor below or the button to keep BingBloom free.
            </DialogDescription>

            <div className="w-full">
              <NativeAd inline height={130} desktopHeight={220} />
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="group relative w-full mt-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-white overflow-hidden"
              style={{
                background:
                  "linear-gradient(90deg,#E50914 0%,#ff2a34 50%,#E50914 100%)",
                animation: "sp-cta-glow 1.8s ease-in-out infinite",
              }}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Continue &amp; Support</span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)",
                }}
              />
            </button>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
              Sponsored message
            </p>
            <style>{`@keyframes sp-cta-glow {
              0%,100% { box-shadow: 0 0 12px rgba(229,9,20,0.55), 0 0 22px rgba(229,9,20,0.25); }
              50%     { box-shadow: 0 0 22px rgba(229,9,20,0.95), 0 0 40px rgba(229,9,20,0.5); }
            }`}</style>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SponsorPopup;
