import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Download, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const KEY = "bb_install_nudge_v1";
const HIDDEN_PREFIXES = ["/install", "/welcome", "/onboarding", "/signin", "/register"];

const InstallNudge = () => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isMobile) return;
    if (localStorage.getItem(KEY)) return;
    if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return;
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, [isMobile, pathname]);

  const dismiss = () => {
    localStorage.setItem(KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed left-2 right-2 bottom-20 z-[80] md:hidden animate-in slide-in-from-bottom-5">
      <div className="mx-auto max-w-sm rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-md shadow-2xl p-3 flex items-center gap-3">
        <img src="/logo-compact.png" alt="" className="h-10 w-10 rounded-xl flex-shrink-0" style={{ filter: "drop-shadow(0 0 8px rgba(229,9,20,0.5))" }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground">Install the BingBloom app</p>
          <p className="text-[10px] text-muted-foreground">Faster, with offline downloads.</p>
        </div>
        <Link
          to="/install"
          onClick={dismiss}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground"
        >
          <Download className="h-3 w-3" /> Install
        </Link>
        <button onClick={dismiss} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallNudge;
