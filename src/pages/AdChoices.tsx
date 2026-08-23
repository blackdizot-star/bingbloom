import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "Our Ad Philosophy", bullets: [
    "Non-intrusive: ads are placed in dedicated spaces, not interrupting your viewing",
    "Relevant: we strive to show ads that are interesting and useful",
    "Transparent: we clearly label advertisements",
  ]},
  { heading: "Manage Your Ad Preferences", paragraphs: ["You can control how we use data for advertising. When personalized ads are on, we use your viewing history to show more relevant ads. When off, you'll see generic ads."] },
  { heading: "Third-Party Advertising", paragraphs: ["We work with trusted advertising partners who may use cookies and similar technologies to deliver relevant ads."] },
  { heading: "Advertisers", paragraphs: ["Interested in advertising on MovieNoir? Email partners@bingbloom.com."] },
  { heading: "Cookie Preferences", paragraphs: ["You can manage your cookie preferences through the Cookie Preferences page."] },
];
export default function AdChoices() {
  return <LegalPage title="Advert Choices" description="Manage your advertising preferences on MovieNoir." intro="MovieNoir is a free, ad-supported platform. We show non-intrusive banner advertisements to keep the service free for everyone." sections={sections} />;
}
