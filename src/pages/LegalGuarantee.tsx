import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "Service Guarantee", bullets: [
    "Reliable Access: high uptime and fast loading times",
    "Content Availability: a diverse library of entertainment",
    "Transparent Ads: clearly labeled, non-intrusive advertisements",
  ]},
  { heading: "Content Guarantee", bullets: [
    "Content is provided through legal partnerships with content providers",
    "We respect intellectual property rights and respond promptly to DMCA notices",
    "Content is provided \"as is\" with no hidden fees or charges",
  ]},
  { heading: "Privacy Guarantee", bullets: [
    "Personal information is protected according to our Privacy Policy",
    "We do not sell your personal data to third parties",
    "You can request deletion of your data at any time",
  ]},
  { heading: "User Rights", bullets: [
    "Access content without signing up (basic viewing)",
    "Create an account for additional features (optional)",
    "Request deletion of your account and data",
    "Report issues and receive support",
  ]},
  { heading: "Limitation of Liability", paragraphs: ["To the fullest extent permitted by law, BingBloom Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service."] },
  { heading: "Questions?", paragraphs: ["Contact legal@bingbloom.com."] },
];
export default function LegalGuarantee() {
  return <LegalPage title="Legal Guarantee" description="BingBloom's commitments on service quality, content, privacy and user rights." intro="BingBloom is committed to providing a reliable, legal, and transparent streaming service. Here's what we guarantee to our users." sections={sections} />;
}
