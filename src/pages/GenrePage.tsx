import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import type { NormalizedVideo } from "@/hooks/useKenyaContent";

// Route TMDB calls through the tmdb-proxy edge function so the API key
// stays server-side and is never shipped in the client bundle.
const TMDB_PROXY = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tmdb-proxy`;
const TMDB_IMG = "https://image.tmdb.org/t/p";

const GENRE_MAP: Record<string, { name: string; id: number }> = {
  action: { name: "Action", id: 28 },
  comedy: { name: "Comedy", id: 35 },
  horror: { name: "Horror", id: 27 },
  drama: { name: "Drama", id: 18 },
  scifi: { name: "Sci-Fi", id: 878 },
  romance: { name: "Romance", id: 10749 },
  thriller: { name: "Thriller", id: 53 },
  animation: { name: "Animation", id: 16 },
  documentary: { name: "Documentary", id: 99 },
  trending: { name: "Trending", id: 0 },
  "new-releases": { name: "New Releases", id: -1 },
};

const GenrePage = () => {
  const { genre } = useParams<{ genre: string }>();
  const info = GENRE_MAP[genre || ""] || { name: genre || "Movies", id: 0 };

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["tmdb-genre", genre],
    queryFn: async () => {
      let url: string;
      if (genre === "trending") {
        url = `${TMDB_PROXY}/trending/movie/week`;
      } else if (genre === "new-releases") {
        url = `${TMDB_PROXY}/movie/now_playing`;
      } else {
        url = `${TMDB_PROXY}/discover/movie?with_genres=${info.id}&sort_by=popularity.desc`;
      }
      const res = await fetch(url);
      const data = await res.json();
      return (data.results || []).map((m: any) => ({
        id: `tmdb-${m.id}`,
        tmdbId: m.id,
        title: m.title || m.name || "",
        thumbnail: m.poster_path ? `${TMDB_IMG}/w500${m.poster_path}` : "",
        channel: "",
        views: `${(m.vote_average || 0).toFixed(1)}`,
        duration: "",
        backdrop: m.backdrop_path ? `${TMDB_IMG}/w780${m.backdrop_path}` : "",
      }));
    },
    enabled: !!genre,
  });

  return (
    <AppLayout>
      <SEO
        title={`${info.name} Movies – MovieNoir`}
        description={`Discover ${info.name.toLowerCase()} movies on MovieNoir. Trending, top-rated and new releases all in one place.`}
        jsonLd={{
          "@type": "CollectionPage",
          name: `${info.name} Movies – MovieNoir`,
          description: `Discover ${info.name.toLowerCase()} movies on MovieNoir.`,
          url: `https://bingbloom.lovable.app/genre/${genre}`,
        }}
      />
      <div className="px-[4%] pt-6 pb-2">
        <h1 className="text-2xl font-semibold text-white">{info.name}</h1>
        <p className="text-sm text-[#A1A1A1] mt-1">Discover {info.name.toLowerCase()} movies</p>
      </div>

      <div className="px-[4%] pb-10">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-5 mt-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-[#1A1A1A] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-5 mt-4">
            {movies.map((m: any) => (
              <a key={m.id} href={`/movie/${m.tmdbId}`} className="group">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#1A1A1A] relative shadow-md group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                  {m.thumbnail ? (
                    <img src={m.thumbnail} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-lg">{m.title?.[0]}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white text-lg ml-0.5">▶</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-white font-medium mt-2 line-clamp-1">{m.title}</p>
                <p className="text-xs text-[#A1A1A1]">{m.views} ★</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default GenrePage;
