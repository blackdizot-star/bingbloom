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

const AdBanner = ({ format, className = "", label = true }: AdBannerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const cfg = CONFIG[format];

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const slotId = `adsterra-banner-${format}-${cfg.key.slice(0, 8)}`;
    host.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.style.cssText = `width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:transparent;overflow:hidden;`;

    const container = document.createElement("div");
    container.id = slotId;
    container.style.cssText = "width:100%;height:100%;min-height:100%;display:flex;align-items:center;justify-content:center;";
    wrapper.appendChild(container);
    host.appendChild(wrapper);

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = `https://www.highperformanceformat.com/${cfg.key}/invoke.js`;
    host.appendChild(script);

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
        className="relative overflow-hidden rounded-md max-w-full mx-auto"
        style={{
          width: cfg.width,
          height: cfg.height,
          maxWidth: cfg.width > 468 ? 468 : "100%",
          maxHeight: cfg.height > 250 ? 250 : cfg.height,
        }}
      />
    </div>
  );
};

export default AdBanner;
