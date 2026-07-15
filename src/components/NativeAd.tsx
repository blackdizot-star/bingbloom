import { useMemo } from "react";

const AD_KEY = "0d460b18275609106dbf608190ecb46b";
const CONTAINER_ID = `container-${AD_KEY}`;

/**
 * Simple Adsterra native banner — mount the invoke script inside an isolated
 * iframe with `srcDoc` and let Adsterra fill it. No rotation, no refill logic.
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
<script async data-cfasync="false" src="https://disturbknockedcaterpillar.com/${AD_KEY}/invoke.js"><\/script>
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
  const h = height ?? (inline ? 110 : compact ? 130 : 180);
  const dh = desktopHeight ?? (inline ? 260 : compact ? 280 : 320);

  const srcDoc = useMemo(() => buildSrcDoc(Math.max(h, dh)), [h, dh]);

  const iframe = (
    <iframe
      title="Sponsored"
      srcDoc={srcDoc}
      scrolling="no"
      loading="lazy"
      allow="autoplay; clipboard-write"
      className="w-full block rounded-md overflow-hidden border-0 h-[var(--ad-h)] md:h-[var(--ad-dh)]"
      style={{ ["--ad-h" as any]: `${h}px`, ["--ad-dh" as any]: `${dh}px` }}
    />
  );

  if (inline) {
    return (
      <div role="complementary" aria-label="Sponsored" className={`w-full ${className}`}>
        {iframe}
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
      {iframe}
    </div>
  );
};

export default NativeAd;
