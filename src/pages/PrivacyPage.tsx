import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "Information We Collect", groups: [
    { title: "Information You Provide", bullets: ["Account information (phone, name)", "Preferences and settings", "Content you save to your watchlist", "Feedback and suggestions"] },
    { title: "Collected Automatically", bullets: ["Usage data (content watched, time spent)", "Device information (browser, OS, IP)", "Cookies and similar tracking technologies"] },
  ]},
  { heading: "How We Use Your Information", bullets: [
    "Provide and improve the BingBloom service",
    "Personalize content recommendations",
    "Remember preferences and settings",
    "Analyze usage to improve our platform",
    "Comply with legal obligations",
  ]},
  { heading: "Cookies", paragraphs: ["We use cookies to enhance your experience, analyze site traffic, and serve relevant advertisements. You can control cookie preferences through your browser or our Cookie Preferences page."] },
  { heading: "Data Security", paragraphs: ["We implement reasonable administrative, logical, physical, and managerial measures to safeguard your information."] },
  { heading: "Data Retention", paragraphs: ["We keep your personal information only as long as necessary for the purposes we collected it for."] },
  { heading: "Your Rights", bullets: ["Access information we hold about you", "Request correction of inaccurate information", "Request deletion of your information", "Opt out of marketing communications"] },
  { heading: "Contact Us", paragraphs: ["For privacy questions or to exercise your rights, contact privacy@bingbloom.com."] },
];
export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" description="How BingBloom collects, uses and protects your personal information." updated="June 2026" sections={sections} />;
}
