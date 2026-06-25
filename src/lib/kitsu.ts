const KITSU_BASE = "https://kitsu.io/api/edge";

export interface KitsuAnime {
  id: string;
  attributes: {
    canonicalTitle: string;
    synopsis: string;
    posterImage: { small: string; medium: string; large: string } | null;
    coverImage: { small: string; large: string } | null;
    episodeCount: number | null;
    averageRating: string | null;
    status: string;
    startDate: string | null;
    subtype: string;
  };
}

async function kitsuFetch(path: string): Promise<any> {
  const res = await fetch(`${KITSU_BASE}${path}`, {
    headers: { Accept: "application/vnd.api+json", "Content-Type": "application/vnd.api+json" },
  });
  if (!res.ok) throw new Error(`Kitsu error: ${res.status}`);
  return res.json();
}

export async function getTrendingKitsu(): Promise<KitsuAnime[]> {
  try {
    const data = await kitsuFetch("/trending/anime?limit=20");
    return data?.data || [];
  } catch {
    return [];
  }
}

export async function searchKitsu(query: string): Promise<KitsuAnime[]> {
  try {
    const data = await kitsuFetch(`/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=20`);
    return data?.data || [];
  } catch {
    return [];
  }
}

export async function getTopKitsu(): Promise<KitsuAnime[]> {
  try {
    const data = await kitsuFetch("/anime?sort=-averageRating&page[limit]=20&filter[status]=current,finished");
    return data?.data || [];
  } catch {
    return [];
  }
}
