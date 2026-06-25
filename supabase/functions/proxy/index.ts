// Generic stream proxy with HLS playlist rewriting, redirects, and Range support.
// GET /functions/v1/proxy?url=<encoded-url>
//
// - Follows upstream redirects server-side so browsers never receive blocked 3xx hops.
// - Rewrites HLS playlist segment/key URLs back through this proxy.
// - Forwards Range / User-Agent / Referer for video seeking.
// - Adds permissive CORS so the resource is usable from the browser.
// - Restricts to a configurable allow-list of domains to prevent abuse.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Expose-Headers":
    "content-range, accept-ranges, content-length, content-type",
};

const ALLOWED_HOST_SUFFIXES = [
  // vidsrc family
  "vidsrc.me",
  "vidsrc.cc",
  "vidsrc.xyz",
  "vidsrc.to",
  "vidsrc.pm",
  "vidsrc.net",
  "vidsrc.in",
  // alternate embeds
  "2embed.cc",
  "autoembed.co",
  // generic CDNs commonly used by streams
  "cloudfront.net",
  "akamaized.net",
  "akamaihd.net",
  "amazonaws.com",
  // IPTV & HLS hosts (allow all https for IPTV-org, behind a query flag)
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function isAllowedHost(hostname: string, allowAny: boolean): boolean {
  if (allowAny) return true;
  return ALLOWED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

function buildProxyUrl(reqUrl: URL, target: string, allowAny: boolean): string {
  const proxied = new URL(`https://${reqUrl.hostname}/functions/v1/proxy`);
  if (allowAny) proxied.searchParams.set("any", "1");
  proxied.searchParams.set("url", target);
  return proxied.toString();
}

function resolveStreamUrl(value: string, base: URL): string {
  if (!value || value.startsWith("data:") || value.startsWith("blob:")) return value;
  return new URL(value, base).toString();
}

function rewriteHlsPlaylist(text: string, baseUrl: URL, reqUrl: URL, allowAny: boolean): string {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      if (trimmed.startsWith("#")) {
        return line.replace(/URI="([^"]+)"/g, (_match, uri) => {
          const resolved = resolveStreamUrl(uri, baseUrl);
          return `URI="${buildProxyUrl(reqUrl, resolved, allowAny)}"`;
        });
      }

      const resolved = resolveStreamUrl(trimmed, baseUrl);
      return buildProxyUrl(reqUrl, resolved, allowAny);
    })
    .join("\n");
}

function isHlsPlaylist(contentType: string, target: URL, sample: string): boolean {
  const ct = contentType.toLowerCase();
  const start = sample.trimStart().slice(0, 256).toLowerCase();
  if (
    start.startsWith("<!doctype") ||
    start.startsWith("<html") ||
    start.includes("<title>access denied") ||
    start.includes("<h1>access denied")
  ) {
    return false;
  }
  return (
    sample.trimStart().startsWith("#EXTM3U") ||
    ct.includes("mpegurl") ||
    ct.includes("application/vnd.apple") ||
    target.pathname.endsWith(".m3u8")
  );
}

function looksLikeAccessDeniedHtml(text: string): boolean {
  const start = text.trimStart().slice(0, 512).toLowerCase();
  return (
    start.startsWith("<!doctype") ||
    start.startsWith("<html") ||
    start.includes("access denied") ||
    start.includes("you don't have permission") ||
    start.includes("errors.edgesuite.net")
  );
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const reqUrl = new URL(req.url);
  const target = reqUrl.searchParams.get("url");
  // ?any=1 lets callers proxy anything (useful for IPTV M3U streams).
  const allowAny = reqUrl.searchParams.get("any") === "1";

  if (!target) {
    return new Response(
      JSON.stringify({ error: "Missing ?url= parameter" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid url" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!isAllowedHost(parsed.hostname, allowAny)) {
    return new Response(
      JSON.stringify({ error: "Domain not allowed", host: parsed.hostname }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const lowerPath = parsed.pathname.toLowerCase();
  const decodedLowerPath = safeDecode(lowerPath);
  const isM3u8 = lowerPath.endsWith(".m3u8") ||
    decodedLowerPath.includes(".m3u8") ||
    decodedLowerPath.includes("<html") ||
    decodedLowerPath.includes("access denied");
  const emptyPlaylist = "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-ENDLIST\n";
  const fallbackResponse = () => {
    if (isM3u8) {
      const h = new Headers(corsHeaders);
      h.set("content-type", "application/vnd.apple.mpegurl; charset=utf-8");
      h.set("cache-control", "no-store");
      return new Response(emptyPlaylist, { status: 200, headers: h });
    }
    return new Response(null, { status: 204, headers: corsHeaders });
  };

  try {
    const fwd = new Headers();
    const range = req.headers.get("Range");
    if (range) fwd.set("Range", range);
    fwd.set("User-Agent", UA);
    fwd.set("Referer", `${parsed.protocol}//${parsed.host}/`);

    const upstream = await fetch(target, {
      method: req.method === "HEAD" ? "HEAD" : "GET",
      headers: fwd,
      redirect: "follow",
    }).catch((err) => {
      console.warn("proxy upstream fetch failed:", parsed.hostname, err instanceof Error ? err.message : err);
      return null;
    });

    // Upstream network/DNS/cert failure → graceful fallback (never 5xx)
    if (!upstream) return fallbackResponse();

    // Upstream returned an error status (429/403/404/5xx) → fallback rather than
    // surfacing as a runtime error to the client.
    if (!upstream.ok && upstream.status !== 206) {
      try { await upstream.body?.cancel(); } catch { /* ignore */ }
      console.warn("proxy upstream non-ok:", upstream.status, parsed.hostname);
      return fallbackResponse();
    }

    const out = new Headers(corsHeaders);
    const passthrough = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "cache-control",
      "etag",
      "last-modified",
    ];
    for (const h of passthrough) {
      const v = upstream.headers.get(h);
      if (v) out.set(h, v);
    }
    if (!out.has("content-type")) out.set("content-type", "application/octet-stream");
    if (!out.has("cache-control")) out.set("cache-control", "public, max-age=600");

    if (req.method !== "HEAD") {
      const contentType = upstream.headers.get("content-type") || "";
      if (contentType.toLowerCase().includes("mpegurl") || isM3u8) {
        const text = await upstream.text();
        if (looksLikeAccessDeniedHtml(text)) {
          console.warn("proxy upstream returned html instead of hls:", parsed.hostname);
          return fallbackResponse();
        }
        if (isHlsPlaylist(contentType, parsed, text)) {
          out.set("content-type", "application/vnd.apple.mpegurl; charset=utf-8");
          out.delete("content-length");
          return new Response(rewriteHlsPlaylist(text, parsed, reqUrl, allowAny), {
            status: 200,
            headers: out,
          });
        }
      }
    }

    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch (err) {
    console.warn("proxy unexpected error:", err instanceof Error ? err.message : err);
    return fallbackResponse();
  }
});
