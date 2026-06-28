import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import { getBlogPost } from "@/data/blogPosts";
import { articleSchema } from "@/lib/seoSchemas";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) {
    return (
      <AppLayout>
        <SEO title="Post not found – BingBloom Blog" noindex />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-foreground mb-3">Post not found</h1>
          <Link to="/blog" className="text-primary text-sm font-semibold">← Back to blog</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEO
        title={`${post.title} | BingBloom Blog`}
        description={post.excerpt}
        type="article"
        image={post.cover}
        canonicalPath={`/blog/${post.slug}`}
        jsonLd={articleSchema({
          headline: post.title,
          description: post.excerpt,
          image: post.cover,
          datePublished: post.date,
          author: post.author,
        })}
      />
      <article className="max-w-3xl mx-auto px-4 pt-4 pb-12">
        <Link to="/blog" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-3.5 h-3.5" /> All posts
        </Link>
        <img src={post.cover} alt="" className="w-full aspect-video object-cover rounded-2xl mb-5" />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{post.title}</h1>
        <p className="text-xs text-muted-foreground mb-6">{new Date(post.date).toLocaleDateString()} · {post.author}</p>
        <div className="prose prose-invert max-w-none space-y-4 text-[15px] leading-relaxed text-foreground/85">
          {post.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </article>
    </AppLayout>
  );
};

export default BlogPost;
