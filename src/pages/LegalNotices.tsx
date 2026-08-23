import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "Copyright Notice", paragraphs: [
    "All content, including but not limited to text, graphics, logos, icons, images, audio clips, video clips, and software, is the property of MovieNoir Inc. or its content suppliers and is protected by United States and international copyright laws.",
    "The compilation of all content on this site is the exclusive property of MovieNoir Inc.",
  ]},
  { heading: "Trademark Information", paragraphs: ["\"MovieNoir,\" the MovieNoir logo, and other MovieNoir trademarks and service marks are the property of MovieNoir Inc. All other trademarks used on this site are the property of their respective owners. You may not use any MovieNoir trademarks without our prior written consent."] },
  { heading: "Intellectual Property Rights", paragraphs: ["The MovieNoir platform and all content, features, and functionality are owned by MovieNoir Inc. and are protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to access and use the platform for personal, non-commercial purposes."] },
  { heading: "Open Source Software", paragraphs: ["MovieNoir uses various open source software components. Full license information and acknowledgments are available upon request."] },
  { heading: "Content Disclaimer", paragraphs: ["All content is provided \"as is,\" and we make no warranties regarding the accuracy or availability of any content."] },
  { heading: "Governing Law", paragraphs: ["These legal notices and the MovieNoir Terms of Use are governed by the laws of the State of Delaware, USA, without regard to its conflict of law provisions."] },
];
export default function LegalNotices() {
  return <LegalPage title="Legal Notices" description="MovieNoir copyright, trademark, intellectual property and open source notices." sections={sections} />;
}
