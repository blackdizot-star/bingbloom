import { useEffect, useState } from "react";
import { SkipForward, Volume2, VolumeX } from "lucide-react";

const AD_VIDEO_ID = "Bcpu-jqAL6w";
const AD_SECONDS = 10;

interface Props {
  onFinish: () => void;
}

/** 10-second sponsor spot shown before playback starts. Skippable once the countdown ends. */
const PreRollAd = ({ onFinish }: Props) => {
  const [left, setLeft] = useState(AD_SECONDS);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const src = `https://www.youtube-nocookie.com/embed/${AD_VIDEO_ID}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&playsinline=1&rel=0&modestbranding=1`;

  return (
    <div className="absolute inset-0 z-30 bg-black">
      <iframe
        key={String(muted)}
        src={src}
        title="Sponsored message"
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; encrypted-media"
      />
      <div className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
        Ad
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute ad" : "Mute ad"}
          className="grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white hover:bg-black/90"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        {left > 0 ? (
          <span className="rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-semibold text-white/80">
            Skip in {left}s
          </span>
        ) : (
          <button
            onClick={onFinish}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold text-black hover:bg-white/90"
          >
            Skip ad <SkipForward className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PreRollAd;
