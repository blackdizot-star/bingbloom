import { useEffect, useMemo, useRef, useState } from "react";

const ROTATE_MS = 45_000;

// Adsterra Native Banner key
const AD_KEY = "0d460b18275609106dbf608190ecb46b";
const AD_SRC = `https://disturbknockedcaterpillar.com/${AD_KEY}/invoke.js`;
const CONTAINER_ID = `container-${AD_KEY}`;

/**
 * Adsterra Native Banner rendered inside an isolated iframe.
 *
 * The Adsterra native-banner script only fills ONE container per document
 * (it looks up `container-<key>` and stops). To render multiple ads on the
 * same page we sandbox each slot in its own iframe document so the script
 * always finds a fresh container to fill.
 */
const buildSrcDoc = (heightPx: number) => `<!doctype html>
<html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  html,body{margin:0;padding:0;background:transparent;overflow:hidden;
    font-family:-apple-system,system-ui,sans-serif;color:#9ca3af;}
  #${CONTAINER_ID}{width:100%;min-height:${heightPx}px;display:block;}
  a{color:inherit;}
</style>
</head><body>
<div id="${CONTAINER_ID}"></div>
<script async data-cfasync="false" src="${AD_SRC}"><\/script>
</body></html>`;

const NativeAd = ({
  className = "",
  compact = false,
  inline = false,
  height,
  desktopHeight,
}: {
  className?: string;
  compact?: boolean;
  inline?: boolean;
  height?: number;
  desktopHeight?: number;
}) => {
  // Mobile-first sizing. Iframe needs an explicit numeric height.
  const h = height ?? (inline ? 110 : compact ? 130 : 180);
  // Desktop needs a taller slot so Adsterra fills the full creative and
  // counts the impression (short frames get flagged as under-viewable).
  const dh = desktopHeight ?? (inline ? 240 : compact ? 260 : 320);

  const srcDoc = useMemo(() => buildSrcDoc(Math.max(h, dh)), [h, dh]);

  // Auto-rotate creative periodically for higher CTR and fresh impressions.
  const [rot, setRot] = useState(0);
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    timerRef.current = window.setInterval(() => setRot((r) => r + 1), ROTATE_MS);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, []);

  if (inline) {
    return (
      <div role="complementary" aria-label="Sponsored" className={`w-full ${className}`}>
        <iframe
          title="Sponsored"
          srcDoc={srcDoc}
          scrolling="no"
          className="w-full block rounded-md overflow-hidden bg-surface-2/40 border-0 h-[var(--ad-h)] md:h-[var(--ad-dh)]"
          style={{ ["--ad-h" as any]: `${h}px`, ["--ad-dh" as any]: `${dh}px` }}
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
      <iframe
        title="Sponsored"
        srcDoc={srcDoc}
        scrolling="no"
        className="w-full block rounded-md overflow-hidden border-0 h-[var(--ad-h)] md:h-[var(--ad-dh)]"
        style={{ ["--ad-h" as any]: `${h}px`, ["--ad-dh" as any]: `${dh}px` }}
      />
    </div>
  );
};

export default NativeAd;
