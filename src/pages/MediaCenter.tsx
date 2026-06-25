import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "About BingBloom", paragraphs: ["BingBloom is a free, ad-supported streaming platform offering movies, TV shows, live channels, music, and podcasts. We are building the future of accessible entertainment."] },
  { heading: "Media Kit", bullets: ["BingBloom Logo (PNG, SVG)", "BingBloom Icon (PNG, SVG)", "BingBloom Wordmark (PNG, SVG)", "Brand Guidelines PDF available on request"] },
  { heading: "Company Facts", bullets: ["Founded: 2025", "Headquarters: Wilmington, DE", "Business Model: Ad-Supported Free Streaming", "Platform: Web, Mobile PWA"] },
  { heading: "Press Contact", paragraphs: ["Email: press@bingbloom.com — we aim to respond within 24 hours."] },
];
export default function MediaCenter() {
  return <LegalPage title="Media Center" description="Press releases, company information, and media resources for BingBloom." intro="Welcome to the BingBloom Media Center. Here you'll find press releases, company information, and media resources." sections={sections} />;
}
