import { useEffect, useState } from "react";
import { getStreamData } from "@/lib/piped";


interface Props {
  videoKey?: string | null;
  poster?: string | null;
  alt?: string;
  adSeed?: string;
}

/** Muted, looping trailer that plays behind the detail-page hero. Falls back to the backdrop image. */
const TrailerBackdrop = ({ videoKey, poster, alt, adSeed }: Props) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setVideoUrl(null);
    if (!videoKey) return;
    getStreamData(videoKey)
      .then((data) => {
        if (!active || !data) return;
        const mp4 = (data.videoStreams || []).find(
          (s) => s.mimeType?.includes("mp4") && ["720p", "480p", "360p"].includes(s.quality),
        ) || (data.videoStreams || [])[0];
        if (mp4?.url) setVideoUrl(mp4.url);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [videoKey]);

  return (
    <>
      {poster && (
        <img
          src={poster}
          alt={alt || ""}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoUrl ? "opacity-0" : "opacity-100"}`}
        />
      )}
      {videoUrl && (
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </>
  );
};

export default TrailerBackdrop;
