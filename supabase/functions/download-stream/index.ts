import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.private.coffee",
  "https://pipedapi.adminforge.de",
  "https://piapi.ggtyler.dev",
  "https://api.piped.yt",
  "https://pipedapi.r4fo.com",
  "https://pipedapi.moomoo.me",
  "https://pipedapi.darkness.services",
  "https://pipedapi.leptons.xyz",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get("videoId");
    const type = url.searchParams.get("type") || "audio";

    if (!videoId) {
      return new Response(JSON.stringify({ error: "Missing videoId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let streamData: any = null;
    let lastError = "";

    for (const instance of PIPED_INSTANCES) {
      try {
        const apiUrl = `${instance}/streams/${videoId}`;
        console.log(`Trying: ${apiUrl}`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(apiUrl, {
          headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          const hasAudio = data.audioStreams?.some((s: any) => s.url);
          const hasVideo = data.videoStreams?.some((s: any) => s.url);
          if (hasAudio || hasVideo) {
            streamData = data;
            console.log(`Got streams from ${instance} (audio: ${data.audioStreams?.length}, video: ${data.videoStreams?.length})`);
            break;
          }
          lastError = `${instance} returned empty streams`;
        } else {
          lastError = `${instance} returned ${res.status}`;
        }
      } catch (e) {
        lastError = `${instance} failed: ${e instanceof Error ? e.message : String(e)}`;
      }
    }

    if (!streamData) {
      return new Response(JSON.stringify({ error: "Failed to get stream info from any instance", details: lastError }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let selectedStream: any = null;
    const title = streamData.title || "download";

    if (type === "audio") {
      const audioStreams = (streamData.audioStreams || []).filter((s: any) => s.url);
      if (audioStreams.length > 0) {
        selectedStream = audioStreams.reduce((best: any, s: any) =>
          (s.bitrate || 0) > (best.bitrate || 0) ? s : best, audioStreams[0]);
      }
    } else {
      const muxedStreams = (streamData.videoStreams || []).filter((s: any) => s.url && s.videoOnly === false);
      if (muxedStreams.length > 0) {
        selectedStream = muxedStreams.reduce((best: any, s: any) =>
          (parseInt(s.quality) || 0) > (parseInt(best.quality) || 0) ? s : best, muxedStreams[0]);
      }
      if (!selectedStream) {
        const videoOnly = (streamData.videoStreams || []).filter((s: any) => s.url);
        if (videoOnly.length > 0) {
          selectedStream = videoOnly.reduce((best: any, s: any) =>
            (parseInt(s.quality) || 0) > (parseInt(best.quality) || 0) ? s : best, videoOnly[0]);
        }
      }
    }

    if (!selectedStream) {
      return new Response(JSON.stringify({
        error: `No ${type} streams available`,
        audioCount: streamData.audioStreams?.length || 0,
        videoCount: streamData.videoStreams?.length || 0,
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Selected: ${type} stream, quality=${selectedStream.quality || selectedStream.bitrate}, mimeType=${selectedStream.mimeType}`);

    const streamRes = await fetch(selectedStream.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "*/*",
        "Referer": "https://www.youtube.com/",
        "Origin": "https://www.youtube.com",
      },
    });

    if (!streamRes.ok) {
      return new Response(JSON.stringify({ error: "Stream fetch failed", status: streamRes.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ext = type === "audio" ? "m4a" : "mp4";
    const safeTitle = title.replace(/[^a-zA-Z0-9\s\-_]/g, "").trim().substring(0, 80);
    const filename = `${safeTitle || "download"}.${ext}`;

    return new Response(streamRes.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": selectedStream.mimeType || (type === "audio" ? "audio/mp4" : "video/mp4"),
        "Content-Disposition": `attachment; filename="${filename}"`,
        ...(streamRes.headers.get("content-length") ? { "Content-Length": streamRes.headers.get("content-length")! } : {}),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Download error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
