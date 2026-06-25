import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require an authenticated user so anonymous callers can't drain AI credits.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub || claimsData.claims.role !== "authenticated") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  try {
    const { title, channel, views, duration } = await req.json();

    if (!title) {
      return new Response(JSON.stringify({ error: "Missing title" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are a Kenyan entertainment metadata expert. Given this video info, generate rich metadata.

Video title: "${title}"
Channel: "${channel || "Unknown"}"
Views: ${views || "Unknown"}
Duration: ${duration || "Unknown"} seconds

Return a JSON object using the tool provided with:
- synopsis: A compelling 2-3 sentence description of what this video is likely about, written for a Kenyan streaming platform audience. Be specific about Kenyan culture, music, or film context if relevant.
- genres: Array of 2-4 genre tags (e.g. "Comedy", "Drama", "Gospel", "Gengetone", "Romance", "Action", "Documentary", "Music Video", "Talk Show", "Reality TV")
- mood: One mood tag (e.g. "Feel Good", "Inspirational", "Thrilling", "Romantic", "Hilarious", "Emotional", "Hype")
- rating: A plausible rating out of 10 (number, 1 decimal)
- language: Likely language(s) (e.g. "Swahili", "English", "Sheng", "Kikuyu")
- cast: Array of 0-3 likely notable people/artists featured (only if inferable from title/channel, otherwise empty array)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_metadata",
              description: "Return enriched video metadata",
              parameters: {
                type: "object",
                properties: {
                  synopsis: { type: "string" },
                  genres: { type: "array", items: { type: "string" } },
                  mood: { type: "string" },
                  rating: { type: "number" },
                  language: { type: "array", items: { type: "string" } },
                  cast: { type: "array", items: { type: "string" } },
                },
                required: ["synopsis", "genres", "mood", "rating", "language", "cast"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_metadata" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "No metadata generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metadata = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("enrich-metadata error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
