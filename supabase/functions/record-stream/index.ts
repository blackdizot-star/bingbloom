// record-stream
// Public endpoint that caches a verified stream source.
// Uses the service role to call the privileged `record_stream_source` DB
// function, which validates the URL format before writing.
//
// Abuse controls:
// - URL host must match a strict allow-list of known streaming/embed domains,
//   so anonymous callers cannot plant arbitrary/phishing pages as "verified"
//   streams that get framed for every visitor.
// - Private/internal/link-local addresses are always rejected (SSRF guard).

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

// Only these host suffixes may be recorded as stream sources.
const ALLOWED_HOST_SUFFIXES = [
  // vidsrc family
  "vidsrc.me",
  "vidsrc.cc",
  "vidsrc.xyz",
  "vidsrc.to",
  "vidsrc.pm",
  "vidsrc.net",
  "vidsrc.in",
  // embed players used by the app
  "111movies.com",
  "smashy.stream",
  "videasy.net",
  // alternate embeds
  "2embed.cc",
  "autoembed.co",
  // generic CDNs commonly used by streams
  "cloudfront.net",
  "akamaized.net",
  "akamaihd.net",
  "amazonaws.com",
  // MovieBox / Fast Downloads CDNs
  "hakunaymatata.com",
  "aoneroom.com",
  "valiw.com",
];

// Reject private / internal / link-local addresses (SSRF guard).
function isBlockedAddress(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    h === "localhost" ||
    h === "ip6-localhost" ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h === "metadata.google.internal"
  ) {
    return true;
  }
  if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("::ffff:")) {
    return true;
  }
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const o = m.slice(1).map(Number);
    if (o.some((n) => n > 255)) return true;
    const [a, b] = o;
    if (a === 0 || a === 127 || a === 10) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 192 && b === 0) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
    if (a >= 224) return true;
  }
  return false;
}

function isAllowedStreamUrl(raw: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase();
  if (isBlockedAddress(host)) return false;
  return ALLOWED_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
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
    if (!isAllowedStreamUrl(url)) {
      return json({ error: "url host not allowed" }, 403);
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
