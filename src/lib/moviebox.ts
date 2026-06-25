// Client helper for the "Fast Downloads" source (MovieBox via the
// moviebox-resolve edge function). Resolves direct MP4 URLs and wraps them in
// the proxy edge function so the browser can fetch them (the CDN requires a
// Referer header the browser cannot set).
import { supabase } from "@/integrations/supabase/client";

export interface MovieboxDownload {
  resolution: number; // 1080 / 720 / 480 / 360
  url: string;
  size: number; // bytes
  format: string;
}

export interface MovieboxCaption {
  lang: string;
  url: string;
}

export interface MovieboxResult {
  ok: boolean;
  reason?: string;
  title?: string;
  year?: string;
  poster?: string | null;
  downloads?: MovieboxDownload[];
  captions?: MovieboxCaption[];
}

export interface ResolveArgs {
  title: string;
  year?: string;
  mediaType: "movie" | "tv" | "anime";
  season?: number;
  episode?: number;
}

export async function resolveMovieboxDownloads(args: ResolveArgs): Promise<MovieboxResult> {
  try {
    const { data, error } = await supabase.functions.invoke("moviebox-resolve", {
      body: {
        title: args.title,
        year: args.year,
        mediaType: args.mediaType,
        season: args.season ?? 0,
        episode: args.episode ?? 0,
      },
    });
    if (error) return { ok: false, reason: "Fast Downloads is unavailable right now." };
    return data as MovieboxResult;
  } catch {
    return { ok: false, reason: "Fast Downloads is unavailable right now." };
  }
}

// Wrap a MovieBox CDN URL through the proxy edge function (adds the required
// Referer + permissive CORS so the browser can download/stream it).
export function movieboxProxyUrl(url: string): string {
  const ref = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  return `https://${ref}.supabase.co/functions/v1/proxy?url=${encodeURIComponent(url)}`;
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "";
  const gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(0)} MB`;
}

export function resolutionLabel(res: number): string {
  if (res >= 2160) return "4K";
  if (res >= 1080) return "1080p Full HD";
  if (res >= 720) return "720p HD";
  if (res >= 480) return "480p";
  if (res >= 360) return "360p";
  return `${res}p`;
}
