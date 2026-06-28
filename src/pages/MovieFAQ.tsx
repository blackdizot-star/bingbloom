import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import { faqSchema } from "@/lib/seoSchemas";

const FAQS: { q: string; a: string }[] = [
  { q: "Where can I watch movies for free in 2026?", a: "BingBloom streams thousands of movies for free with no subscription required. The catalog covers Hollywood blockbusters, indie films, foreign cinema and family titles." },
  { q: "Is BingBloom legal?", a: "Yes. BingBloom is an ad-supported streaming service. Content is licensed and indexed via legal sources." },
  { q: "Do I need an account to watch?", a: "No. You can start watching immediately. Creating a free account lets you save your watchlist and sync across devices." },
  { q: "Can I download movies to watch offline?", a: "Yes. Tap the Download button on any movie or episode. Downloads support pause, resume, and offline playback in the BingBloom app." },
  { q: "What quality does BingBloom stream in?", a: "Most titles stream in HD (720p or 1080p) depending on the source and your connection." },
  { q: "Does BingBloom have new releases?", a: "Yes. Hot new releases are surfaced on the home page in the Trending and Now Playing rows, updated daily." },
  { q: "Can I watch on my TV?", a: "Yes. BingBloom works in any modern browser, including TV browsers, and supports casting from supported devices." },
  { q: "How do I cast a BingBloom movie to my Chromecast?", a: "Open the movie, start playback, and tap the cast icon in your browser's controls. Make sure your phone and Chromecast share the same Wi-Fi network." },
  { q: "Why is the video buffering?", a: "Buffering is usually a network issue. Try lowering quality, closing other tabs, or switching to a wired connection." },
  { q: "How do I find a specific movie?", a: "Use the search bar at the top — type the title, an actor, or a director." },
  { q: "Are there subtitles?", a: "Many titles include subtitle tracks. Open the subtitles menu in the player to pick a language." },
  { q: "Can I watch movies in different languages?", a: "Yes. BingBloom carries films from around the world, including Hindi, Spanish, French, Korean, Japanese and more." },
  { q: "What's the difference between Movies and TV on BingBloom?", a: "Movies are standalone films; TV are episodic series with seasons and episodes you can binge." },
  { q: "Do you have classic movies?", a: "Yes — BingBloom carries classic Hollywood titles alongside modern releases." },
  { q: "How often is new content added?", a: "New titles are added daily. Check the home page or Movies tab for what's new." },
  { q: "Is BingBloom available on iPhone?", a: "Yes. Open BingBloom in Safari and add it to your home screen for an app-like experience. An Android APK is also available." },
  { q: "How do I install the BingBloom Android app?", a: "Visit the Install page, tap the Install button to download the APK, then open it on your phone to install." },
  { q: "Can I watch the same movie on more than one device?", a: "Yes. Sign in with the same account on multiple devices to keep your watchlist and progress in sync." },
  { q: "Why are there ads?", a: "BingBloom is free because of ads. They keep the platform sustainable and free for everyone." },
  { q: "Does BingBloom track what I watch?", a: "Anonymized viewing data informs recommendations. You can review and clear your watch history in Settings." },
  { q: "How do I request a movie that's missing?", a: "Email hello.bingbloom@gmail.com with the title and year. We review every request." },
  { q: "What's the best free streaming app overall?", a: "We're biased, but BingBloom combines free movies, TV, anime, live channels and music in one app, which few competitors do." },
];

const MovieFAQ = () => {
  return (
    <AppLayout>
      <SEO
        title="Movie FAQ — Free Streaming Questions Answered | BingBloom"
        description="Answers to common questions about watching movies free on BingBloom — downloads, quality, subtitles, devices and more."
        canonicalPath="/movie-faq"
        jsonLd={faqSchema(FAQS)}
      />
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Movie FAQ</h1>
        <p className="text-sm text-muted-foreground mb-6">Quick answers about watching free movies and TV on BingBloom.</p>
        <ul className="space-y-3">
          {FAQS.map((f, i) => (
            <li key={i} className="rounded-xl border border-border/40 bg-card p-4">
              <h2 className="text-sm md:text-base font-semibold text-foreground mb-1">{f.q}</h2>
              <p className="text-xs md:text-sm text-foreground/80 leading-relaxed">{f.a}</p>
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  );
};

export default MovieFAQ;
