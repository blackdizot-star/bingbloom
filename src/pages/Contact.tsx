import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "General Inquiries", paragraphs: ["Email: hello.bingbloom@gmail.com — we aim to respond within 24-48 hours."] },
  { heading: "Support", paragraphs: ["Browse the Help Center first, or email support@bingbloom.com."] },
  { heading: "Legal & DMCA", bullets: ["Legal notices: legal@bingbloom.com", "DMCA takedown requests: dmca@bingbloom.com"] },
  { heading: "Privacy", paragraphs: ["Privacy questions: privacy@bingbloom.com"] },
  { heading: "Partnerships & Press", bullets: ["Media inquiries: press@bingbloom.com", "Partnerships: partners@bingbloom.com"] },
  { heading: "Advertising", paragraphs: ["Email partners@bingbloom.com to advertise with us."] },
];
export default function Contact() {
  return <LegalPage title="Contact Us" description="Reach out to MovieNoir for support, feedback, partnerships or press." intro="We'd love to hear from you. Whether you have a question, feedback, or a concern, we're here to help." sections={sections} cta={{ label: "Email hello.bingbloom@gmail.com", href: "mailto:hello.bingbloom@gmail.com" }} />;
}
