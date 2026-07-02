import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import NativeAd from "./NativeAd";

interface Props {
  open: boolean;
  variant: "education" | "thanks";
  onDismiss: () => void;
}

/**
 * Non-dismissable sponsor education modal. User MUST tap the CTA.
 * On CTA click, reveals a native ad for ~4s so the user actually
 * sees (and can click) a sponsored placement, then closes.
 */
const SponsorEducationModal = ({ open, variant, onDismiss }: Props) => {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    if (!open) setShowAd(false);
  }, [open]);

  useEffect(() => {
    if (!showAd) return;
    const t = setTimeout(() => onDismiss(), 4200);
    return () => clearTimeout(t);
  }, [showAd, onDismiss]);

  const isThanks = variant === "thanks";

  return (
    <Dialog open={open}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-[400px] p-0 border-0 gap-0 rounded-[12px] overflow-hidden [&>button]:hidden"
        style={{ background: "#1A1A1A", color: "#FFFFFF" }}
      >
        <div className="p-6 text-center">
          <div className="text-3xl mb-3">{isThanks ? "💛" : "🤝"}</div>
          <h2 className="text-[17px] font-bold text-white mb-2 tracking-tight">
            {isThanks ? "Thanks for supporting BingBloom" : "How BingBloom Stays Free"}
          </h2>
          <p className="text-[12.5px] leading-relaxed text-white/75 mb-5">
            {isThanks
              ? "Your taps on sponsored messages keep BingBloom 100% free for everyone. Enjoy the show!"
              : "BingBloom is completely free because of our sponsors. When you see a sponsored message, click it — it helps keep the app free for everyone."}
          </p>

          {!showAd ? (
            <button
              onClick={() => setShowAd(true)}
              className="w-full py-3 rounded-lg font-bold text-[13.5px] text-white transition-transform hover:scale-[1.02] active:scale-95"
              style={{ background: "#E50914" }}
            >
              {isThanks ? "Continue watching →" : "Got it – let's watch! →"}
            </button>
          ) : (
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/50 mb-2">
                A quick word from our sponsor
              </p>
              <div className="rounded-md overflow-hidden">
                <NativeAd inline />
              </div>
              <p className="text-[10px] text-white/40 mt-3">Closing in a moment…</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SponsorEducationModal;
