import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import ContentRow from "@/components/ContentRow";
import { useKenyaContent } from "@/hooks/useKenyaContent";

const podcastRows = [
  { title: "🔥 Trending Podcasts", query: "trending podcast 2025" },
  { title: "🎙️ True Crime", query: "true crime podcast 2025" },
  { title: "😂 Comedy Podcasts", query: "comedy podcast funny 2025" },
  { title: "💼 Business & Finance", query: "business finance podcast 2025" },
  { title: "🧠 Self Improvement", query: "self improvement motivation podcast" },
  { title: "🎮 Gaming & Tech", query: "gaming tech podcast 2025" },
  { title: "📖 Storytelling", query: "storytelling podcast 2025" },
  { title: "🏈 Sports Talk", query: "sports podcast talk 2025" },
  { title: "🎵 Music Talk", query: "music industry podcast 2025" },
  { title: "🌍 Culture & Society", query: "culture society podcast 2025" },
  { title: "❤️ Relationships", query: "relationship love podcast 2025" },
  { title: "🧬 Science & Nature", query: "science nature podcast 2025" },
];

const PodcastRow = ({ title, query }: { title: string; query: string }) => {
  const { data, isLoading } = useKenyaContent(query);
  return <ContentRow title={title} items={data} isLoading={isLoading} />;
};

const PodcastsPage = () => (
  <AppLayout>
    <SEO
      title="Podcasts – MovieNoir"
      description="Listen to trending podcasts — true crime, comedy, business, self improvement, sports, science, culture and more on MovieNoir."
    />
    <div className="px-5 pt-5 pb-1">
      <h1 className="text-lg font-bold text-foreground">Podcasts</h1>
      <p className="text-[11px] text-muted-foreground mt-0.5">Listen to the world's best conversations 🎧</p>
    </div>
    <div className="mt-2">
      {podcastRows.map((row) => (
        <PodcastRow key={row.query} title={row.title} query={row.query} />
      ))}
    </div>
  </AppLayout>
);

export default PodcastsPage;
