import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ThumbsUp, Share2, Plus, Loader2, Star, Maximize, Minimize, X, Lock, Unlock, Clock, Eye, User, Play } from "lucide-react";
import SEO from "@/components/SEO";
import { getStreamData, type PipedStream } from "@/lib/piped";
import ContentCard from "@/components/ContentCard";
import EpisodesList from "@/components/EpisodesList";
import type { NormalizedVideo } from "@/hooks/useKenyaContent";
import { useKenyaContent } from "@/hooks/useKenyaContent";
import { useEnrichedMetadata } from "@/hooks/useEnrichedMetadata";
import { trackWatch } from "@/hooks/useContinueWatching";
import { toggleMyList, isInMyList } from "@/hooks/useMyList";
import { toggleLike, isLiked } from "@/hooks/useLikedVideos";
import { useLikeCount } from "@/hooks/useLikes";
import { toast } from "@/components/ui/sonner";
import { shortenTitle } from "@/lib/titleUtils";

function buildNormalizedVideo(videoId: string, stream: PipedStream): NormalizedVideo {
  return {
    id: videoId, title: stream.title || "Untitled", thumbnail: stream.thumbnailUrl || "",
    channel: stream.uploader || "",
    views: stream.views >= 1_000_000 ? `${(stream.views / 1_000_000).toFixed(1)}M` : stream.views >= 1_000 ? `${(stream.views / 1_000).toFixed(1)}K` : `${stream.views || 0}`,
    duration: `${Math.floor((stream.duration || 0) / 60)}:${((stream.duration || 0) % 60).toString().padStart(2, "0")}`,
  };
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

const WatchPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [stream, setStream] = useState<PipedStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [metadataFailed, setMetadataFailed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [addedToList, setAddedToList] = useState(false);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [screenLocked, setScreenLocked] = useState(false);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastTapRef = useRef<{ time: number; side: "left" | "right" | null }>({ time: 0, side: null });

  const { data: fallbackRelated } = useKenyaContent("trending movies 2025 2026", metadataFailed);
  const { count: likeCount, userLiked: dbLiked, toggleLike: dbToggleLike } = useLikeCount(videoId);
  const { metadata: aiMeta } = useEnrichedMetadata(stream?.title, stream?.uploader, stream?.views, stream?.duration, !!stream && !loading);
  const { data: trendingData } = useKenyaContent("trending movies 2025 2026");

  useEffect(() => {
    if (!videoId) return;
    setLoading(true); setMetadataFailed(false); setAddedToList(false);
    setLiked(isLiked(videoId));
    getStreamData(videoId).then((data) => {
      if (!data) setMetadataFailed(true);
      setStream(data); setLoading(false); setAddedToList(isInMyList(videoId));
    }).catch(() => { setMetadataFailed(true); setLoading(false); });
  }, [videoId]);

  useEffect(() => {
    if (!stream || !videoId) return;
    const video = buildNormalizedVideo(videoId, stream);
    trackWatch(video, 10);
    const interval = setInterval(() => {
      const entries = JSON.parse(localStorage.getItem("continue_watching") || "[]");
      const entry = entries.find((e: any) => e.video.id === videoId);
      if (entry && entry.progress < 90) trackWatch(video, entry.progress + 5);
    }, 30000);
    return () => clearInterval(interval);
  }, [stream, videoId]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.event === "onStateChange" && data?.info === 0 && autoplayNext) {
          const related = stream?.relatedStreams || [];
          const nextVideo = related.find(v => { const vid = v.url?.replace("/watch?v=", "") || ""; return vid && vid !== videoId; });
          if (nextVideo) { const nextId = nextVideo.url?.replace("/watch?v=", "") || ""; if (nextId) { toast("Playing next..."); navigate(`/watch/${nextId}`); } }
        }
      } catch {}
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [autoplayNext, stream, videoId, navigate]);

  useEffect(() => {
    const onFsChange = () => {
      const isFull = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) { document.body.style.overflow = ""; setScreenLocked(false); try { screen.orientation?.unlock?.(); } catch {} }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => { document.removeEventListener("fullscreenchange", onFsChange); document.removeEventListener("webkitfullscreenchange", onFsChange); };
  }, []);

  const enterFullscreen = useCallback(async () => {
    const el = playerContainerRef.current; if (!el) return;
    try { if (el.requestFullscreen) await el.requestFullscreen(); else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen(); document.body.style.overflow = "hidden"; try { await (screen.orientation as any)?.lock?.("landscape"); } catch {} } catch { setIsFullscreen(true); document.body.style.overflow = "hidden"; }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen(); else setIsFullscreen(false); } catch { setIsFullscreen(false); }
    document.body.style.overflow = ""; setScreenLocked(false); try { screen.orientation?.unlock?.(); } catch {}
  }, []);

  const handleDoubleTap = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (screenLocked) return;
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const side: "left" | "right" = x < rect.width / 2 ? "left" : "right";
    const now = Date.now();
    if (now - lastTapRef.current.time < 350 && lastTapRef.current.side === side) {
      toast(side === "right" ? "+10s ⏩" : "⏪ -10s");
      lastTapRef.current = { time: 0, side: null };
    } else { lastTapRef.current = { time: now, side }; }
  }, [screenLocked]);

  const handleLike = () => {
    if (!stream || !videoId) return;
    const nowLiked = toggleLike(buildNormalizedVideo(videoId, stream));
    setLiked(nowLiked); dbToggleLike(); toast(nowLiked ? "Liked! ❤️" : "Removed like");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/watch/${videoId}`;
    if (navigator.share) { try { await navigator.share({ title: stream?.title || "Check this out", url }); } catch {} }
    else { await navigator.clipboard.writeText(url); toast("Link copied!"); }
  };

  const handleAddToList = () => {
    if (!stream || !videoId) return;
    const added = toggleMyList(buildNormalizedVideo(videoId, stream));
    setAddedToList(added); toast(added ? "Added to Watchlist!" : "Removed from Watchlist");
  };

  const related: NormalizedVideo[] = (stream?.relatedStreams || []).map((v) => ({
    id: v.url?.replace("/watch?v=", "") || "", title: v.title || "", thumbnail: v.thumbnail || "", channel: v.uploaderName || "",
    views: v.views >= 1_000_000 ? `${(v.views / 1_000_000).toFixed(1)}M` : v.views >= 1_000 ? `${(v.views / 1_000).toFixed(1)}K` : `${v.views || 0}`,
    duration: `${Math.floor((v.duration || 0) / 60)}:${((v.duration || 0) % 60).toString().padStart(2, "0")}`,
  })).filter(v => v.id);

  const seenIds = new Set<string>([videoId || ""]);
  const uniqueRelated = related.filter(v => { if (seenIds.has(v.id)) return false; seenIds.add(v.id); return true; });
  const displayRelated = uniqueRelated.length > 0 ? uniqueRelated : fallbackRelated;
  const moreLikeThis = displayRelated.slice(0, 6);
  const youMayAlsoLike = displayRelated.slice(6, 12);
  const trendingUnique = trendingData.filter(v => !seenIds.has(v.id)).slice(0, 10);

  return (
    <div className="min-h-screen bg-background pb-4">
      <SEO
        title={stream?.title ? `${stream.title} – BingBloom` : "Watch – BingBloom"}
        description={(stream?.description || stream?.title || "Watch videos on BingBloom").slice(0, 160)}
        image={stream?.thumbnailUrl || undefined}
        canonicalPath={`/watch/${videoId}`}
      />
      {/* Player */}
      <div ref={playerContainerRef} onTouchStart={handleDoubleTap}
        className={`relative w-full bg-card ${isFullscreen ? "fixed inset-0 z-[100] flex items-center justify-center" : "aspect-video md:max-h-[70vh]"}`}>
        <iframe ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&controls=1&showinfo=0&iv_load_policy=3&disablekb=0`}
          className="w-full h-full" allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
          title={stream?.title || "Video"}
          style={isFullscreen ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : undefined} />
        {!screenLocked && (
          <>
            {!isFullscreen && <Link to="/home" className="absolute top-3 left-3 p-2 glass rounded-full z-10"><ArrowLeft className="w-5 h-5 text-foreground" /></Link>}
            {isFullscreen && <button onClick={exitFullscreen} className="absolute top-3 left-3 p-2 glass rounded-full z-10"><X className="w-5 h-5 text-foreground" /></button>}
            <button onClick={isFullscreen ? exitFullscreen : enterFullscreen} className="absolute top-3 right-3 p-2 glass rounded-full z-10">
              {isFullscreen ? <Minimize className="w-5 h-5 text-foreground" /> : <Maximize className="w-5 h-5 text-foreground" />}
            </button>
          </>
        )}
        {isFullscreen && (
          <button onClick={() => setScreenLocked(!screenLocked)} className="absolute bottom-3 right-3 p-2 glass rounded-full z-10">
            {screenLocked ? <Lock className="w-5 h-5 text-primary" /> : <Unlock className="w-5 h-5 text-foreground" />}
          </button>
        )}
      </div>

      {/* Metadata section */}
      <div className="max-w-5xl mx-auto">
        <div className="px-5 py-5">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading...</span></div>
          ) : (
            <div className="animate-fade-in">
              <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight">{shortenTitle(stream?.title || "Now Playing", 80)}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {stream?.views != null && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="w-3 h-3" />{formatCount(stream.views)}</span>}
                {stream?.duration != null && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{Math.floor(stream.duration / 60)}m</span>}
                {stream?.uploader && <span className="flex items-center gap-1 text-xs text-muted-foreground"><User className="w-3 h-3" />{stream.uploader}</span>}
                {stream?.likes != null && stream.likes > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><ThumbsUp className="w-3 h-3" />{formatCount(stream.likes)}</span>}
              </div>
              {aiMeta && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-sm font-bold text-foreground">
                      <Star className="w-3.5 h-3.5 text-bb-gold fill-current" />{aiMeta.rating.toFixed(1)}
                    </span>
                    <span className="gradient-bb text-[9px] font-semibold px-2 py-0.5 rounded-full text-primary-foreground">{aiMeta.mood}</span>
                    {aiMeta.language.map((lang) => <span key={lang} className="bg-secondary text-muted-foreground text-[9px] px-2 py-0.5 rounded-full">{lang}</span>)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {aiMeta.genres.map((g) => <span key={g} className="bg-secondary text-foreground text-[9px] font-medium px-2 py-0.5 rounded-full">{g}</span>)}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{aiMeta.synopsis}</p>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-5 py-3 border-y border-border/50 overflow-x-auto scrollbar-hide">
            <button className="flex items-center gap-2 gradient-bb text-primary-foreground font-semibold px-5 py-2 rounded-xl text-xs whitespace-nowrap hover:opacity-90 transition-opacity">
              <Play className="w-3.5 h-3.5 fill-current" /> Watch Free
            </button>
            <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${liked || dbLiked ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"}`}>
              <ThumbsUp className={`w-3.5 h-3.5 ${liked || dbLiked ? "fill-current" : ""}`} />{likeCount > 0 ? formatCount(likeCount) : "Like"}
            </button>
            <button onClick={handleAddToList} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${addedToList ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"}`}>
              <Plus className={`w-3.5 h-3.5 ${addedToList ? "rotate-45" : ""} transition-transform`} />{addedToList ? "Added" : "Watchlist"}
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all whitespace-nowrap">
              <Share2 className="w-3.5 h-3.5" />Share
            </button>
          </div>

          {/* Autoplay toggle */}
          <div className="flex items-center justify-between mt-3 px-1">
            <span className="text-xs text-muted-foreground">Autoplay next</span>
            <button onClick={() => setAutoplayNext(!autoplayNext)} className={`w-9 h-5 rounded-full transition-colors relative ${autoplayNext ? "gradient-bb" : "bg-secondary"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${autoplayNext ? "left-4 bg-primary-foreground" : "left-0.5 bg-muted-foreground"}`} />
            </button>
          </div>
        </div>

        {stream?.uploader && stream?.title && videoId && <EpisodesList channelName={stream.uploader} title={stream.title} currentVideoId={videoId} />}

        {moreLikeThis.length > 0 && (
          <div className="px-5 py-5 border-t border-border/50">
            <h2 className="text-sm font-bold text-foreground mb-3">More Like This</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {moreLikeThis.map((v) => <ContentCard key={v.id} video={v} />)}
            </div>
          </div>
        )}

        {trendingUnique.length > 0 && (
          <div className="px-5 py-5 border-t border-border/50">
            <h2 className="text-sm font-bold text-foreground mb-3">Trending Now</h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {trendingUnique.map((v) => <ContentCard key={v.id} video={v} />)}
            </div>
          </div>
        )}

        {youMayAlsoLike.length > 0 && (
          <div className="px-5 py-5 border-t border-border/50">
            <h2 className="text-sm font-bold text-foreground mb-3">You May Also Like</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {youMayAlsoLike.map((v) => <ContentCard key={v.id} video={v} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WatchPage;
