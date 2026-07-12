// Ordered list of embed providers (July 2026). Primary first.
// Each builder returns a full iframe URL, or null if the provider
// doesn't support that media/id type.

export interface StreamingSource {
  name: string;
  // Prefer imdb id when provided, else tmdb id
  movie: (imdbId: string | null, tmdbId: string | number) => string | null;
  tv: ((imdbId: string | null, tmdbId: string | number, season: number, episode: number) => string | null) | null;
}

export const streamingSources: StreamingSource[] = [
  {
    name: "VidScr PM",
    movie: (imdb, tmdb) => `https://vidscr.pm/embed/movie/${imdb || tmdb}`,
    tv: (imdb, tmdb, s, e) => `https://vidscr.pm/embed/tv/${imdb || tmdb}/${s}/${e}`,
  },
  {
    name: "VidSrc.to",
    movie: (imdb, tmdb) => `https://vidsrc.to/embed/movie/${imdb || tmdb}`,
    tv: (imdb, tmdb, s, e) => `https://vidsrc.to/embed/tv/${imdb || tmdb}/${s}/${e}`,
  },
  {
    name: "VidSrc.sbs",
    movie: (_imdb, tmdb) => `https://vidsrc.sbs/embed/movie/${tmdb}`,
    tv: (_imdb, tmdb, s, e) => `https://vidsrc.sbs/embed/series/${tmdb}/${s}/${e}`,
  },
  {
    name: "AutoEmbed",
    movie: (_imdb, tmdb) => `https://player.autoembed.cc/embed/movie/${tmdb}`,
    tv: (_imdb, tmdb, s, e) => `https://player.autoembed.cc/embed/tv/${tmdb}/${s}/${e}`,
  },
  {
    name: "WarezCDN",
    movie: (imdb) => (imdb ? `https://embed.warezcdn.net/filme/${imdb}` : null),
    tv: null,
  },
  {
    name: "2Embed",
    movie: (imdb, tmdb) => `https://www.2embed.cc/embed/${imdb || tmdb}`,
    tv: (_imdb, tmdb, s, e) => `https://www.2embed.cc/embedtv/${tmdb}&s=${s}&e=${e}`,
  },
];

export function buildEmbedUrl(
  src: StreamingSource,
  type: "movie" | "tv",
  imdbId: string | null,
  tmdbId: string | number,
  season = 1,
  episode = 1,
): string | null {
  if (type === "tv") return src.tv ? src.tv(imdbId, tmdbId, season, episode) : null;
  return src.movie(imdbId, tmdbId);
}

export function availableSources(type: "movie" | "tv", imdbId: string | null): StreamingSource[] {
  return streamingSources.filter((s) => {
    if (type === "tv") return !!s.tv;
    // Filter out imdb-only sources when we don't have an imdb id
    if (s.name === "WarezCDN" && !imdbId) return false;
    return true;
  });
}
