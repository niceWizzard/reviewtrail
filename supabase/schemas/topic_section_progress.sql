-- Schema definition for public.topic_section_progress

CREATE TABLE IF NOT EXISTS public.topic_section_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_tracker_id uuid NOT NULL REFERENCES public.exam_trackers(id) ON DELETE CASCADE,
    topic_id uuid NOT NULL,
    section_id uuid NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    completed_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT fk_progress_topic_exam FOREIGN KEY (topic_id, exam_tracker_id)
      REFERENCES public.topics(id, exam_tracker_id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_section_exam FOREIGN KEY (section_id, exam_tracker_id)
      REFERENCES public.tracker_sections(id, exam_tracker_id) ON DELETE CASCADE,
    CONSTRAINT topic_section_progress_unique UNIQUE (topic_id, section_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_section_progress_exam ON public.topic_section_progress(exam_tracker_id);
CREATE INDEX IF NOT EXISTS idx_topic_section_progress_topic ON public.topic_section_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_section_progress_section ON public.topic_section_progress(section_id);

DROP TRIGGER IF EXISTS set_topic_section_progress_updated_at ON public.topic_section_progress;
CREATE TRIGGER set_topic_section_progress_updated_at
  BEFORE UPDATE ON public.topic_section_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ROW LEVEL SECURITY
ALTER TABLE public.topic_section_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own topic progress" ON public.topic_section_progress;
CREATE POLICY "Users manage own topic progress"
  ON public.topic_section_progress FOR ALL TO authenticated
  USING (public.is_exam_owner(exam_tracker_id))
  WITH CHECK (public.is_exam_owner(exam_tracker_id));
