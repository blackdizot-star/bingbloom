import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const COUNT_KEY = "bingbloom_sponsor_count";
const VIEWS_KEY = "bingbloom_page_views";
const SMARTLINK =
  "https://www.effectivecpmnetwork.com/iwr6evary?key=710650d8dcbe7dd3d1aed9c9e4449f7c";
const FIRST_DELAY_MS = 30_000;
const PAGE_VIEW_THRESHOLD = 3;
const MAX_COUNT = 3;
const THANKS_MS = 2000;

const readCount = () => {
  if (typeof window === "undefined") return 0;
  try {
    return Number(sessionStorage.getItem(COUNT_KEY) || "0") || 0;
  } catch {
    return 0;
  }
};

const readViews = () => {
  if (typeof window === "undefined") return 0;
  try {
    return Number(sessionStorage.getItem(VIEWS_KEY) || "0") || 0;
  } catch {
    return 0;
  }
};

const SponsorSession = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [thanksOpen, setThanksOpen] = useState(false);
  const countRef = useRef<number>(readCount());
  const firstPathRef = useRef<string | null>(null);
  const location = useLocation();

  // 30-second first-modal timer
  useEffect(() => {
    if (countRef.current >= MAX_COUNT) return;
    if (countRef.current !== 0) return;
    const t = window.setTimeout(() => {
      if (countRef.current === 0) setModalOpen(true);
    }, FIRST_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Page-view counter (after modal #1)
  useEffect(() => {
    // Skip the initial mount path
    if (firstPathRef.current === null) {
      firstPathRef.current = location.pathname;
      return;
    }
    if (firstPathRef.current === location.pathname) return;
    firstPathRef.current = location.pathname;

    const count = countRef.current;
    if (count < 1 || count >= MAX_COUNT) return;
    if (modalOpen || thanksOpen) return;

    try {
      const next = readViews() + 1;
      if (next >= PAGE_VIEW_THRESHOLD) {
        sessionStorage.setItem(VIEWS_KEY, "0");
        setModalOpen(true);
      } else {
        sessionStorage.setItem(VIEWS_KEY, String(next));
      }
    } catch {}
  }, [location.pathname, modalOpen, thanksOpen]);

  const handleContinue = () => {
    // Open smartlink synchronously to survive popup blockers.
    // Fallbacks: window.open -> programmatic anchor click -> navigate current tab.
    try {
      const w = window.open(SMARTLINK, "_blank", "noopener,noreferrer");
      if (!w) {
        const a = document.createElement("a");
        a.href = SMARTLINK;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch {
      try {
        const a = document.createElement("a");
        a.href = SMARTLINK;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch {
        window.location.href = SMARTLINK;
      }
    }

    const next = countRef.current + 1;
    countRef.current = next;
    try {
      sessionStorage.setItem(COUNT_KEY, String(next));
      sessionStorage.setItem(VIEWS_KEY, "0");
    } catch {}

    setModalOpen(false);
    setThanksOpen(true);
    window.setTimeout(() => setThanksOpen(false), THANKS_MS);
  };

  if (!modalOpen && !thanksOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,10,0.85)" }}
      onClickCapture={(e) => e.stopPropagation()}
    >
      {modalOpen && (
        <div
          className="w-full max-w-[400px] rounded-[12px] p-5 sm:p-6 text-center shadow-2xl"
          style={{ background: "#1A1A1A", color: "#FFFFFF" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="text-2xl sm:text-3xl mb-2">🤝</div>
          <h2 className="text-[15px] sm:text-[17px] font-bold mb-2 tracking-tight">
            A Word From Our Sponsor
          </h2>
          <p className="text-[12px] sm:text-[13px] leading-relaxed text-white/80 mb-3">
            BingBloom is completely free because of our sponsors. Tap continue to
            support us and keep the app free.
          </p>
          <p className="text-[11px] sm:text-[12px] leading-snug text-yellow-300/90 mb-4">
            ⚠️ This helps keep the app free for everyone.
          </p>
          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-lg font-bold text-[13px] sm:text-[14px] text-white transition-transform active:scale-95"
            style={{ background: "#E50914" }}
          >
            Continue →
          </button>
        </div>
      )}
      {thanksOpen && !modalOpen && (
        <div
          className="w-full max-w-[340px] rounded-[12px] p-5 text-center shadow-2xl"
          style={{ background: "#1A1A1A", color: "#FFFFFF" }}
          role="status"
          aria-live="polite"
        >
          <div className="text-2xl mb-2">💛</div>
          <h3 className="text-[15px] font-bold mb-1.5">Thank You!</h3>
          <p className="text-[12px] leading-relaxed text-white/80">
            Thank you for supporting BingBloom. Enjoy your content!
          </p>
        </div>
      )}
    </div>
  );
};

export default SponsorSession;
