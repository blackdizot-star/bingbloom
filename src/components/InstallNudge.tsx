import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Download, X } from "lucide-react";

const KEY = "bb_install_nudge_v2";
const DELAY_MS = 2.5 * 60 * 1000; // 2.5 minutes
const HIDDEN_PREFIXES = ["/install", "/signin", "/register"];

const InstallNudge = () => {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY)) return;
    if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return;
    const t = setTimeout(() => setShow(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  const close = (persist: boolean) => {
    if (persist) localStorage.setItem(KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-nudge-title"
      onClick={() => close(false)}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-primary/30 bg-card shadow-2xl p-6 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => close(true)}
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <img
            src="/logo-compact.png"
            alt="BingBloom"
            className="h-20 w-20 rounded-2xl mb-4"
            style={{ filter: "drop-shadow(0 0 18px rgba(229,9,20,0.55))" }}
          />
          <h2 id="install-nudge-title" className="text-lg font-bold text-foreground">
            Install the BingBloom app
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Faster streaming, offline downloads, and a true app-like experience on your phone.
          </p>

          <Link
            to="/install"
            onClick={() => close(true)}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
          >
            <Download className="h-4 w-4" /> Install now
          </Link>
          <button
            onClick={() => close(false)}
            className="mt-2 w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallNudge;
