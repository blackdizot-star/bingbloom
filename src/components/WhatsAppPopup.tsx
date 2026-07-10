import { useEffect, useState } from "react";
import { X } from "lucide-react";

const CHANNEL_URL = "https://whatsapp.com/channel/0029VbD2CdHEwEjtJ5Utbo2n";
const STORAGE_KEY = "bingbloom-whatsapp-popup-dismissed";
const SHOW_AFTER_MS = 4000;
const REMIND_AFTER_MS = 1000 * 60 * 60 * 24 * 3; // 3 days

const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
    <path d="M19.11 17.2c-.28-.14-1.65-.81-1.9-.9-.26-.09-.44-.14-.62.14-.19.28-.72.9-.88 1.09-.16.19-.32.21-.6.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.06-.22-.54-.45-.47-.62-.48-.16-.01-.35-.01-.53-.01-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34 0 1.38 1.01 2.71 1.15 2.9.14.19 1.99 3.04 4.83 4.26.68.29 1.2.47 1.61.6.68.22 1.29.19 1.78.11.54-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.11-.26-.19-.54-.33zM16.02 5.33c-5.9 0-10.7 4.79-10.7 10.68 0 1.88.49 3.72 1.43 5.34l-1.52 5.55 5.68-1.49c1.56.85 3.31 1.3 5.11 1.3 5.9 0 10.7-4.79 10.7-10.68 0-2.85-1.11-5.53-3.13-7.55A10.66 10.66 0 0 0 16.02 5.33zm0 19.55a8.86 8.86 0 0 1-4.51-1.23l-.32-.19-3.37.88.9-3.28-.21-.34a8.83 8.83 0 0 1-1.36-4.71c0-4.9 4-8.88 8.88-8.88 2.37 0 4.6.93 6.28 2.6a8.82 8.82 0 0 1 2.6 6.28c0 4.9-4 8.87-8.89 8.87z" />
  </svg>
);

const WhatsAppPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const ts = Number(localStorage.getItem(STORAGE_KEY) || 0);
      if (ts && Date.now() - ts < REMIND_AFTER_MS) return;
    } catch {}
    const t = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed z-[60] bottom-4 right-4 left-4 sm:left-auto sm:w-[340px] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style={{ background: "linear-gradient(135deg, #0b141a 0%, #111b21 100%)" }}>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-2 right-2 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-4 flex gap-3">
          <div className="shrink-0 w-11 h-11 rounded-full grid place-items-center text-white"
            style={{ background: "#25D366" }}>
            <WhatsAppIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white leading-snug">
              Follow us on WhatsApp
            </p>
            <p className="text-[11px] text-white/65 mt-1 leading-relaxed">
              Get instant alerts when the site is down and receive the latest BingBloom updates.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismiss}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white px-3 py-1.5 rounded-lg"
                style={{ background: "#25D366" }}
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                Follow Channel
              </a>
              <button
                onClick={dismiss}
                className="text-[11px] text-white/55 hover:text-white/80 px-2 py-1"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPopup;
