import AdBanner from "./AdBanner";

type Format =
  | "banner-468x60"
  | "banner-728x90"
  | "banner-320x50"
  | "rect-160x300"
  | "sky-160x600";

interface AdSlotProps {
  id?: string | number;
  /** Preferred format. Defaults to a responsive leaderboard. */
  format?: Format;
  height?: number; // legacy / ignored
  className?: string;
}

/**
 * Backwards-compatible AdSlot. 300x250 has been removed app-wide — we now
 * substitute the slimmer 320x50 / 728x90 banner for a more corporate look.
 */
const AdSlot = ({ format, className = "" }: AdSlotProps) => {
  const chosen: Format =
    format ??
    (typeof window !== "undefined" && window.innerWidth < 640
      ? "banner-320x50"
      : "banner-728x90");

  return (
    <div className={`w-full px-[5%] ${className}`}>
      <AdBanner format={chosen} />
    </div>
  );
};

export default AdSlot;
