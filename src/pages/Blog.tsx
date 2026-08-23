import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  return (
    <AppLayout>
      <SEO
        title="MovieNoir Blog – Streaming News & Guides"
        description="The MovieNoir blog: streaming guides, what-to-watch picks, and the latest on free movies, TV, anime and live channels."
        canonicalPath="/blog"
      />
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">MovieNoir Blog</h1>
        <p className="text-sm text-muted-foreground mb-6">Streaming guides, what-to-watch picks, and platform news.</p>
        <ul className="space-y-4">
          {blogPosts.map((p) => (
            <li key={p.slug}>
              <Link to={`/blog/${p.slug}`} className="flex gap-3 rounded-xl overflow-hidden border border-border/40 bg-card hover:border-primary/40 transition-colors">
                <img src={p.cover} alt="" loading="lazy" className="w-28 h-28 md:w-36 md:h-36 object-cover flex-shrink-0" />
                <div className="flex-1 p-3 min-w-0">
                  <h2 className="text-sm md:text-base font-bold text-foreground line-clamp-2">{p.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.excerpt}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(p.date).toLocaleDateString()} · {p.author}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  );
};

export default Blog;
