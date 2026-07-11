import { useEffect, useMemo, useRef, useState } from "react";

const ROTATE_MS = 45_000;

// Adsterra Native Banner key
const AD_KEY = "0d460b18275609106dbf608190ecb46b";
const AD_SRC = `https://disturbknockedcaterpillar.com/${AD_KEY}/invoke.js`;
const CONTAINER_ID = `container-${AD_KEY}`;

/**
 * Adsterra Native Banner rendered inside an isolated iframe.
 *
 * The Adsterra native-banner script only fills ONE container per document,
 * so we sandbox each slot in its own iframe document. We also gate mounting
 * on IntersectionObserver so Adsterra counts a real viewable impression
 * instead of an off-screen empty frame.
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
  // Desktop: taller slot so Adsterra fills the full creative and the
  // impression is counted as viewable.
  const dh = desktopHeight ?? (inline ? 260 : compact ? 280 : 320);

  const srcDoc = useMemo(() => buildSrcDoc(Math.max(h, dh)), [h, dh]);

  const [rot, setRot] = useState(0);
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!wrapRef.current || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    timerRef.current = window.setInterval(() => setRot((r) => r + 1), ROTATE_MS);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [visible]);

  const iframe = visible ? (
    <iframe
      key={rot}
      title="Sponsored"
      srcDoc={srcDoc}
      scrolling="no"
      loading="lazy"
      allow="autoplay; clipboard-write"
      className="w-full block rounded-md overflow-hidden border-0 h-[var(--ad-h)] md:h-[var(--ad-dh)]"
      style={{ ["--ad-h" as any]: `${h}px`, ["--ad-dh" as any]: `${dh}px` }}
    />
  ) : (
    <div
      className="w-full rounded-md bg-white/5 h-[var(--ad-h)] md:h-[var(--ad-dh)]"
      style={{ ["--ad-h" as any]: `${h}px`, ["--ad-dh" as any]: `${dh}px` }}
    />
  );

  if (inline) {
    return (
      <div ref={wrapRef} role="complementary" aria-label="Sponsored" className={`w-full ${className}`}>
        {iframe}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
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
