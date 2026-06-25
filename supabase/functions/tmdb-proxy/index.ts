// TMDB proxy edge function. Forwards GET requests to api.themoviedb.org
// using the TMDB_API_KEY secret. Avoids exposing the key to the client.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const TMDB_BASE = "https://api.themoviedb.org/3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const key = (Deno.env.get("TMDB_API_KEY") || "").trim().replace(/^["']|["']$/g, "");
    if (!key) {
      return new Response(JSON.stringify({ error: "TMDB_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const idx = url.pathname.indexOf("/tmdb-proxy");
    let path = idx >= 0 ? url.pathname.slice(idx + "/tmdb-proxy".length) : url.pathname;
    if (!path.startsWith("/")) path = "/" + path;
    if (path === "/") {
      return new Response(JSON.stringify({ error: "Missing TMDB path" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams(url.search);
    params.set("api_key", key);
    if (!params.has("language")) params.set("language", "en-US");

    const target = `${TMDB_BASE}${path}?${params.toString()}`;
    const upstream = await fetch(target, { headers: { Accept: "application/json" } });
    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Proxy error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
