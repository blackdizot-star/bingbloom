-- Lock down SECURITY DEFINER functions so they are not directly callable by anon/authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.toggle_like(text, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_like(text, int) TO service_role;

REVOKE EXECUTE ON FUNCTION public.record_stream_source(text, text, text, text, boolean, int, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_stream_source(text, text, text, text, boolean, int, int) TO service_role;

-- Replace the always-true comments INSERT policy with a validated one
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
CREATE POLICY "Anyone can insert comments" ON public.comments
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(comment_text) BETWEEN 1 AND 5000
    AND char_length(coalesce(author_name, '')) BETWEEN 1 AND 100
    AND char_length(video_id) BETWEEN 1 AND 200
  );