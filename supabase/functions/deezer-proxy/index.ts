// deezer-proxy
// Public Deezer API proxy. No auth required upstream.
// Routes: /chart, /search?q=..., /artist/{id}, /album/{id}, /playlist/{id}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/chart";
    const query = url.searchParams.get("q") || "";
    const limit = url.searchParams.get("limit") || "25";

    const upstream = new URL(`https://api.deezer.com${path.startsWith("/") ? path : `/${path}`}`);
    if (query) upstream.searchParams.set("q", query);
    upstream.searchParams.set("limit", limit);

    const res = await fetch(upstream.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 BingBloom" },
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
