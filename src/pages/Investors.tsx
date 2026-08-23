import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "Company Overview", paragraphs: ["MovieNoir is a next-generation streaming platform that offers movies, TV shows, live channels, music, and podcasts — all free with ad support. Our mission is to make quality entertainment accessible to everyone, regardless of their budget."] },
  { heading: "Key Facts", bullets: ["Founded: 2025", "Headquarters: Wilmington, DE, USA", "Industry: Streaming Media / Digital Entertainment", "Business Model: Ad-Supported Free Streaming"] },
  { heading: "Key Metrics", bullets: [
    "Monthly Active Users: growing rapidly — targeting 50+ daily active users by end of June 2026",
    "Content Library: thousands of movies, TV shows, live channels, music videos, and podcasts",
    "Platform Reach: available globally on web, mobile, and desktop PWA",
  ]},
  { heading: "Our Vision", paragraphs: ["MovieNoir is building the future of free streaming entertainment. We believe everyone deserves access to quality content without expensive subscriptions."], bullets: [
    "A vast, diverse library of entertainment content",
    "A seamless, ad-light experience that respects users",
    "Cross-platform accessibility on any device",
    "Community-driven features like watchlists and social sharing",
  ]},
  { heading: "Investor Inquiries", paragraphs: ["For investor relations inquiries, please email investors@bingbloom.com."] },
  { heading: "Financial Documents", paragraphs: ["As we continue to grow, we will make financial documents and disclosures available here. Please check back regularly for updates."] },
];
export default function Investors() {
  return <LegalPage title="Investor Relations" description="MovieNoir investor relations: company overview, growth strategy and contact." intro="Welcome to the MovieNoir Investor Relations center. Here you'll find information about our company, financial performance, and growth strategy." sections={sections} />;
}
