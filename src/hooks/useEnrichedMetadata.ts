import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EnrichedMetadata {
  synopsis: string;
  genres: string[];
  mood: string;
  rating: number;
  language: string[];
  cast: string[];
}

export function useEnrichedMetadata(
  title: string | undefined,
  channel: string | undefined,
  views: number | undefined,
  duration: number | undefined,
  enabled = true
) {
  const [metadata, setMetadata] = useState<EnrichedMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !title) return;

    setLoading(true);
    setError(null);

    supabase.functions
      .invoke("enrich-metadata", {
        body: { title, channel, views, duration },
      })
      .then(({ data, error: fnError }) => {
        if (fnError) {
          setError(fnError.message);
        } else if (data?.error) {
          setError(data.error);
        } else {
          setMetadata(data as EnrichedMetadata);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to enrich metadata");
        setLoading(false);
      });
  }, [title, channel, views, duration, enabled]);

  return { metadata, loading, error };
}
