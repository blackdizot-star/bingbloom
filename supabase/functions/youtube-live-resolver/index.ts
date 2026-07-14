// YouTube live channel HLS resolver.
// Given ?handle=CazeTV, returns { url, title, thumbnail } for the current live stream.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const cache = new Map<string, { at: number; data: any }>();
const TTL_MS = 5 * 60 * 1000;

async function resolveHandle(handle: string) {
  const cleaned = handle.replace(/^@/, "");
  const url = `https://www.youtube.com/@${cleaned}/live`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });
  const html = await res.text();

  const hlsMatch = html.match(/"hlsManifestUrl":"([^"]+)"/);
  const titleMatch = html.match(/<meta name="title" content="([^"]+)"/);
  const thumbMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);

  return {
    url: hlsMatch ? hlsMatch[1].replace(/\\u0026/g, "&") : null,
    title: titleMatch?.[1] ?? cleaned,
    thumbnail: thumbMatch?.[1] ?? null,
    videoId: videoIdMatch?.[1] ?? null,
    embedUrl: `https://www.youtube.com/embed/live_stream?channel=${cleaned}&autoplay=1&mute=0`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const u = new URL(req.url);
    const handle = u.searchParams.get("handle");
    if (!handle) {
      return new Response(JSON.stringify({ error: "handle required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const key = handle.toLowerCase();
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL_MS) {
      return new Response(JSON.stringify(hit.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await resolveHandle(handle);
    cache.set(key, { at: Date.now(), data });
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
