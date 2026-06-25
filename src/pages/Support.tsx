import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";

const FAQS = [
  { q: "Is BingBloom free?", a: "Yes. BingBloom is free to use and supported by ads." },
  { q: "Can I download movies for offline?", a: "Yes — use the Download button on any title to save it for offline." },
  { q: "How do I install the Android app?", a: "Visit /install and tap Install. Allow installation from unknown sources if prompted." },
  { q: "Where do I report a problem?", a: "Send an email to info.bingbloom@gmail.com or use the form on /contact." },
];

const Support = () => (
  <AppLayout>
    <SEO title="Help Center – BingBloom" description="Get help with BingBloom — FAQs, support and contact information." />
    <div className="max-w-2xl mx-auto px-5 py-6 text-white">
      <h1 className="text-2xl font-extrabold">Help Center</h1>
      <p className="text-[13px] text-white/55 mt-1">Answers, guides and ways to reach us.</p>

      <div className="mt-5 space-y-3">
        {FAQS.map((f) => (
          <details key={f.q} className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <summary className="cursor-pointer font-semibold text-[14px]">{f.q}</summary>
            <p className="text-[13px] text-white/65 mt-2">{f.a}</p>
          </details>
        ))}
      </div>

      <Link to="/contact" className="mt-5 inline-block px-5 py-3 rounded-xl text-white font-semibold" style={{ background: "#E50914" }}>
        Contact Support
      </Link>
    </div>
  </AppLayout>
);

export default Support;
