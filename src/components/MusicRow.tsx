import { Link } from "react-router-dom";
import { Music } from "lucide-react";
import { useKenyanArtists } from "@/hooks/useAudioDB";

/** Compact horizontal music row on the home page. */
const MusicRow = () => {
  const { data } = useKenyanArtists();
  const artists = (data || []).slice(0, 15);

  if (artists.length === 0) return null;

  return (
    <section className="mt-6 md:mt-10 px-[5%]">
      <div className="mb-2 flex items-end justify-between md:mb-4">
        <h2 className="text-base font-bold text-foreground md:text-2xl flex items-center gap-2">
          <Music className="h-4 w-4 md:h-5 md:w-5 text-primary" /> Music
        </h2>
        <Link to="/music" className="text-xs text-primary/90 hover:text-primary md:text-sm">All ›</Link>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {artists.map((a: any) => (
          <Link
            key={a.idArtist}
            to="/music"
            className="group flex-shrink-0 w-[110px] sm:w-[130px] md:w-[140px]"
          >
            <div className="aspect-square rounded-full overflow-hidden bg-surface-2 relative shadow-md transition-transform duration-200 group-hover:-translate-y-1 ring-1 ring-border">
              {a.strArtistThumb ? (
                <img
                  src={a.strArtistThumb}
                  alt={a.strArtist}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-foreground/40">
                  <Music className="h-6 w-6" />
                </div>
              )}
            </div>
            <p className="mt-1.5 text-[11px] md:text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary text-center">
              {a.strArtist}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default MusicRow;
