// Deezer client (via deezer-proxy edge function).
const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const PROXY_BASE = `https://${PROJECT_REF}.supabase.co/functions/v1/deezer-proxy`;

export interface DeezerArtist {
  id: number;
  name: string;
  picture_medium: string;
  picture_big?: string;
}
export interface DeezerAlbum {
  id: number;
  title: string;
  cover_medium: string;
  cover_big?: string;
}
export interface DeezerTrack {
  id: number;
  title: string;
  duration: number;
  preview: string; // 30s mp3 preview
  artist: DeezerArtist;
  album: DeezerAlbum;
}

async function deezer<T = any>(path: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams({ path, ...params });
  const res = await fetch(`${PROXY_BASE}?${qs}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Deezer ${res.status}`);
  return res.json();
}

export async function deezerChart(): Promise<{ tracks: DeezerTrack[]; artists: DeezerArtist[]; albums: DeezerAlbum[] }> {
  const data = await deezer<any>("/chart");
  return {
    tracks: data.tracks?.data || [],
    artists: data.artists?.data || [],
    albums: data.albums?.data || [],
  };
}

export async function deezerSearch(query: string): Promise<DeezerTrack[]> {
  const data = await deezer<any>("/search", { q: query });
  return data.data || [];
}

export async function deezerByGenre(genre: string): Promise<DeezerTrack[]> {
  // Deezer has no clean genre endpoint without auth — search works fine.
  return deezerSearch(genre);
}
