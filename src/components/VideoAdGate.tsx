import { useEffect, useMemo, useState } from "react";
import { SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { videoAdEmbedUrl, videoAdFor } from "@/lib/videoAds";

interface Props {
  onFinish: () => void;
  seed: string;
  variant?: "player" | "modal";
}

const AD_SECONDS = 15;

const VideoAdGate = ({ onFinish, seed, variant = "modal" }: Props) => {
  const [secondsLeft, setSecondsLeft] = useState(AD_SECONDS);
  const videoId = useMemo(() => videoAdFor(seed), [seed]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const shellClass = variant === "player"
    ? "absolute inset-0 z-30 bg-background"
    : "fixed inset-0 z-[100] grid place-items-center bg-background/90 p-4 backdrop-blur-sm";

  return (
    <div className={shellClass} role="dialog" aria-label="Video advertisement">
      <div className={variant === "player" ? "relative h-full w-full overflow-hidden" : "relative aspect-video w-full max-w-xl overflow-hidden rounded-md border border-border bg-background shadow-2xl"}>
        <iframe
          src={videoAdEmbedUrl(videoId)}
          title="Advertisement"
          className="pointer-events-none absolute -inset-[7%] h-[114%] w-[114%] border-0"
          allow="autoplay; unmuted-autoplay; encrypted-media"
          tabIndex={-1}
        />
        <span className="absolute left-3 top-3 rounded-md bg-background/80 px-2 py-1 text-[10px] font-semibold uppercase text-foreground">
          Ad
        </span>
        <div className="absolute bottom-3 right-3">
          {secondsLeft > 0 ? (
            <span className="rounded-md bg-background/80 px-3 py-2 text-xs font-semibold text-foreground">
              Skip in {secondsLeft}s
            </span>
          ) : (
            <Button size="sm" onClick={onFinish} className="font-semibold">
              Skip ad <SkipForward className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoAdGate;