// record-stream
// Public endpoint that caches a verified stream source.
// Uses the service role to call the privileged `record_stream_source` DB
// function, which validates the URL format before writing.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { tmdbId, mediaType, server, url, working, season, episode } = body ?? {};

    if (typeof tmdbId !== "string" || tmdbId.length === 0 || tmdbId.length > 50) {
      return json({ error: "invalid tmdbId" }, 400);
    }
    if (mediaType !== "movie" && mediaType !== "tv") {
      return json({ error: "invalid mediaType" }, 400);
    }
    if (typeof server !== "string" || server.length === 0 || server.length > 50) {
      return json({ error: "invalid server" }, 400);
    }
    if (typeof url !== "string" || !/^https?:\/\//.test(url) || url.length > 2000) {
      return json({ error: "invalid url" }, 400);
    }
    if (typeof working !== "boolean") {
      return json({ error: "invalid working" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.rpc("record_stream_source", {
      p_tmdb_id: tmdbId,
      p_media_type: mediaType,
      p_server: server,
      p_url: url,
      p_working: working,
      p_season: season ?? null,
      p_episode: episode ?? null,
    });

    if (error) return json({ error: error.message }, 400);
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
