import { useState } from "react";
import NativeAd from "./NativeAd";
import InAppBrowserSheet from "./InAppBrowserSheet";
import { Play, Sparkles, Rocket, MousePointerClick } from "lucide-react";

const SMARTLINK =
  "https://disturbknockedcaterpillar.com/nwjvz3hi?key=3014137aa1fc26af4e61a613a86687ee";

const CTAS = [
  { label: "Watch Now", Icon: Play },
  { label: "Learn More", Icon: Sparkles },
  { label: "Try It Out", Icon: Rocket },
  { label: "Tap to Open", Icon: MousePointerClick },
];

/**
 * 4-up grid of native ads with glowing CTA buttons underneath each slot.
 * Clicks open the in-app browser sheet (with a fallback to a new tab if
 * the destination refuses to be framed) so users stay inside BingBloom.
 */
const InlineAdRow = ({ count = 4 }: { count?: number }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-[4%] my-3">
      <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1">
        Sponsored
      </span>
      <div className="grid grid-cols-4 gap-1.5 md:gap-3">
        {Array.from({ length: count }).map((_, i) => {
          const { label, Icon } = CTAS[i % CTAS.length];
          return (
            <div key={i} className="flex flex-col gap-1">
              <NativeAd inline height={96} desktopHeight={260} />
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="group relative flex items-center justify-center gap-0.5 md:gap-1.5 rounded-md px-1 py-1 md:px-2 md:py-1.5 text-[8.5px] md:text-[12px] font-semibold text-white overflow-hidden leading-none"
                style={{
                  background:
                    "linear-gradient(90deg,#E50914 0%,#ff2a34 50%,#E50914 100%)",
                  boxShadow:
                    "0 0 8px rgba(229,9,20,0.5), 0 0 16px rgba(229,9,20,0.2)",
                  animation: "cta-glow 2s ease-in-out infinite",
                }}
              >
                <Icon className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 shrink-0" />
                <span className="truncate">{label}</span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                  style={{
                    background:
                      "linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)",
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes cta-glow {
        0%,100% { box-shadow: 0 0 8px rgba(229,9,20,0.5), 0 0 14px rgba(229,9,20,0.2); }
        50%     { box-shadow: 0 0 14px rgba(229,9,20,0.85), 0 0 26px rgba(229,9,20,0.45); }
      }`}</style>
      <InAppBrowserSheet open={open} onOpenChange={setOpen} url={SMARTLINK} title="Sponsored" />
    </div>
  );
};

export default InlineAdRow;
