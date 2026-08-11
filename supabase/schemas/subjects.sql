-- Schema definition for public.subjects

CREATE TABLE IF NOT EXISTS public.subjects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_tracker_id uuid NOT NULL REFERENCES public.exam_trackers(id) ON DELETE CASCADE,
    name text NOT NULL,
    position integer DEFAULT 0 NOT NULL,
    color text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT subjects_id_exam_key UNIQUE (id, exam_tracker_id)
);

CREATE INDEX IF NOT EXISTS idx_subjects_exam_id ON public.subjects(exam_tracker_id, position);

DROP TRIGGER IF EXISTS set_subjects_updated_at ON public.subjects;
CREATE TRIGGER set_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DATA API PERMISSIONS & ROW LEVEL SECURITY
GRANT ALL ON TABLE public.subjects TO anon, authenticated, service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own subjects" ON public.subjects;
CREATE POLICY "Users manage own subjects"
  ON public.subjects FOR ALL TO authenticated
  USING (public.is_exam_owner(exam_tracker_id))
  WITH CHECK (public.is_exam_owner(exam_tracker_id));
