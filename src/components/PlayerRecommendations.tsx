import TmdbRow from "./TmdbRow";
import {
  useMovieRecommendations,
  useMovieSimilar,
  useTvRecommendations,
  useTvSimilar,
} from "@/hooks/useTmdb";

interface Props {
  tmdbId: string;
  type: "movie" | "tv";
}

const PlayerRecommendations = ({ tmdbId, type }: Props) => {
  const recMovie = useMovieRecommendations(type === "movie" ? tmdbId : undefined);
  const simMovie = useMovieSimilar(type === "movie" ? tmdbId : undefined);
  const recTv = useTvRecommendations(type === "tv" ? tmdbId : undefined);
  const simTv = useTvSimilar(type === "tv" ? tmdbId : undefined);

  const forYou = type === "movie" ? simMovie : simTv;
  const recommended = type === "movie" ? recMovie : recTv;

  return (
    <div className="mt-8">
      <TmdbRow
        title="For You"
        items={forYou.data}
        isLoading={forYou.isLoading}
        type={type}
      />
      <TmdbRow
        title="Recommended"
        items={recommended.data}
        isLoading={recommended.isLoading}
        type={type}
      />
    </div>
  );
};

export default PlayerRecommendations;
