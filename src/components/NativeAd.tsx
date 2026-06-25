import { useEffect, useRef } from "react";

const AD_KEY = "0d460b18275609106dbf608190ecb46b";
const AD_SRC = `https://pl29160309.effectivecpmnetwork.com/${AD_KEY}/invoke.js`;

/**
 * EffectiveCPMNetwork native banner.
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

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    // Isolate each instance in its own iframe so the global invoke.js
    // doesn't collide with sibling slots and actually renders an ad.
    const iframe = document.createElement("iframe");
    iframe.scrolling = "no";
    iframe.frameBorder = "0";
    iframe.style.cssText =
      "border:0;display:block;width:100%;height:100%;background:transparent;";
    iframe.title = "Sponsored";
    host.innerHTML = "";
    host.appendChild(iframe);
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;}#container-${AD_KEY}{width:100%;}</style></head><body><script async data-cfasync="false" src="${AD_SRC}"><\/script><div id="container-${AD_KEY}"></div></body></html>`;
    iframe.srcdoc = html;
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
