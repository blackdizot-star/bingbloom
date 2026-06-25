import { useState, useEffect } from "react";
import { Loader2, User } from "lucide-react";
import { searchJikanAnime, getAnimeCharacters, type JikanCharacter } from "@/lib/jikan";

interface CastSectionProps {
  title: string;
  channel?: string;
}

interface CastMember {
  name: string;
  role: string;
  image: string;
  voiceActor?: { name: string; image: string };
}

const CastSection = ({ title, channel }: CastSectionProps) => {
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!title) { setLoading(false); return; }

    const fetchCast = async () => {
      try {
        // Try finding anime match via Jikan
        const results = await searchJikanAnime(title, 3);
        if (results.length > 0) {
          const characters = await getAnimeCharacters(results[0].mal_id);
          const mapped = characters.slice(0, 12).map((c: JikanCharacter) => ({
            name: c.character.name,
            role: c.role,
            image: c.character.images.jpg.image_url,
            voiceActor: c.voice_actors.find((va) => va.language === "Japanese")
              ? {
                  name: c.voice_actors.find((va) => va.language === "Japanese")!.person.name,
                  image: c.voice_actors.find((va) => va.language === "Japanese")!.person.images.jpg.image_url,
                }
              : undefined,
          }));
          setCast(mapped);
        }
      } catch {}
      setLoading(false);
    };
    fetchCast();
  }, [title]);

  if (loading) {
    return (
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-xs">Loading cast...</span>
        </div>
      </div>
    );
  }

  if (cast.length === 0) return null;

  return (
    <div className="px-4 py-3 border-t border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3">🎭 Cast & Characters</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {cast.map((c) => (
          <div key={c.name} className="flex-shrink-0 w-20 text-center">
            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-muted">
              {c.image && !c.image.includes("questionmark") ? (
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-[10px] font-medium text-foreground mt-1 line-clamp-2">{c.name}</p>
            <p className="text-[9px] text-muted-foreground">{c.role}</p>
            {c.voiceActor && (
              <p className="text-[8px] text-primary mt-0.5 line-clamp-1">VA: {c.voiceActor.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CastSection;
