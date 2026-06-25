
-- Comments table for user-submitted comments on videos
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL,
  author_name text NOT NULL DEFAULT 'Anonymous',
  comment_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Anyone can read comments" ON public.comments
  FOR SELECT TO anon, authenticated USING (true);

-- Anyone can insert comments
CREATE POLICY "Anyone can insert comments" ON public.comments
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
