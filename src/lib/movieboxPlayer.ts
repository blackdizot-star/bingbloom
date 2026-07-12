// Client resolver for direct HLS/MP4 playback (uses the vidsrc-stream edge function).

export interface MovieboxPlayback {
  ok: boolean;
  reason?: string;
  kind?: "hls" | "mp4";
  url?: string;
  title?: string;
  poster?: string | null;
  captions?: { lang: string; url: string }[];
}

export interface ResolvePlaybackArgs {
  tmdbId: string;
  imdbId?: string | null;
  title: string;
  year?: string;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
}

export async function resolveMoviebox(args: ResolvePlaybackArgs): Promise<MovieboxPlayback> {
  try {
    const id = args.imdbId || args.tmdbId;
    const base = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const params = new URLSearchParams({ tmdbId: id, type: args.mediaType });
    if (args.mediaType === "tv") {
      params.set("season", String(args.season ?? 1));
      params.set("episode", String(args.episode ?? 1));
    }
    const res = await fetch(`${base}/functions/v1/vidsrc-stream?${params.toString()}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const json = await res.json().catch(() => null);
    if (!json?.ok || !json?.streamUrl) {
      return { ok: false, reason: json?.error || "No direct stream is available right now." };
    }
    return {
      ok: true,
      kind: json.kind === "mp4" ? "mp4" : "hls",
      url: json.streamUrl,
      title: json.source,
    };
  } catch {
    return { ok: false, reason: "The stream resolver is unavailable right now." };
  }
}
