import NativeAd from "./NativeAd";

/**
 * 4-up grid of native ads. Each slot is an isolated iframe so the Adsterra
 * script fills every container independently.
 */
const InlineAdRow = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="px-[4%] my-2">
      <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1">
        Sponsored
      </span>
      <div className="grid grid-cols-4 gap-1 md:gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <NativeAd key={i} inline height={90} />
        ))}
      </div>
    </div>
  );
};

export default InlineAdRow;
