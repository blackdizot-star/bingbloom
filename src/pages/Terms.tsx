import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "1. Acceptance of Terms", paragraphs: ["By using BingBloom, you agree to these Terms of Use. If you do not agree, please do not use our service."] },
  { heading: "2. The Service", paragraphs: ["BingBloom provides a free, ad-supported streaming platform for movies, TV shows, live channels, music, and podcasts. We reserve the right to modify, suspend, or discontinue the service at any time."] },
  { heading: "3. User Accounts", paragraphs: ["You may use BingBloom without an account. Creating an account provides additional features such as watchlist, continue watching, and personalized recommendations. You are responsible for maintaining the confidentiality of your account credentials."] },
  { heading: "4. Content", paragraphs: ["All content on BingBloom is provided for personal, non-commercial use only. You may not redistribute, sell, or publicly display any content. Content availability may vary by region and is subject to change."] },
  { heading: "5. User Conduct", bullets: ["Do not violate any laws or regulations", "Do not infringe on intellectual property rights", "Do not bypass any security measures", "Do not use the service commercially without authorization"] },
  { heading: "6. Advertisements", paragraphs: ["BingBloom is an ad-supported platform. You agree to view advertisements as part of the service."] },
  { heading: "7. Termination", paragraphs: ["We reserve the right to terminate or suspend access immediately, without prior notice, for conduct that violates these Terms or poses a safety or legal risk."] },
  { heading: "8. Disclaimer of Warranties", paragraphs: ["The service is provided \"as is\" and \"as available.\" We make no warranties, express or implied."] },
  { heading: "9. Limitation of Liability", paragraphs: ["To the fullest extent permitted by law, BingBloom Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages."] },
  { heading: "10. Governing Law", paragraphs: ["These Terms are governed by the laws of the State of Delaware, USA."] },
  { heading: "11. Changes to Terms", paragraphs: ["We may update these Terms from time to time. Continued use of the service after changes constitutes acceptance."] },
  { heading: "12. Contact", paragraphs: ["For questions about these Terms, contact us at legal@bingbloom.com."] },
];
export default function Terms() {
  return <LegalPage title="Terms of Use" description="The legal agreement governing your use of BingBloom." updated="June 2026" sections={sections} />;
}
