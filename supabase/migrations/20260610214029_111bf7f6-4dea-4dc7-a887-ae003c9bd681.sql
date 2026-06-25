
-- Likes table (per-video like counter)
CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL UNIQUE,
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.likes TO anon, authenticated;
GRANT ALL ON public.likes TO service_role;

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes" ON public.likes
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert likes" ON public.likes
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update likes" ON public.likes
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Comments table
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL,
  author_name text NOT NULL DEFAULT 'Anonymous',
  comment_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO anon, authenticated;
GRANT ALL ON public.comments TO service_role;

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.comments
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert comments" ON public.comments
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
