-- Schema definition for public.exam_trackers

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.exam_trackers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_name text NOT NULL,
    exam_date date,
    description text,
    is_archived boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exam_trackers_user_id ON public.exam_trackers(user_id);

DROP TRIGGER IF EXISTS set_exam_trackers_updated_at ON public.exam_trackers;
CREATE TRIGGER set_exam_trackers_updated_at
  BEFORE UPDATE ON public.exam_trackers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DATA API PERMISSIONS & ROW LEVEL SECURITY
GRANT ALL ON TABLE public.exam_trackers TO anon, authenticated, service_role;
ALTER TABLE public.exam_trackers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_exam_owner(exam_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.exam_trackers
    WHERE id = exam_id AND user_id = (SELECT auth.uid())
  );
$$;

DROP POLICY IF EXISTS "Users manage own exam trackers" ON public.exam_trackers;
CREATE POLICY "Users manage own exam trackers"
  ON public.exam_trackers FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
