import { useEffect, useId, useRef } from "react";

const AD_KEY = "0d460b18275609106dbf608190ecb46b";
const AD_SRC = `https://www.highperformanceformat.com/${AD_KEY}/invoke.js`;

/**
 * Adsterra/HighPerformanceFormat native banner.
 * - `compact` shrinks the slot
 * - `inline` removes padding/labels so several can sit in a row
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
  const uid = useId().replace(/[:]/g, "");

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const slotId = `adsterra-native-${uid}`;
    host.innerHTML = "";

    const container = document.createElement("div");
    container.id = slotId;
    container.style.cssText = "width:100%;height:100%;min-height:100%;display:flex;align-items:center;justify-content:center;";
    host.appendChild(container);

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = AD_SRC;
    host.appendChild(script);

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
          className="w-full min-h-[60px] rounded-md overflow-hidden bg-surface-2/40"
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
        className={`w-full ${compact ? "min-h-[60px]" : "min-h-[100px]"} rounded-md overflow-hidden`}
      />
    </div>
  );
};

export default NativeAd;
