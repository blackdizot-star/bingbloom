const JIKAN_BASE = "https://api.jikan.moe/v4";

export interface JikanEpisode {
  mal_id: number;
  title: string;
  title_japanese: string | null;
  title_romanji: string | null;
  aired: string | null;
  score: number | null;
  filler: boolean;
  recap: boolean;
  forum_url: string | null;
}

export interface JikanCharacter {
  character: {
    mal_id: number;
    name: string;
    images: { jpg: { image_url: string } };
  };
  role: string;
  voice_actors: {
    person: { mal_id: number; name: string; images: { jpg: { image_url: string } } };
    language: string;
  }[];
}

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  synopsis: string | null;
  score: number | null;
  episodes: number | null;
  status: string;
  images: { jpg: { large_image_url: string; image_url: string } };
  genres: { name: string }[];
  studios: { name: string }[];
  aired: { string: string } | null;
  trailer: { youtube_id: string | null } | null;
}

async function jikanFetch(path: string): Promise<any> {
  const res = await fetch(`${JIKAN_BASE}${path}`);
  if (!res.ok) throw new Error(`Jikan error: ${res.status}`);
  return res.json();
}

export async function getAnimeEpisodes(malId: number, page = 1): Promise<{ episodes: JikanEpisode[]; hasNext: boolean }> {
  try {
    const data = await jikanFetch(`/anime/${malId}/episodes?page=${page}`);
    return {
      episodes: data?.data || [],
      hasNext: data?.pagination?.has_next_page || false,
    };
  } catch {
    return { episodes: [], hasNext: false };
  }
}

export async function getAnimeCharacters(malId: number): Promise<JikanCharacter[]> {
  try {
    const data = await jikanFetch(`/anime/${malId}/characters`);
    return data?.data || [];
  } catch {
    return [];
  }
}

export async function getAnimeById(malId: number): Promise<JikanAnime | null> {
  try {
    const data = await jikanFetch(`/anime/${malId}`);
    return data?.data || null;
  } catch {
    return null;
  }
}

export async function searchJikanAnime(query: string, limit = 10): Promise<JikanAnime[]> {
  try {
    const data = await jikanFetch(`/anime?q=${encodeURIComponent(query)}&limit=${limit}`);
    return data?.data || [];
  } catch {
    return [];
  }
}

export async function getAnimeRecommendations(malId: number): Promise<any[]> {
  try {
    const data = await jikanFetch(`/anime/${malId}/recommendations`);
    return (data?.data || []).slice(0, 20);
  } catch {
    return [];
  }
}
