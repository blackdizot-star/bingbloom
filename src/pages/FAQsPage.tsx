import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import { FAQS } from "@/data/faqs";
import { faqSchema } from "@/lib/seoSchemas";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQsPage = () => {
  const categories = useMemo(() => Array.from(new Set(FAQS.map((f) => f.category))), []);
  const [active, setActive] = useState<string>("All");
  const filtered = active === "All" ? FAQS : FAQS.filter((f) => f.category === active);

  return (
    <AppLayout>
      <SEO
        title="FAQs & Questions – BingBloom Free Streaming Answers"
        description="100+ answers about free streaming, movies, TV, anime, live TV, music and the BingBloom app. Watch anything, no sign-up."
        canonicalPath="/faqs"
        jsonLd={faqSchema(FAQS.map((f) => ({ q: f.q, a: f.a })))}
      />
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4 pb-16" style={{ background: "#0A0A0A" }}>
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5" style={{ color: "#E50914" }} />
          <h1 className="text-xl md:text-2xl font-bold text-white">FAQs &amp; Questions</h1>
        </div>
        <p className="text-[13px] text-white/65 mb-5 leading-relaxed">
          100 quick answers about BingBloom — the free streaming app for movies, TV, anime,{" "}
          <Link to="/live-tv" className="text-[#E50914] hover:underline">live TV</Link>, music and podcasts. No subscription, no sign-up. Start at{" "}
          <Link to="/home" className="text-[#E50914] hover:underline">/home</Link> or{" "}
          <Link to="/install" className="text-[#E50914] hover:underline">install the app</Link>.
        </p>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 mb-5">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${active === c ? "text-white" : "text-white/70"}`}
              style={{
                background: active === c ? "#E50914" : "#1F1F1F",
                border: active === c ? "1px solid #E50914" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {filtered.map((f, i) => (
            <AccordionItem
              key={i}
              value={`q-${i}`}
              id={`q-${FAQS.indexOf(f) + 1}`}
              className="rounded-xl border border-white/10 bg-[#141414] px-3"
            >
              <AccordionTrigger className="text-left text-[13px] font-semibold text-white hover:no-underline py-3">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[12.5px] text-white/75 leading-relaxed pb-3">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 rounded-xl border border-white/10 bg-[#141414] p-4">
          <h2 className="text-sm font-bold text-white mb-2">Still have questions?</h2>
          <p className="text-[12px] text-white/70">
            Email <a href="mailto:hello.bingbloom@gmail.com" className="text-[#E50914] hover:underline">hello.bingbloom@gmail.com</a> or open the{" "}
            <Link to="/contact" className="text-[#E50914] hover:underline">contact page</Link>. See also the{" "}
            <Link to="/movie-faq" className="text-[#E50914] hover:underline">Movie FAQ</Link>.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default FAQsPage;
