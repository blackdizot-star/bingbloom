interface Props {
  variant?: "loading" | "coming-soon";
  label?: string;
}

/**
 * Branded loader for the player. Shows a bouncing BingBloom logo while the
 * stream resolves. When `variant="coming-soon"` it switches to a static logo
 * + "Coming soon" caption — used in place of the TMDB error state.
 */
const PlayerBrandLoader = ({ variant = "loading", label }: Props) => {
  const bouncing = variant === "loading";
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center pointer-events-none"
      style={{ background: "#0A0A0A" }}
    >
      <img
        src="/logo-compact.png"
        alt="BingBloom"
        className={`h-14 w-14 rounded-xl drop-shadow-[0_0_24px_rgba(229,9,20,0.55)] ${bouncing ? "animate-bounce" : ""}`}
      />
      <p className="text-white text-xs font-semibold tracking-wide">
        {label ?? (bouncing ? "Loading stream…" : "Coming soon")}
      </p>
      {!bouncing && (
        <p className="text-white/55 text-[10.5px] max-w-xs leading-relaxed">
          This title isn't streamable yet. Try another server, or check back shortly.
        </p>
      )}
    </div>
  );
};

export default PlayerBrandLoader;
