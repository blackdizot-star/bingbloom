import { supabase } from "@/integrations/supabase/client";

export type MediaType = "movie" | "tv";

export interface StreamSource {
  tmdb_id: string;
  media_type: MediaType;
  season: number | null;
  episode: number | null;
  server: string;
  url: string;
  working: boolean;
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export async function getCachedStream(
  tmdbId: string,
  mediaType: MediaType,
  server: string,
  season?: number,
  episode?: number,
): Promise<StreamSource | null> {
  try {
    const q = (supabase as any)
      .from("stream_sources")
      .select("*")
      .eq("tmdb_id", tmdbId)
      .eq("media_type", mediaType)
      .eq("server", server)
      .eq("working", true);
    if (season != null) q.eq("season", season);
    if (episode != null) q.eq("episode", episode);
    const { data } = await q.limit(1).maybeSingle();
    if (!data) return null;
    const age = Date.now() - new Date(data.verified_at).getTime();
    if (age > SEVEN_DAYS) return null;
    return data as StreamSource;
  } catch {
    return null;
  }
}

export async function recordStream(
  tmdbId: string,
  mediaType: MediaType,
  server: string,
  url: string,
  working: boolean,
  season?: number,
  episode?: number,
) {
  try {
    await supabase.functions.invoke("record-stream", {
      body: {
        tmdbId,
        mediaType,
        server,
        url,
        working,
        season: season ?? null,
        episode: episode ?? null,
      },
    });
  } catch {
    /* ignore */
  }
}
