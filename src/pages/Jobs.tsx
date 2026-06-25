import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "Why BingBloom?", bullets: [
    "Innovation: we're reimagining what free streaming can be",
    "Accessibility: entertainment should be for everyone",
    "Community: we listen to our users and build what they want",
    "Growth: a fast-moving startup with big ambitions",
  ]},
  { heading: "Current Openings", groups: [
    { title: "Content Operations", bullets: ["Content Curator", "Metadata Specialist", "Content Partnerships Manager"] },
    { title: "Engineering", bullets: ["Frontend Developer (React / TypeScript)", "Backend Developer (Node.js)", "Mobile Developer (PWA)", "DevOps Engineer"] },
    { title: "Product & Design", bullets: ["Product Manager", "UX/UI Designer", "User Researcher"] },
    { title: "Marketing & Growth", bullets: ["Growth Marketer", "Social Media Manager", "Community Manager"] },
    { title: "Customer Experience", bullets: ["Support Specialist", "User Feedback Analyst"] },
  ]},
  { heading: "How to Apply", paragraphs: ["Send your resume and a brief introduction to jobs@bingbloom.com. Include the position title in the subject line."] },
  { heading: "Remote Work", paragraphs: ["BingBloom is a remote-first company with team members across the globe."] },
  { heading: "Diversity and Inclusion", paragraphs: ["We welcome applicants from all backgrounds, regardless of race, color, religion, gender, sexual orientation, national origin, age, disability, or veteran status."] },
];
export default function Jobs() {
  return <LegalPage title="Jobs at BingBloom" description="Open roles across engineering, content, product, design, marketing and support." intro="We're building a platform that brings free entertainment to everyone. Join us in our mission to make quality streaming accessible worldwide." sections={sections} />;
}
