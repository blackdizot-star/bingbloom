// Embed source registry. Ordered by priority. All accept TMDB IDs.
export interface StreamingSource {
  name: string;
  movie: (id: string | number) => string;
  tv: ((id: string | number, season: number, episode: number) => string) | null;
}

export const streamingSources: StreamingSource[] = [
  {
    name: "VidScr PM",
    movie: (id) => `https://vidscr.pm/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidscr.pm/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: "VidSrc.to",
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: "VidSrc.xyz",
    movie: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    name: "AutoEmbed",
    movie: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    tv: (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: "2Embed",
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
];

export function buildEmbedUrl(
  source: StreamingSource,
  type: "movie" | "tv",
  id: string | number,
  season = 1,
  episode = 1,
): string | null {
  if (type === "tv") return source.tv ? source.tv(id, season, episode) : null;
  return source.movie(id);
}
