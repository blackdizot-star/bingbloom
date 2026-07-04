import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Check } from "lucide-react";

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
    window.open(SMARTLINK, "_blank", "noopener,noreferrer");
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
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold">BingBloom is free</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Thanks to our sponsors, you stream unlimited movies, TV shows and anime
              at no cost. Tap continue to support us and keep BingBloom free.
            </DialogDescription>
            <Button onClick={handleContinue} className="w-full mt-2" size="lg">
              Continue
            </Button>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
              Sponsored message
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SponsorPopup;
