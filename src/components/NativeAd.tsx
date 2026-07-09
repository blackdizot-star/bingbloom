import { useMemo } from "react";

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
}: {
  className?: string;
  compact?: boolean;
  inline?: boolean;
  height?: number;
}) => {
  // Mobile-first sizing. Iframe needs an explicit numeric height.
  const h = height ?? (inline ? 90 : compact ? 110 : 150);

  const srcDoc = useMemo(() => buildSrcDoc(h), [h]);

  if (inline) {
    return (
      <div role="complementary" aria-label="Sponsored" className={`w-full ${className}`}>
        <iframe
          title="Sponsored"
          srcDoc={srcDoc}
          scrolling="no"
          className="w-full block rounded-md overflow-hidden bg-surface-2/40 border-0"
          style={{ height: `${h}px` }}
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
        className="w-full block rounded-md overflow-hidden border-0"
        style={{ height: `${h}px` }}
      />
    </div>
  );
};

export default NativeAd;
