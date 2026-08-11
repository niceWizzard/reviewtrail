-- Schema definition for public.tracker_sections

CREATE TABLE IF NOT EXISTS public.tracker_sections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_tracker_id uuid NOT NULL REFERENCES public.exam_trackers(id) ON DELETE CASCADE,
    name text NOT NULL,
    position integer DEFAULT 0 NOT NULL,
    color text,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT tracker_sections_id_exam_key UNIQUE (id, exam_tracker_id)
);

CREATE INDEX IF NOT EXISTS idx_tracker_sections_exam ON public.tracker_sections(exam_tracker_id, position);

-- DEFAULT SECTIONS TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_exam_tracker()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.tracker_sections (exam_tracker_id, name, position)
  VALUES
    (NEW.id, '1st Read', 1),
    (NEW.id, 'Notes', 2),
    (NEW.id, 'Practice Qs', 3);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_exam_tracker_created ON public.exam_trackers;
CREATE TRIGGER on_exam_tracker_created
  AFTER INSERT ON public.exam_trackers
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_exam_tracker();

-- ROW LEVEL SECURITY
ALTER TABLE public.tracker_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own sections" ON public.tracker_sections;
CREATE POLICY "Users manage own sections"
  ON public.tracker_sections FOR ALL TO authenticated
  USING (public.is_exam_owner(exam_tracker_id))
  WITH CHECK (public.is_exam_owner(exam_tracker_id));
