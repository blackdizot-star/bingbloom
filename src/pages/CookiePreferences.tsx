import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "What Are Cookies?", paragraphs: ["Cookies are small text files stored on your device that help websites remember your preferences and understand how you use the service."] },
  { heading: "Types of Cookies We Use", bullets: [
    "Essential Cookies — required for the website to function properly. Cannot be disabled.",
    "Preference Cookies — remember your settings and preferences.",
    "Analytics Cookies — help us understand how users interact with our site.",
    "Advertising Cookies — used to show relevant advertisements.",
  ]},
  { heading: "Your Choices", paragraphs: ["You can control non-essential cookies through your browser settings at any time. Essential cookies are always active because the site cannot function without them."] },
  { heading: "More Information", paragraphs: ["For more details, please see our Privacy Policy."] },
];
export default function CookiePreferences() {
  return <LegalPage title="Cookie Preferences" description="Manage your cookie preferences on MovieNoir." intro="Manage your cookie preferences. Cookies help us provide, protect, and improve our service." sections={sections} />;
}
