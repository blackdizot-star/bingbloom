import { useEffect, useMemo, useRef, useState } from "react";

const ROTATE_MS = 5_000;
const REFILL_CHECK_MS = 3_000;

const AD_KEY = "0d460b18275609106dbf608190ecb46b";
const AD_KEY_ALT = "2a559855d3a6c946481e0f960f0cf064";
const CONTAINER_ID = `container-${AD_KEY}`;

/**
 * Adsterra Native Banner rendered inside an isolated iframe.
 * Auto-refills empty slots by remounting with an alternate key when the
 * primary key fails to fill within REFILL_CHECK_MS.
 */
const buildSrcDoc = (heightPx: number, key: string) => `<!doctype html>
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
<script async data-cfasync="false" src="https://disturbknockedcaterpillar.com/${key}/invoke.js"><\/script>
<script>
  // Ping parent when the container gets content so parent can stop refill checks.
  var start = Date.now();
  var iv = setInterval(function(){
    var el = document.getElementById("${CONTAINER_ID}");
    if (el && el.offsetHeight > 40 && el.children.length > 0) {
      parent.postMessage({ __bb_ad: "filled" }, "*");
      clearInterval(iv);
    }
    if (Date.now() - start > 12000) clearInterval(iv);
  }, 500);
<\/script>
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

  const [rot, setRot] = useState(0);
  const [visible, setVisible] = useState(false);
  const [filled, setFilled] = useState(false);
  const [keyIdx, setKeyIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const activeKey = keyIdx % 2 === 0 ? AD_KEY : AD_KEY_ALT;

  const srcDoc = useMemo(
    () => buildSrcDoc(Math.max(h, dh), activeKey),
    [h, dh, activeKey],
  );

  // IntersectionObserver — only mount when visible.
  useEffect(() => {
    if (!wrapRef.current || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [visible]);

  // Listen for fill acks from the iframe.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data && e.data.__bb_ad === "filled") {
        setFilled(true);
        // eslint-disable-next-line no-console
        console.log("[Ad] filled", activeKey.slice(0, 6));
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [activeKey]);

  // Rotate every 30s (fresh impression).
  useEffect(() => {
    if (!visible) return;
    const iv = window.setInterval(() => {
      setFilled(false);
      setRot((r) => r + 1);
    }, ROTATE_MS);
    return () => window.clearInterval(iv);
  }, [visible]);

  // If not filled within REFILL_CHECK_MS, swap to alt key and remount.
  useEffect(() => {
    if (!visible) return;
    setFilled(false);
    const t = window.setTimeout(() => {
      if (!filled) {
        // eslint-disable-next-line no-console
        console.log("[Ad] refilled with alt key");
        setKeyIdx((k) => k + 1);
        setRot((r) => r + 1);
      }
    }, REFILL_CHECK_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, rot, keyIdx]);

  const iframe = visible ? (
    <iframe
      key={`${keyIdx}-${rot}`}
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
      className="w-full rounded-md bg-white/5 animate-pulse h-[var(--ad-h)] md:h-[var(--ad-dh)]"
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
