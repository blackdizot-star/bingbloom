-- ============ LIKES: remove permissive public write policies ============
DROP POLICY IF EXISTS "Anyone can insert likes" ON public.likes;
DROP POLICY IF EXISTS "Anyone can update likes" ON public.likes;

-- Controlled like toggle: only +/-1, never below 0
CREATE OR REPLACE FUNCTION public.toggle_like(p_video_id text, p_delta int)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new integer;
BEGIN
  IF p_video_id IS NULL OR length(p_video_id) = 0 OR length(p_video_id) > 200 THEN
    RAISE EXCEPTION 'invalid video_id';
  END IF;
  IF p_delta NOT IN (-1, 1) THEN
    RAISE EXCEPTION 'invalid delta';
  END IF;

  INSERT INTO public.likes (video_id, count, updated_at)
  VALUES (p_video_id, GREATEST(0, p_delta), now())
  ON CONFLICT (video_id)
  DO UPDATE SET count = GREATEST(0, public.likes.count + p_delta), updated_at = now()
  RETURNING count INTO v_new;

  RETURN v_new;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_like(text, int) TO anon, authenticated;

-- ============ STREAM_SOURCES: remove permissive public write policies ============
DROP POLICY IF EXISTS "Anyone insert sources" ON public.stream_sources;
DROP POLICY IF EXISTS "Anyone update sources" ON public.stream_sources;

-- Controlled stream source recording with URL validation
CREATE OR REPLACE FUNCTION public.record_stream_source(
  p_tmdb_id text,
  p_media_type text,
  p_server text,
  p_url text,
  p_working boolean,
  p_season int DEFAULT NULL,
  p_episode int DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_tmdb_id IS NULL OR length(p_tmdb_id) = 0 OR length(p_tmdb_id) > 50 THEN
    RAISE EXCEPTION 'invalid tmdb_id';
  END IF;
  IF p_media_type NOT IN ('movie', 'tv') THEN
    RAISE EXCEPTION 'invalid media_type';
  END IF;
  IF p_server IS NULL OR length(p_server) = 0 OR length(p_server) > 50 THEN
    RAISE EXCEPTION 'invalid server';
  END IF;
  IF p_url IS NULL OR p_url !~ '^https?://' OR length(p_url) > 2000 THEN
    RAISE EXCEPTION 'invalid url';
  END IF;

  INSERT INTO public.stream_sources
    (tmdb_id, media_type, server, url, working, season, episode, verified_at)
  VALUES
    (p_tmdb_id, p_media_type, p_server, p_url, p_working, p_season, p_episode, now())
  ON CONFLICT (tmdb_id, media_type, COALESCE(season, -1), COALESCE(episode, -1), server)
  DO UPDATE SET url = EXCLUDED.url, working = EXCLUDED.working, verified_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_stream_source(text, text, text, text, boolean, int, int) TO anon, authenticated;