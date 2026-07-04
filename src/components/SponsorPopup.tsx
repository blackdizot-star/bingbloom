import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const KEY = "bingbloom_sponsor_popup_shown";
const SMARTLINK =
  "https://disturbknockedcaterpillar.com/nwjvz3hi?key=3014137aa1fc26af4e61a613a86687ee";

const SponsorPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;
    const t = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(KEY, "1");
    }, 12000);
    return () => window.clearTimeout(t);
  }, []);

  const handleContinue = () => {
    window.open(SMARTLINK, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm rounded-2xl border-primary/20 bg-background">
        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">BingBloom is free</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Thanks to our sponsors, you can stream unlimited movies, TV shows and anime at
            no cost. Tap continue to support us and keep BingBloom free forever.
          </DialogDescription>
          <Button onClick={handleContinue} className="w-full mt-2" size="lg">
            Continue
          </Button>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Sponsored message
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SponsorPopup;
