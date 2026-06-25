CREATE TABLE public.stream_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie','tv')),
  season int,
  episode int,
  server text NOT NULL,
  url text NOT NULL,
  working boolean NOT NULL DEFAULT true,
  verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX stream_sources_unique
  ON public.stream_sources (tmdb_id, media_type, COALESCE(season,-1), COALESCE(episode,-1), server);
GRANT SELECT, INSERT, UPDATE ON public.stream_sources TO anon, authenticated;
GRANT ALL ON public.stream_sources TO service_role;
ALTER TABLE public.stream_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read sources" ON public.stream_sources FOR SELECT USING (true);
CREATE POLICY "Anyone insert sources" ON public.stream_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone update sources" ON public.stream_sources FOR UPDATE USING (true) WITH CHECK (true);