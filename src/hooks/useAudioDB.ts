import { useQuery } from "@tanstack/react-query";
import { searchArtist, getArtistAlbums, type AudioDBArtist, type AudioDBAlbum } from "@/lib/audiodb";

const KENYAN_ARTISTS = [
  "The Weeknd", "Drake", "Taylor Swift", "Billie Eilish",
  "Dua Lipa", "Ed Sheeran", "Bruno Mars", "Coldplay",
  "Imagine Dragons", "Post Malone", "Burna Boy", "Wizkid",
  "Tiwa Savage", "Sauti Sol", "Adele", "Beyoncé",
];

export interface ArtistWithAlbums {
  artist: AudioDBArtist;
  albums: AudioDBAlbum[];
}

export function useKenyanArtists() {
  return useQuery({
    queryKey: ["audiodb-kenyan-artists"],
    queryFn: async () => {
      const results: ArtistWithAlbums[] = [];
      // Fetch first 8 in parallel
      const batch = KENYAN_ARTISTS.slice(0, 10);
      const artists = await Promise.all(batch.map(name => searchArtist(name)));
      for (const artist of artists) {
        if (artist) {
          const albums = await getArtistAlbums(artist.idArtist);
          results.push({ artist, albums: albums.slice(0, 4) });
        }
      }
      return results;
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useArtistSearch(name: string) {
  return useQuery({
    queryKey: ["audiodb-artist", name],
    queryFn: () => searchArtist(name),
    enabled: !!name,
  });
}
