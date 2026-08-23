// JSON-LD schema builders. Pass results to <SEO jsonLd={...}>.
// Output objects omit "@context" because the SEO component prepends it.

export const SITE_URL = "https://bingbloom.lovable.app";

export const websiteSchema = () => ({
  "@type": "WebSite",
  name: "MovieNoir",
  url: SITE_URL,
  description: "Free streaming of movies, TV, anime, live channels, music and podcasts.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const organizationSchema = () => ({
  "@type": "Organization",
  name: "MovieNoir",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
});

export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/bingbloom",
  instagram: "https://instagram.com/bingbloom",
  tiktok: "https://tiktok.com/@bingbloom",
  reddit: "https://reddit.com/r/bingbloom",
  telegram: "https://t.me/bingbloom",
  discord: "https://discord.gg/bingbloom",
} as const;

export const organizationWithSocialsSchema = () => ({
  "@type": "Organization",
  name: "MovieNoir",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  sameAs: Object.values(SOCIAL_LINKS),
});

export const softwareApplicationSchema = () => ({
  "@type": "SoftwareApplication",
  name: "MovieNoir",
  operatingSystem: "Android",
  applicationCategory: "MultimediaApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", ratingCount: "152000" },
  downloadUrl: `${SITE_URL}/install`,
});

export const movieSchema = (m: {
  title: string;
  description?: string;
  image?: string;
  datePublished?: string;
  rating?: number;
  genres?: string[];
  director?: string;
  actors?: string[];
}) => ({
  "@type": "Movie",
  name: m.title,
  description: m.description,
  image: m.image,
  datePublished: m.datePublished,
  genre: m.genres,
  director: m.director ? { "@type": "Person", name: m.director } : undefined,
  actor: m.actors?.map((n) => ({ "@type": "Person", name: n })),
  aggregateRating:
    m.rating && m.rating > 0
      ? { "@type": "AggregateRating", ratingValue: m.rating, bestRating: 10, ratingCount: 100 }
      : undefined,
});

export const tvSeriesSchema = (t: {
  name: string;
  description?: string;
  image?: string;
  datePublished?: string;
  numberOfSeasons?: number;
  actors?: string[];
}) => ({
  "@type": "TVSeries",
  name: t.name,
  description: t.description,
  image: t.image,
  datePublished: t.datePublished,
  numberOfSeasons: t.numberOfSeasons,
  actor: t.actors?.map((n) => ({ "@type": "Person", name: n })),
});

export const faqSchema = (qa: { q: string; a: string }[]) => ({
  "@type": "FAQPage",
  mainEntity: qa.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

export const articleSchema = (a: {
  headline: string;
  description?: string;
  image?: string;
  datePublished: string;
  author?: string;
}) => ({
  "@type": "Article",
  headline: a.headline,
  description: a.description,
  image: a.image,
  datePublished: a.datePublished,
  author: { "@type": "Organization", name: a.author || "MovieNoir" },
});
