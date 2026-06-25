// toggle-like
// Public endpoint that adjusts a video's like count by exactly +/-1.
// Uses the service role to call the privileged `toggle_like` DB function,
// which clamps the count at zero. Anonymous visitors may call this.

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
    const { videoId, delta } = await req.json().catch(() => ({}));

    if (typeof videoId !== "string" || videoId.length === 0 || videoId.length > 200) {
      return json({ error: "invalid videoId" }, 400);
    }
    if (delta !== 1 && delta !== -1) {
      return json({ error: "invalid delta" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.rpc("toggle_like", {
      p_video_id: videoId,
      p_delta: delta,
    });

    if (error) return json({ error: error.message }, 400);
    return json({ count: data }, 200);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
