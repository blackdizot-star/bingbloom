import { useEffect, useRef } from "react";

const AD_KEY = "0d460b18275609106dbf608190ecb46b";
const AD_SRC = `//pl24000000.profitableratecpm.com/${AD_KEY}/invoke.js`;

/**
 * Adsterra native banner.
 * Native banners require:
 *   1. A <div id="container-<key>"> in the DOM
 *   2. The invoke.js script loaded once per key on the page
 * Multiple instances of the same key on one page do NOT render more ads,
 * so we ensure the script is added only once and each mount gets its own
 * container div.
 */
const NativeAd = ({
  className = "",
  compact = false,
  inline = false,
}: {
  className?: string;
  compact?: boolean;
  inline?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";

    const container = document.createElement("div");
    container.id = `container-${AD_KEY}`;
    container.style.cssText =
      "width:100%;min-height:100%;display:flex;align-items:center;justify-content:center;";
    host.appendChild(container);

    // Load invoke.js once per page
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-adsterra-key="${AD_KEY}"]`,
    );
    if (!existing) {
      const s = document.createElement("script");
      s.async = true;
      s.setAttribute("data-cfasync", "false");
      s.setAttribute("data-adsterra-key", AD_KEY);
      s.src = AD_SRC;
      document.body.appendChild(s);
    }

    return () => {
      host.innerHTML = "";
    };
  }, []);

  if (inline) {
    return (
      <div
        role="complementary"
        aria-label="Sponsored"
        className={`w-full ${className}`}
      >
        <div
          ref={ref}
          className="w-full min-h-[70px] md:min-h-[90px] rounded-md overflow-hidden bg-surface-2/40"
        />
      </div>
    );
  }

  return (
    <div
      role="complementary"
      aria-label="Sponsored"
      className={`w-full px-[5%] ${compact ? "my-2" : "my-5"} ${className}`}
    >
      <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1">
        Sponsored
      </span>
      <div
        ref={ref}
        className={`w-full ${compact ? "min-h-[70px]" : "min-h-[120px]"} rounded-md overflow-hidden`}
      />
    </div>
  );
};

export default NativeAd;
