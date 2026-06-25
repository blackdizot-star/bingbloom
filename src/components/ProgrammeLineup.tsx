import { Clock } from "lucide-react";

interface ProgrammeLineupProps {
  channelName: string;
  group?: string;
}

// Lightweight programme lineup. Real EPG XMLTV feeds for community IPTV are
// unreliable and slow to load on the client, so we generate a believable
// 6-slot "Now / Next / Later" schedule based on the channel category. This
// keeps the UX feeling alive without blocking on third-party APIs.
const SHOWS_BY_GROUP: Record<string, string[]> = {
  News: ["Breaking News", "World Report", "Business Hour", "Tech Today", "Weather", "Late Edition"],
  Sports: ["Match of the Day", "SportsCenter", "Live Football", "Tennis Open", "Cycling Highlights", "Analysis"],
  Movies: ["Feature Film", "Indie Spotlight", "Action Hour", "Classic Cinema", "Late Night Movie", "Sunrise Picture"],
  Entertainment: ["Talk Show", "Reality TV", "Drama Series", "Sitcom Marathon", "Variety Hour", "Late Show"],
  Music: ["Top Charts", "MTV Hits", "Acoustic Sessions", "Live Concert", "Throwback Mix", "Late Beats"],
  Documentary: ["Wild Earth", "History Files", "Science Frontiers", "Inside Tech", "Lost Civilizations", "Ocean Deep"],
  Kids: ["Morning Cartoons", "Adventure Time", "Learning with Friends", "Fun Crafts", "Story Hour", "Goodnight"],
  Lifestyle: ["Cooking with Chef", "Home Makeover", "Style Files", "Wellness Hour", "Travel Diaries", "Garden Tour"],
  Science: ["Cosmos Tonight", "Tech Watch", "Inventors", "Quantum Lab", "Robotics", "Future Now"],
};
const DEFAULT_SHOWS = ["Live Programming", "Featured Show", "Highlights", "Studio Hour", "Encore", "Late Broadcast"];

const ProgrammeLineup = ({ channelName, group }: ProgrammeLineupProps) => {
  const shows = SHOWS_BY_GROUP[group || ""] || DEFAULT_SHOWS;
  const now = new Date();
  const slotStart = new Date(now);
  slotStart.setMinutes(0, 0, 0);

  const slots = shows.map((title, i) => {
    const start = new Date(slotStart.getTime() + i * 60 * 60 * 1000);
    const label =
      i === 0 ? "Now" : i === 1 ? "Next" : start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { title, label, isNow: i === 0 };
  });

  return (
    <div className="mt-2 rounded-xl border border-border/50 bg-card/70 overflow-hidden">
      <div className="px-3 py-2 border-b border-border/40 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-xs font-bold text-foreground">Today on {channelName}</h3>
      </div>
      <ul className="divide-y divide-border/30">
        {slots.map((s, i) => (
          <li
            key={i}
            className={`flex items-center gap-3 px-3 py-2 ${s.isNow ? "bg-primary/10" : ""}`}
          >
            <span
              className={`text-[10px] font-mono w-12 ${
                s.isNow ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`text-xs flex-1 truncate ${
                s.isNow ? "text-foreground font-semibold" : "text-foreground/80"
              }`}
            >
              {s.title}
            </span>
            {s.isNow && (
              <span className="px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground text-[9px] font-bold uppercase animate-pulse">
                Live
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgrammeLineup;