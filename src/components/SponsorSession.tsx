import { useEffect, useRef, useState } from "react";

const SHOWN_KEY = "bingbloom_sponsor_shown";
const SMARTLINK =
  "https://disturbknockedcaterpillar.com/nwjvz3hi?key=3014137aa1fc26af4e61a613a86687ee";
const DELAY_MS = 30_000;
const THANKS_MS = 2000;

const alreadyShown = () => {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(SHOWN_KEY) === "1";
  } catch {
    return false;
  }
};

const SponsorSession = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [thanksOpen, setThanksOpen] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (alreadyShown() || firedRef.current) return;
    const t = window.setTimeout(() => {
      if (firedRef.current) return;
      firedRef.current = true;
      setModalOpen(true);
    }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const handleContinue = () => {
    try {
      const w = window.open(SMARTLINK, "_blank", "noopener,noreferrer");
      if (!w) window.location.href = SMARTLINK;
    } catch {
      window.location.href = SMARTLINK;
    }

    try {
      sessionStorage.setItem(SHOWN_KEY, "1");
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
            type="button"
            className="w-full py-3 rounded-lg font-bold text-[13px] sm:text-[14px] text-white transition-transform active:scale-95 cursor-pointer"
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
