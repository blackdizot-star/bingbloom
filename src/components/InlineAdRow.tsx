import NativeAd from "./NativeAd";

/**
 * 4-up grid of tiny native ads — flush with surrounding content.
 */
const InlineAdRow = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="px-[4%] my-0 py-1">
      <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">
        Sponsored
      </span>
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="min-h-[70px] md:min-h-[90px] rounded-md overflow-hidden bg-surface-2/40"
          >
            <NativeAd inline />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InlineAdRow;

