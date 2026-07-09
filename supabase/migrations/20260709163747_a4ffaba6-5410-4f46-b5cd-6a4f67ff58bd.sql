
-- 1) Comments: require authenticated users and tie rows to owners
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;

CREATE POLICY "Authenticated users can read comments"
ON public.comments FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert own comments"
ON public.comments FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND char_length(comment_text) BETWEEN 1 AND 5000
  AND char_length(COALESCE(author_name,'')) BETWEEN 1 AND 100
  AND char_length(video_id) BETWEEN 1 AND 200
);

CREATE POLICY "Users can update own comments"
ON public.comments FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.comments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

REVOKE ALL ON public.comments FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;

-- 2) Storage: scope uploads bucket to per-user folder (auth.uid() as first path segment)
DROP POLICY IF EXISTS "Users can read own upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own upload files" ON storage.objects;

CREATE POLICY "Users can read own upload files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own upload files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own upload files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
