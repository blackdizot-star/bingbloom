import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PIPED_INSTANCES = [
  "https://api.piped.private.coffee",
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://piapi.ggtyler.dev",
  "https://api.piped.yt",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");

    if (!path) {
      return new Response(JSON.stringify({ error: "Missing path parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let lastError = "";

    for (const instance of PIPED_INSTANCES) {
      try {
        const apiUrl = `${instance}${path}`;
        console.log(`Trying: ${apiUrl}`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(apiUrl, {
          headers: {
            Accept: "application/json",
            "User-Agent": "KenyaFlix/1.0",
          },
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          console.log(`Success from ${instance}`);
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        lastError = `${instance} returned ${res.status}`;
        console.warn(lastError);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        lastError = `${instance} failed: ${message}`;
        console.warn(lastError);
      }
    }

    // Graceful fallback for stream metadata failures:
    // keep player usable by returning a valid empty stream payload instead of a hard 502.
    if (path.startsWith("/streams/")) {
      const videoId = path.split("/").pop() || "";
      return new Response(
        JSON.stringify({
          title: "Now Playing",
          description: "",
          uploadDate: "",
          uploader: "",
          uploaderUrl: "",
          uploaderAvatar: "",
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          duration: 0,
          views: 0,
          likes: 0,
          hls: null,
          videoStreams: [],
          audioStreams: [],
          relatedStreams: [],
          _fallback: true,
          _details: lastError,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ error: "All Piped instances failed", details: lastError }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
