import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, Music, Video, Mic2 } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

// Global music player state
let globalTrack: Track | null = null;
let listeners: (() => void)[] = [];

export function playTrack(track: Track) {
  globalTrack = track;
  listeners.forEach(l => l());
}

export function getGlobalTrack() { return globalTrack; }

const MusicPlayer = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const listener = () => {
      setTrack(getGlobalTrack());
      setPlaying(true);
      setProgress(0);
      setShowVideo(false); // default: audio-only
    };
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => p >= 100 ? 100 : p + 0.5);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  if (!track) return null;

  const embedSrc = playing
    ? `https://www.youtube.com/embed/${track.id}?autoplay=1&controls=0&modestbranding=1&rel=0`
    : "about:blank";

  return (
    <>
      {/* Watch Video overlay (only when user opted in) */}
      {showVideo && (
        <div
          className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div className="relative w-full max-w-3xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={embedSrc}
              className="w-full h-full rounded-xl"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title="Music video"
            />
          </div>
        </div>
      )}

      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 md:ml-[210px] z-40 glass border-t border-border/50">
        {/* Hidden audio iframe (only when video overlay is closed) */}
        {!showVideo && (
          <iframe
            src={embedSrc}
            className="absolute w-px h-px opacity-0 pointer-events-none"
            allow="autoplay"
            title="Audio player"
          />
        )}

        {/* Progress bar */}
        <div className="h-[2px] bg-secondary">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center gap-3 px-4 py-2">
          {/* Track info */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0 relative">
              {track.thumbnail ? (
                <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Music className="w-4 h-4 text-muted-foreground" /></div>
              )}
              <div className="absolute bottom-0 right-0 bg-black/60 px-1 py-0.5 rounded-tl text-[8px] text-white flex items-center gap-0.5">
                <Mic2 className="w-2.5 h-2.5" /> Audio
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{track.title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{track.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><SkipBack className="w-4 h-4" /></button>
            <button onClick={() => setPlaying(!playing)}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><SkipForward className="w-4 h-4" /></button>
            <button onClick={() => setMuted(!muted)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowVideo(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              title="Watch video"
            >
              <Video className="w-3.5 h-3.5" /> Watch Video
            </button>
          </div>

          {/* Close */}
          <button onClick={() => { setTrack(null); setPlaying(false); globalTrack = null; }}
            className="p-1 text-muted-foreground hover:text-foreground ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;
