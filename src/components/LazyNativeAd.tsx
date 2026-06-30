import { useEffect, useRef, useState } from "react";
import NativeAd from "./NativeAd";

interface Props {
  placement?: string;
  className?: string;
  /** Compact (smaller min-height). Default true for non-intrusive UX. */
  compact?: boolean;
  /** Inline removes the outer 'Sponsored' label + padding. */
  inline?: boolean;
}

/**
 * Wraps <NativeAd> with an IntersectionObserver so the ad iframe doesn't
 * mount (or load invoke.js) until the slot is near the viewport. Keeps
 * scroll smooth on mobile and avoids the page hitching on first paint.
 */
const LazyNativeAd = ({ placement, className = "", compact = true, inline = true }: Props) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={hostRef} data-placement={placement} className={`w-full ${className}`}>
      {visible ? (
        <NativeAd compact={compact} inline={inline} />
      ) : (
        <div
          aria-hidden
          className="w-full rounded-md bg-white/[0.02]"
          style={{ minHeight: compact ? 60 : 100 }}
        />
      )}
    </div>
  );
};

export default LazyNativeAd;
