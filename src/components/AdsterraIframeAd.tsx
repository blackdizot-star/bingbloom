import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Adsterra 300x250 iframe ad — medium rectangle, safe for both mobile and
 * desktop placement. Auto-rotates every 45s to keep impressions fresh.
 */
const AD_KEY = "2a559855d3a6c946481e0f960f0cf064";
const AD_W = 300;
const AD_H = 250;
const ROTATE_MS = 45_000;

const buildSrcDoc = () => `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;}</style>
</head><body>
<script type="text/javascript">
  atOptions = {
    'key' : '${AD_KEY}',
    'format' : 'iframe',
    'height' : ${AD_H},
    'width' : ${AD_W},
    'params' : {}
  };
<\/script>
<script async data-cfasync="false" src="https://disturbknockedcaterpillar.com/${AD_KEY}/invoke.js"><\/script>
</body></html>`;

interface Props {
  className?: string;
  /** Hide on mobile. Defaults to false — this unit renders on both. */
  desktopOnly?: boolean;
}

const AdsterraIframeAd = ({ className = "", desktopOnly = false }: Props) => {
  const [rot, setRot] = useState(0);
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // Only mount the iframe once the slot enters the viewport so Adsterra
  // counts a real impression instead of a hidden empty frame.
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

  const srcDoc = useMemo(() => buildSrcDoc(), []);

  return (
    <div
      ref={wrapRef}
      role="complementary"
      aria-label="Sponsored"
      className={`${desktopOnly ? "hidden md:block" : ""} ${className}`}
    >
      <span className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">
        Sponsored
      </span>
      <div
        className="rounded-lg overflow-hidden bg-black/40 border border-white/5 mx-auto"
        style={{ width: AD_W, height: AD_H }}
      >
        {visible && (
          <iframe
            key={rot}
            title="Sponsored"
            srcDoc={srcDoc}
            scrolling="no"
            className="block border-0"
            width={AD_W}
            height={AD_H}
            loading="lazy"
            allow="autoplay; clipboard-write"
          />
        )}
      </div>
    </div>
  );
};

export default AdsterraIframeAd;
