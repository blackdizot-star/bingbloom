import { useEffect, useMemo, useRef, useState } from "react";

// Adsterra Native Banner keys — rotated per page-view to boost CTR
const AD_KEYS = [
  "0d460b18275609106dbf608190ecb46b", // Original
  "11098740", // Sharp-witted
  "11098723", // Well-to-do
  "11098720", // Amazing
] as const;

const ROTATION_KEY = "bingbloom_ad_rotation_idx";

const pickAdKey = (): string => {
  if (typeof window === "undefined") return AD_KEYS[0];
  try {
    const raw = sessionStorage.getItem(ROTATION_KEY);
    const idx = raw ? (parseInt(raw, 10) + 1) % AD_KEYS.length : 0;
    sessionStorage.setItem(ROTATION_KEY, String(idx));
    return AD_KEYS[idx];
  } catch {
    return AD_KEYS[Math.floor(Math.random() * AD_KEYS.length)];
  }
};

const buildSrcDoc = (heightPx: number, key: string) => {
  const containerId = `container-${key}`;
  const src = `https://disturbknockedcaterpillar.com/${key}/invoke.js`;
  return `<!doctype html>
<html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  html,body{margin:0;padding:0;background:transparent;overflow:hidden;
    font-family:-apple-system,system-ui,sans-serif;color:#9ca3af;}
  #${containerId}{width:100%;min-height:${heightPx}px;display:block;}
  img{max-width:100%;height:auto;}
  a{color:inherit;}
</style>
</head><body>
<div id="${containerId}"></div>
<script async defer data-cfasync="false" src="${src}"><\/script>
</body></html>`;
};

/**
 * Adsterra Native Banner — lazy-loaded (IntersectionObserver) and rotated
 * between three ad tags per page-view. Each slot lives inside an isolated
 * iframe so the invoke.js script can fill it independently.
 */
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
  // Mobile-first sizing. Desktop gets a taller slot so Adsterra fully renders
  // (needed for the impression to count).
  const mobileH = height ?? (inline ? 90 : compact ? 110 : 150);
  const desktopH = height ?? (inline ? 130 : compact ? 150 : 200);

  const [visible, setVisible] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const adKey = useMemo(() => pickAdKey(), []);
  const srcDocMobile = useMemo(() => buildSrcDoc(mobileH, adKey), [mobileH, adKey]);
  const srcDocDesktop = useMemo(() => buildSrcDoc(desktopH, adKey), [desktopH, adKey]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const IframePair = () => (
    <>
      <iframe
        title="Sponsored"
        srcDoc={visible ? srcDocMobile : undefined}
        loading="lazy"
        scrolling="no"
        className={`w-full block rounded-md overflow-hidden bg-surface-2/40 border-0 md:hidden`}
        style={{ height: `${mobileH}px` }}
      />
      <iframe
        title="Sponsored"
        srcDoc={visible ? srcDocDesktop : undefined}
        loading="lazy"
        scrolling="no"
        className={`w-full hidden md:block rounded-md overflow-hidden bg-surface-2/40 border-0`}
        style={{ height: `${desktopH}px` }}
      />
    </>
  );

  if (inline) {
    return (
      <div
        ref={wrapRef}
        role="complementary"
        aria-label="Sponsored"
        className={`w-full ${className}`}
      >
        <IframePair />
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
      <IframePair />
    </div>
  );
};

export default NativeAd;
