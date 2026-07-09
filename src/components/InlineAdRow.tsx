import NativeAd from "./NativeAd";
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
 * 4-up grid of native ads. Each slot is an isolated iframe so the Adsterra
 * script fills every container independently. A glowing CTA button sits
 * beneath each ad and opens the Adsterra smartlink in a new tab.
 */
const InlineAdRow = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="px-[4%] my-3">
      <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1">
        Sponsored
      </span>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {Array.from({ length: count }).map((_, i) => {
          const { label, Icon } = CTAS[i % CTAS.length];
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <NativeAd inline height={110} desktopHeight={240} />
              <a
                href={SMARTLINK}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="group relative flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[10.5px] md:text-[12px] font-semibold text-white overflow-hidden"
                style={{
                  background:
                    "linear-gradient(90deg,#E50914 0%,#ff2a34 50%,#E50914 100%)",
                  boxShadow:
                    "0 0 12px rgba(229,9,20,0.55), 0 0 22px rgba(229,9,20,0.25)",
                  animation: "cta-glow 2s ease-in-out infinite",
                }}
              >
                <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span>{label}</span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                  style={{
                    background:
                      "linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)",
                  }}
                />
              </a>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes cta-glow {
        0%,100% { box-shadow: 0 0 10px rgba(229,9,20,0.5), 0 0 18px rgba(229,9,20,0.2); }
        50%     { box-shadow: 0 0 18px rgba(229,9,20,0.85), 0 0 32px rgba(229,9,20,0.45); }
      }`}</style>
    </div>
  );
};

export default InlineAdRow;
