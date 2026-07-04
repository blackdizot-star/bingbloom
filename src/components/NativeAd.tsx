import { useEffect, useRef } from "react";

// Adsterra Native Banner key
const AD_KEY = "0d460b18275609106dbf608190ecb46b";
const AD_SRC = `//pl27893789.effectiveratecpm.com/${AD_KEY}/invoke.js`;
const CONTAINER_ID = `container-${AD_KEY}`;

/**
 * Adsterra Native Banner.
 * Native banner script requires a single container id: `container-{key}`.
 * We mount that container once inside our host div and inject the script.
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
    container.id = CONTAINER_ID;
    container.style.cssText =
      "width:100%;min-height:100%;display:flex;align-items:center;justify-content:center;";
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
      <div role="complementary" aria-label="Sponsored" className={`w-full ${className}`}>
        <div
          ref={ref}
          className="w-full min-h-[80px] md:min-h-[100px] rounded-md overflow-hidden bg-surface-2/40"
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
        className={`w-full ${compact ? "min-h-[90px]" : "min-h-[140px]"} rounded-md overflow-hidden`}
      />
    </div>
  );
};

export default NativeAd;
