-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

GRANT DELETE, INSERT, SELECT, UPDATE ON public.chapters TO anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.chapters TO authenticated;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.chapters TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.exam_trackers TO anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.exam_trackers TO authenticated;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.exam_trackers TO service_role;

ALTER TABLE public.profiles
  ENABLE ROW LEVEL SECURITY;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.profiles TO anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.profiles TO authenticated;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.profiles TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.subjects TO anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.subjects TO authenticated;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.subjects TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.topic_section_progress TO anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.topic_section_progress TO authenticated;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.topic_section_progress TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.topics TO anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.topics TO authenticated;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.topics TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.tracker_sections TO anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.tracker_sections TO authenticated;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.tracker_sections TO service_role;