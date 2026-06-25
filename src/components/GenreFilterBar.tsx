interface GenreFilterBarProps {
  genres: { label: string; value: string }[];
  active: string;
  onChange: (value: string) => void;
}

const GenreFilterBar = ({ genres, active, onChange }: GenreFilterBarProps) => (
  <div className="flex gap-2 px-5 py-2 overflow-x-auto scrollbar-hide">
    {genres.map((g) => (
      <button
        key={g.value}
        onClick={() => onChange(g.value)}
        className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
          active === g.value
            ? "gradient-bb text-primary-foreground shadow-md"
            : "bg-card text-muted-foreground border border-border/50 hover:bg-secondary hover:text-foreground"
        }`}
      >
        {g.label}
      </button>
    ))}
  </div>
);

export default GenreFilterBar;
