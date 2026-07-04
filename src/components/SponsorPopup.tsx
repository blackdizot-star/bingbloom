import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, CheckCircle2 } from "lucide-react";

const KEY = "bingbloom_sponsor_popup_shown";
const SMARTLINK =
  "https://disturbknockedcaterpillar.com/nwjvz3hi?key=3014137aa1fc26af4e61a613a86687ee";

const SponsorPopup = () => {
  const [open, setOpen] = useState(false);
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;
    const t = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(KEY, "1");
    }, 12000);
    return () => window.clearTimeout(t);
  }, []);

  // Show thank you when user returns to tab after clicking Continue
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && open && !thanks) {
        // If popup is open and user just came back, show thanks
        const pending = sessionStorage.getItem("bingbloom_sponsor_pending");
        if (pending === "1") {
          setThanks(true);
          sessionStorage.removeItem("bingbloom_sponsor_pending");
          window.setTimeout(() => setOpen(false), 2500);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [open, thanks]);

  const handleContinue = () => {
    sessionStorage.setItem("bingbloom_sponsor_pending", "1");
    window.open(SMARTLINK, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm rounded-2xl border-primary/20 bg-background">
        {thanks ? (
          <div className="flex flex-col items-center text-center gap-3 py-4" aria-live="polite">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <DialogTitle className="text-xl font-bold">Thank you!</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Your support keeps BingBloom free for everyone. Enjoy streaming!
            </DialogDescription>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-3 pt-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">BingBloom is free</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Thanks to our sponsors, you can stream unlimited movies, TV shows and anime
              at no cost. Tap continue to support us and keep BingBloom free forever.
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
