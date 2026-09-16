import { ExternalLink } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import ResponsiveScriptAd from "@/components/ResponsiveScriptAd";

const AnimePage = () => {
  return (
    <AppLayout>
      <SEO
        title="Anime – MovieNoir"
        description="Continue to NowAnime for anime streaming."
        noindex
      />
      <ResponsiveScriptAd className="border-b border-border/40 bg-background" />
      <main className="grid min-h-[70vh] place-items-center px-5 py-24">
        <div className="w-full max-w-sm rounded-md border border-border bg-card p-6 text-center shadow-2xl">
          <img src="/logo-compact.png" alt="MovieNoir" className="mx-auto h-12 w-12" />
          <h1 className="mt-4 text-3xl text-foreground">Watch anime on NowAnime</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            MovieNoir has moved its anime collection to the dedicated NowAnime site.
          </p>
          <a
            href="https://nowanime.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Visit NowAnime <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </main>
    </AppLayout>
  );
};

export default AnimePage;
