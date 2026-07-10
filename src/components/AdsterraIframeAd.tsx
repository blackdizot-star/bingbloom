import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Adsterra 160x300 iframe ad. Hidden on mobile — used as a corporate-style
 * sidebar ad (YouTube-esque) on desktop only. Auto-rotates every 45s to
 * keep impressions fresh and drive better fill.
 */
const AD_KEY = "60c2f05729185481fa6f9c3094e71203";
const ROTATE_MS = 45_000;

const buildSrcDoc = () => `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;}</style>
</head><body>
<script type="text/javascript">
  atOptions = {
    'key' : '${AD_KEY}',
    'format' : 'iframe',
    'height' : 300,
    'width' : 160,
    'params' : {}
  };
<\/script>
<script async data-cfasync="false" src="https://disturbknockedcaterpillar.com/${AD_KEY}/invoke.js"><\/script>
</body></html>`;

interface Props {
  className?: string;
  /** Show on mobile too. Defaults to false (desktop-only). */
  showOnMobile?: boolean;
}

const AdsterraIframeAd = ({ className = "", showOnMobile = false }: Props) => {
  const [rot, setRot] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => setRot((r) => r + 1), ROTATE_MS);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, []);

  const srcDoc = useMemo(() => buildSrcDoc(), []);

  return (
    <div
      role="complementary"
      aria-label="Sponsored"
      className={`${showOnMobile ? "" : "hidden md:block"} ${className}`}
    >
      <span className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">
        Sponsored
      </span>
      <div className="rounded-lg overflow-hidden bg-black/40 border border-white/5 w-[160px] h-[300px] mx-auto">
        <iframe
          key={rot}
          title="Sponsored"
          srcDoc={srcDoc}
          scrolling="no"
          className="block border-0"
          width={160}
          height={300}
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default AdsterraIframeAd;
