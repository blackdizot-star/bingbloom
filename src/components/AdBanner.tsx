import { useEffect, useRef } from "react";

// 300x250 deliberately removed — heavy, intrusive format that hurts corporate look.
type AdFormat =
  | "banner-468x60"
  | "banner-728x90"
  | "banner-320x50"
  | "rect-160x300"
  | "sky-160x600";

const CONFIG: Record<AdFormat, { key: string; width: number; height: number }> = {
  "banner-468x60":  { key: "5eb02f06e005e1d70bc9714b1003fd88", width: 468, height: 60 },
  "banner-728x90":  { key: "e006dc099ab5e2f05964c02dfe0b1f02", width: 728, height: 90 },
  "banner-320x50":  { key: "f0eba4b96e384893b355e076b0b471f9", width: 320, height: 50 },
  "rect-160x300":   { key: "60c2f05729185481fa6f9c3094e71203", width: 160, height: 300 },
  "sky-160x600":    { key: "d2e768ebef63a1bf96ebd40d89f31d0a", width: 160, height: 600 },
};

interface AdBannerProps {
  format: AdFormat;
  className?: string;
  label?: boolean;
}

/**
 * Renders an isolated highperformanceformat.com iframe ad.
 * Each instance lives inside a sandboxed <iframe srcdoc> so that
 * the global `atOptions` from invoke.js doesn't collide between slots.
 */
const AdBanner = ({ format, className = "", label = true }: AdBannerProps) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const cfg = CONFIG[format];

  useEffect(() => {
    if (!ref.current) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;display:flex;align-items:center;justify-content:center;}</style></head><body><script type="text/javascript">atOptions = { 'key':'${cfg.key}', 'format':'iframe', 'height':${cfg.height}, 'width':${cfg.width}, 'params':{} };<\/script><script src="https://www.highperformanceformat.com/${cfg.key}/invoke.js"><\/script></body></html>`;
    ref.current.srcdoc = html;
  }, [cfg.key, cfg.height, cfg.width]);

  return (
    <div
      role="complementary"
      aria-label="Advertisement"
      className={`w-full flex flex-col items-center my-4 ${className}`}
    >
      {label && (
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1">
          Advertisement
        </span>
      )}
      <div
        className="relative overflow-hidden rounded-md max-w-full"
        style={{ width: cfg.width, height: cfg.height, maxWidth: "100%" }}
      >
        <iframe
          ref={ref}
          title={`ad-${format}`}
          width={cfg.width}
          height={cfg.height}
          scrolling="no"
          frameBorder={0}
          style={{ border: 0, display: "block", width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
};

export default AdBanner;
