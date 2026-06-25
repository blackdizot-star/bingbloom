import { Navigate, useParams } from "react-router-dom";

// Anime now uses TMDB tv ids. The /anime/:id route just forwards to /tv/:id
// so the rich TVDetailPage (cast, seasons, episodes, vidsrc playback) handles it.
const AnimeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/anime" replace />;
  return <Navigate to={`/tv/${id}`} replace />;
};

export default AnimeDetailPage;
