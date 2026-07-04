import { useEffect, useRef } from "react";

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
 * Adsterra iframe banner. Needs atOptions defined in the SAME document
 * before invoke.js runs. We isolate each ad inside a sandboxed iframe so
 * multiple banners can coexist on the page without colliding on the
 * global `atOptions` variable.
 */
const AdBanner = ({ format, className = "", label = true }: AdBannerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const cfg = CONFIG[format];

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.width = String(cfg.width);
    iframe.height = String(cfg.height);
    iframe.scrolling = "no";
    iframe.frameBorder = "0";
    iframe.style.cssText = `border:0;display:block;width:${cfg.width}px;height:${cfg.height}px;max-width:100%;`;
    iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    host.appendChild(iframe);

    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;}</style></head><body><script type="text/javascript">
      atOptions = { key: '${cfg.key}', format: 'iframe', height: ${cfg.height}, width: ${cfg.width}, params: {} };
    <\/script><script async data-cfasync="false" src="//www.highperformanceformat.com/${cfg.key}/invoke.js"><\/script></body></html>`);
    doc.close();

    return () => {
      host.innerHTML = "";
    };
  }, [cfg.key, cfg.height, cfg.width, format]);

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
        ref={ref}
        className="relative overflow-hidden rounded-md max-w-full"
        style={{ width: cfg.width, height: cfg.height, maxWidth: "100%" }}
      />
    </div>
  );
};

export default AdBanner;
