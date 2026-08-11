-- Schema definition for public.chapters

CREATE TABLE IF NOT EXISTS public.chapters (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_tracker_id uuid NOT NULL REFERENCES public.exam_trackers(id) ON DELETE CASCADE,
    subject_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    position integer DEFAULT 0 NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT fk_chapters_subject_exam FOREIGN KEY (subject_id, exam_tracker_id)
      REFERENCES public.subjects(id, exam_tracker_id) ON DELETE CASCADE,
    CONSTRAINT chapters_id_exam_key UNIQUE (id, exam_tracker_id)
);

CREATE INDEX IF NOT EXISTS idx_chapters_exam_id ON public.chapters(exam_tracker_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON public.chapters(subject_id, position);

DROP TRIGGER IF EXISTS set_chapters_updated_at ON public.chapters;
CREATE TRIGGER set_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ROW LEVEL SECURITY
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own chapters" ON public.chapters;
CREATE POLICY "Users manage own chapters"
  ON public.chapters FOR ALL TO authenticated
  USING (public.is_exam_owner(exam_tracker_id))
  WITH CHECK (public.is_exam_owner(exam_tracker_id));
