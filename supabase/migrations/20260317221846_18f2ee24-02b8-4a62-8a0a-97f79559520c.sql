
-- Add unique constraint on video_id for likes upsert
ALTER TABLE public.likes ADD CONSTRAINT likes_video_id_unique UNIQUE (video_id);
