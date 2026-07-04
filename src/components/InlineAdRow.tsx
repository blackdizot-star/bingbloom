import AdBanner from "./AdBanner";

/**
 * Responsive row of sponsor banners. Slots keep their real 320x50 creative
 * size so they stay fully viewable instead of being squeezed or clipped.
 */
const InlineAdRow = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="px-[4%] my-0 py-1 overflow-hidden">
      <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">
        Sponsored
      </span>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-1.5 justify-items-center">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex min-h-[50px] w-full max-w-[320px] items-center justify-center rounded-md overflow-hidden bg-surface-2/40"
          >
            <AdBanner format="banner-320x50" className="!my-0" label={false} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InlineAdRow;

