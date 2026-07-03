import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  variant: "education" | "thanks";
  onDismiss: () => void;
}

// Same network key used by NativeAd — opening this URL counts as a real
// click on our sponsor placement (Direct Link / smartlink format).
const AD_KEY = "0d460b18275609106dbf608190ecb46b";
const AD_CLICK_URL = `https://www.effectivecpmnetwork.com/${AD_KEY}`;

/**
 * Non-dismissable sponsor education modal. Tapping the CTA opens the
 * sponsor's landing page in a new tab (counts as a real ad click) and
 * closes the modal.
 */
const SponsorEducationModal = ({ open, variant, onDismiss }: Props) => {
  const isThanks = variant === "thanks";

  const handleCta = () => {
    try {
      // Opened synchronously from the user gesture so popup blockers allow it.
      const w = window.open(AD_CLICK_URL, "_blank", "noopener,noreferrer");
      // Fallback: same-tab navigation if the browser blocked the new tab.
      if (!w) window.location.href = AD_CLICK_URL;
    } catch {
      window.location.href = AD_CLICK_URL;
    }
    onDismiss();
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="w-[calc(100vw-2rem)] max-w-[340px] sm:max-w-[400px] p-0 border-0 gap-0 rounded-[12px] overflow-hidden [&>button]:hidden"
        style={{ background: "#1A1A1A", color: "#FFFFFF" }}
      >
        <div className="p-4 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{isThanks ? "💛" : "🤝"}</div>
          <h2 className="text-[15px] sm:text-[17px] font-bold text-white mb-1.5 sm:mb-2 tracking-tight">
            {isThanks ? "Thanks for supporting BingBloom" : "How BingBloom Stays Free"}
          </h2>
          <p className="text-[11.5px] sm:text-[12.5px] leading-relaxed text-white/75 mb-4 sm:mb-5">
            {isThanks
              ? "Your taps on sponsored messages keep BingBloom 100% free for everyone. Enjoy the show!"
              : "BingBloom is completely free because of our sponsors. When you see a sponsored message, click it — it helps keep the app free for everyone."}
          </p>

          <button
            onClick={handleCta}
            className="w-full py-2.5 sm:py-3 rounded-lg font-bold text-[12.5px] sm:text-[13.5px] text-white transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: "#E50914" }}
          >
            {isThanks ? "Continue watching →" : "Got it – let's watch! →"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SponsorEducationModal;
