import NativeAd from "./NativeAd";

/**
 * 4-up grid of native ads. Each slot is an isolated iframe so the Adsterra
 * script fills every container independently. Mobile shows 4 compact ads in
 * a single row; desktop uses taller slots for full-impression viewability.
 */
const InlineAdRow = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="px-[4%] my-3">
      <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1">
        Sponsored
      </span>
      <div className="grid grid-cols-4 gap-1.5 md:gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col">
            <NativeAd inline height={72} desktopHeight={240} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InlineAdRow;
