const ANILIST_URL = "https://graphql.anilist.co";

export interface AniListMedia {
  id: number;
  title: { romaji: string; english: string | null };
  coverImage: { large: string };
  episodes: number | null;
  averageScore: number | null;
  genres: string[];
  description: string | null;
  status: string;
  season: string | null;
  seasonYear: number | null;
}

export interface AniListEpisode {
  id: string;
  title: string;
  thumbnail: string;
  number: number;
}

async function anilistQuery(query: string, variables: Record<string, any> = {}): Promise<any> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  return res.json();
}

export async function getTrendingAnime(page = 1, perPage = 20): Promise<AniListMedia[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC) {
          id title { romaji english } coverImage { large }
          episodes averageScore genres description status season seasonYear
        }
      }
    }
  `;
  const data = await anilistQuery(query, { page, perPage });
  return data?.data?.Page?.media || [];
}

export async function getPopularAnime(page = 1, perPage = 20): Promise<AniListMedia[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: POPULARITY_DESC, status: RELEASING) {
          id title { romaji english } coverImage { large }
          episodes averageScore genres description status season seasonYear
        }
      }
    }
  `;
  const data = await anilistQuery(query, { page, perPage });
  return data?.data?.Page?.media || [];
}

export async function getTopRatedAnime(page = 1, perPage = 20): Promise<AniListMedia[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: SCORE_DESC, status: FINISHED) {
          id title { romaji english } coverImage { large }
          episodes averageScore genres description status season seasonYear
        }
      }
    }
  `;
  const data = await anilistQuery(query, { page, perPage });
  return data?.data?.Page?.media || [];
}

export async function searchAnime(search: string, perPage = 20): Promise<AniListMedia[]> {
  const query = `
    query ($search: String, $perPage: Int) {
      Page(perPage: $perPage) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id title { romaji english } coverImage { large }
          episodes averageScore genres description status season seasonYear
        }
      }
    }
  `;
  const data = await anilistQuery(query, { search, perPage });
  return data?.data?.Page?.media || [];
}

export async function getAnimeByGenre(genre: string, perPage = 20): Promise<AniListMedia[]> {
  const query = `
    query ($genre: String, $perPage: Int) {
      Page(perPage: $perPage) {
        media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
          id title { romaji english } coverImage { large }
          episodes averageScore genres description status season seasonYear
        }
      }
    }
  `;
  const data = await anilistQuery(query, { genre, perPage });
  return data?.data?.Page?.media || [];
}

export async function getSeasonalAnime(season: string, seasonYear: number, perPage = 20): Promise<AniListMedia[]> {
  const query = `
    query ($season: MediaSeason, $seasonYear: Int, $perPage: Int) {
      Page(perPage: $perPage) {
        media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC) {
          id title { romaji english } coverImage { large }
          episodes averageScore genres description status season seasonYear
        }
      }
    }
  `;
  const data = await anilistQuery(query, { season, seasonYear, perPage });
  return data?.data?.Page?.media || [];
}
