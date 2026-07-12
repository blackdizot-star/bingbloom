// Client resolver for MovieBox playback (uses the moviebox-api edge function).
import { supabase } from "@/integrations/supabase/client";

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
  title: string;
  year?: string;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
}

export async function resolveMoviebox(args: ResolvePlaybackArgs): Promise<MovieboxPlayback> {
  try {
    const { data, error } = await supabase.functions.invoke("moviebox-api", {
      body: {
        title: args.title,
        year: args.year || "",
        mediaType: args.mediaType,
        season: args.season ?? 1,
        episode: args.episode ?? 1,
      },
    });
    if (error) return { ok: false, reason: "MovieBox is unavailable right now." };
    return (data as MovieboxPlayback) ?? { ok: false, reason: "Empty response" };
  } catch {
    return { ok: false, reason: "MovieBox is unavailable right now." };
  }
}
