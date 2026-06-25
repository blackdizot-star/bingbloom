import { useQuery } from "@tanstack/react-query";
import { searchPiped, getTrending, type PipedVideo } from "@/lib/piped";

export interface NormalizedVideo {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  views: string;
  duration: string;
}

function normalizePiped(v: PipedVideo): NormalizedVideo {
  const id = v.url?.replace("/watch?v=", "") || "";
  const dur = v.duration || 0;
  const m = Math.floor(dur / 60);
  const s = dur % 60;
  const duration = `${m}:${s.toString().padStart(2, "0")}`;
  const views = v.views >= 1_000_000
    ? `${(v.views / 1_000_000).toFixed(1)}M`
    : v.views >= 1_000
    ? `${(v.views / 1_000).toFixed(1)}K`
    : `${v.views || 0}`;
  return {
    id,
    title: v.title || "Untitled",
    thumbnail: v.thumbnail || "",
    channel: v.uploaderName || "Unknown",
    views,
    duration,
  };
}

export function useKenyaContent(query: string, enabled = true) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["piped-search", query],
    queryFn: async () => {
      const results = await searchPiped(query);
      return results.map(normalizePiped).filter(v => v.id);
    },
    enabled,
  });

  return { data, isLoading };
}

export function useTrending() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["piped-trending"],
    queryFn: async () => {
      const results = await getTrending();
      return results.map(normalizePiped).filter(v => v.id);
    },
  });

  return { data, isLoading };
}
