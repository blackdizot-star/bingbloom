// TheAudioDB free API - no key needed (test key = 2)
const BASE = "https://theaudiodb.com/api/v1/json/2";

export interface AudioDBArtist {
  idArtist: string;
  strArtist: string;
  strArtistThumb: string | null;
  strArtistFanart: string | null;
  strBiographyEN: string | null;
  strGenre: string | null;
  strCountry: string | null;
  strLabel: string | null;
}

export interface AudioDBAlbum {
  idAlbum: string;
  strAlbum: string;
  strAlbumThumb: string | null;
  intYearReleased: string | null;
  strGenre: string | null;
  strDescriptionEN: string | null;
  strArtist: string;
}

export interface AudioDBTrack {
  idTrack: string;
  strTrack: string;
  strArtist: string;
  intDuration: string | null;
  strMusicVid: string | null;
  strGenre: string | null;
}

export async function searchArtist(name: string): Promise<AudioDBArtist | null> {
  try {
    const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(name)}`);
    const data = await res.json();
    return data.artists?.[0] || null;
  } catch {
    return null;
  }
}

export async function getArtistAlbums(artistId: string): Promise<AudioDBAlbum[]> {
  try {
    const res = await fetch(`${BASE}/album.php?i=${artistId}`);
    const data = await res.json();
    return data.album || [];
  } catch {
    return [];
  }
}

export async function getAlbumTracks(albumId: string): Promise<AudioDBTrack[]> {
  try {
    const res = await fetch(`${BASE}/track.php?m=${albumId}`);
    const data = await res.json();
    return data.track || [];
  } catch {
    return [];
  }
}

export async function getTrendingMusic(): Promise<AudioDBTrack[]> {
  try {
    const res = await fetch(`${BASE}/trending.php?country=us&type=itunes&format=singles`);
    const data = await res.json();
    return data.trending || [];
  } catch {
    return [];
  }
}
