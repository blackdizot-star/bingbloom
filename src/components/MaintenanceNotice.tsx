import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";

// Show ONLY today (annual maintenance apology)
const SHOW_DATE = "2026-07-04";
const KEY = `bingbloom_maintenance_notice_${SHOW_DATE}`;

const MaintenanceNotice = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const today = new Date().toISOString().slice(0, 10);
    if (today !== SHOW_DATE) return;
    if (sessionStorage.getItem(KEY)) return;
    const t = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(KEY, "1");
    }, 12000); // after splash + a beat
    return () => window.clearTimeout(t);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[92vw] max-w-sm p-5 sm:p-6 rounded-2xl border-primary/20 bg-background">
        <div className="flex flex-col items-center text-center gap-3 pt-1">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Wrench className="w-7 h-7 text-amber-500" />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold">
            We're back — thanks for your patience
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            MovieNoir was going through its annual maintenance. Everything is back
            up and running smoothly. We sincerely apologise for any inconvenience
            caused today and appreciate your patience.
          </DialogDescription>
          <Button onClick={() => setOpen(false)} className="w-full mt-2" size="lg">
            Continue to MovieNoir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceNotice;
