-- Schema definition for public.topics

CREATE TABLE IF NOT EXISTS public.topics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_tracker_id uuid NOT NULL REFERENCES public.exam_trackers(id) ON DELETE CASCADE,
    subject_id uuid NOT NULL,
    chapter_id uuid,
    name text NOT NULL,
    position integer DEFAULT 0 NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT fk_topics_subject_exam FOREIGN KEY (subject_id, exam_tracker_id)
      REFERENCES public.subjects(id, exam_tracker_id) ON DELETE CASCADE,
    CONSTRAINT fk_topics_chapter_exam FOREIGN KEY (chapter_id, exam_tracker_id)
      REFERENCES public.chapters(id, exam_tracker_id) ON DELETE SET NULL,
    CONSTRAINT topics_id_exam_key UNIQUE (id, exam_tracker_id)
);

CREATE INDEX IF NOT EXISTS idx_topics_exam_tracker_id ON public.topics(exam_tracker_id, position);
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON public.topics(subject_id, position);
CREATE INDEX IF NOT EXISTS idx_topics_chapter_id ON public.topics(chapter_id) WHERE chapter_id IS NOT NULL;

DROP TRIGGER IF EXISTS set_topics_updated_at ON public.topics;
CREATE TRIGGER set_topics_updated_at
  BEFORE UPDATE ON public.topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ROW LEVEL SECURITY
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own topics" ON public.topics;
CREATE POLICY "Users manage own topics"
  ON public.topics FOR ALL TO authenticated
  USING (public.is_exam_owner(exam_tracker_id))
  WITH CHECK (public.is_exam_owner(exam_tracker_id));
