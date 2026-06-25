import { ChevronLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  current: number; // 1-based
  total?: number;
  showBack?: boolean;
  backTo?: string;
}

const StepProgress = ({ current, total = 5, showBack = true, backTo }: Props) => {
  const navigate = useNavigate();
  return (
    <div className="w-full pt-4 pb-2 relative">
      {showBack && (
        <button
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="absolute left-4 top-3 w-9 h-9 grid place-items-center rounded-lg bg-white/5 border border-white/10 text-white"
          aria-label="Back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      <p className="text-center text-[12px] text-white/70 mb-2">
        Step <span className="text-white font-semibold">{current}</span> of {total}
      </p>
      <div className="flex items-center justify-center gap-1.5 px-6">
        {Array.from({ length: total }).map((_, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          const last = n === total;
          return (
            <div key={n} className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold border ${
                  active
                    ? "text-white border-[#E50914] bg-[#E50914]/15"
                    : done
                    ? "text-white border-[#E50914] bg-[#E50914]"
                    : "text-white/40 border-white/20 bg-transparent"
                }`}
                style={
                  active
                    ? { boxShadow: "0 0 12px rgba(229,9,20,0.7)" }
                    : undefined
                }
              >
                {done ? <Check className="w-3 h-3" /> : last && active ? "✓" : n}
              </div>
              {n < total && (
                <div
                  className={`w-7 h-px ${n < current ? "bg-[#E50914]" : "bg-white/15"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
