import { ReactNode } from "react";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";

export interface LegalSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  /** Sub-headings within a section (rendered <h3>) */
  groups?: { title: string; paragraphs?: string[]; bullets?: string[] }[];
}

interface Props {
  title: string;
  description: string;
  intro?: string;
  sections: LegalSection[];
  updated?: string;
  cta?: { label: string; href: string };
}

const LegalPage = ({ title, description, intro, sections, updated, cta }: Props) => (
  <AppLayout>
    <SEO title={`${title} – BingBloom`} description={description} />
    <article className="max-w-3xl mx-auto px-5 py-8 text-white">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
      {updated && <p className="text-[11px] text-white/45 mt-1">Last updated: {updated}</p>}
      {intro && <p className="mt-4 text-sm text-white/75 leading-relaxed">{intro}</p>}

      <div className="mt-6 space-y-7">
        {sections.map((s, i) => (
          <section key={i}>
            {s.heading && <h2 className="text-base font-semibold text-white mb-2">{s.heading}</h2>}
            {s.paragraphs?.map((p, j) => (
              <p key={j} className="text-[13px] text-white/70 leading-relaxed mb-2">{p}</p>
            ))}
            {s.bullets && (
              <ul className="list-disc pl-5 text-[13px] text-white/70 space-y-1">
                {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            )}
            {s.table && (
              <div className="overflow-x-auto border border-white/10 rounded-lg mt-2">
                <table className="w-full text-[12px]">
                  <thead className="bg-white/5">
                    <tr>{s.table.headers.map((h) => <th key={h} className="text-left px-3 py-2 font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((r, ri) => (
                      <tr key={ri} className="border-t border-white/5">
                        {r.map((c, ci) => <td key={ci} className="px-3 py-2 text-white/70">{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {s.groups?.map((g, gi) => (
              <div key={gi} className="mt-4">
                <h3 className="text-sm font-semibold text-white mb-1.5">{g.title}</h3>
                {g.paragraphs?.map((p, j) => (
                  <p key={j} className="text-[13px] text-white/70 leading-relaxed mb-2">{p}</p>
                ))}
                {g.bullets && (
                  <ul className="list-disc pl-5 text-[13px] text-white/70 space-y-1">
                    {g.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>

      {cta && (
        <a
          href={cta.href}
          className="inline-flex items-center justify-center mt-8 px-5 h-10 rounded-lg text-white text-sm font-semibold"
          style={{ background: "linear-gradient(180deg,#FF1A26 0%,#E50914 100%)" }}
        >
          {cta.label}
        </a>
      )}
    </article>
  </AppLayout>
);

export default LegalPage;
