import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface QuickAnswersProps {
  title: string;
  year?: string;
  runtime?: string | null;
  rating?: number;
  cast?: string[];
}

const QuickAnswers = ({ title, year, runtime, rating, cast }: QuickAnswersProps) => {
  const [open, setOpen] = useState<number | null>(0);

  const items = [
    {
      q: `Where can I watch ${title} for free?`,
      a: `You can watch ${title} for free on BingBloom — no subscription, no sign-up required. Press the Watch Now button above to start streaming.`,
    },
    {
      q: `Is ${title} on Netflix or other paid services?`,
      a: `Availability on paid services changes frequently. ${title} is available right now on BingBloom for free, so you can skip the subscription juggle.`,
    },
    {
      q: `Who is in the cast of ${title}?`,
      a: cast && cast.length
        ? `${title} stars ${cast.slice(0, 5).join(", ")}${cast.length > 5 ? " and more" : ""}. See the full cast above.`
        : `Open the cast section above to see who stars in ${title}.`,
    },
    {
      q: `${title} runtime and rating`,
      a: `${title}${year ? ` (${year})` : ""}${runtime ? ` runs ${runtime}` : ""}${rating ? ` and is rated ${rating.toFixed(1)}/10 by audiences` : ""}.`,
    },
  ];

  return (
    <section className="mt-10" aria-label="Quick answers">
      <h2 className="text-sm md:text-base font-semibold text-foreground mb-3">Quick Answers</h2>
      <ul className="space-y-2">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <li key={i} className="rounded-xl border border-border/40 bg-card">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-2 p-3 text-left"
              >
                <span className="text-xs md:text-sm font-semibold text-foreground">{it.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-3 pb-3 text-xs md:text-sm text-foreground/80 leading-relaxed">{it.a}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default QuickAnswers;
