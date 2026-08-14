-- Declarative Schema definition for public.tracker_templates

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.tracker_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    category text DEFAULT 'Custom' NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    source_tracker_id uuid REFERENCES public.exam_trackers(id) ON DELETE SET NULL,
    structure jsonb NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tracker_templates_user_id ON public.tracker_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_tracker_templates_is_public ON public.tracker_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_tracker_templates_category ON public.tracker_templates(category);

DROP TRIGGER IF EXISTS set_tracker_templates_updated_at ON public.tracker_templates;
CREATE TRIGGER set_tracker_templates_updated_at
  BEFORE UPDATE ON public.tracker_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DATA API PERMISSIONS & ROW LEVEL SECURITY
GRANT ALL ON TABLE public.tracker_templates TO anon, authenticated, service_role;
ALTER TABLE public.tracker_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Select public and own templates" ON public.tracker_templates;
CREATE POLICY "Select public and own templates"
  ON public.tracker_templates FOR SELECT
  TO anon, authenticated
  USING (is_public = true OR user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own templates" ON public.tracker_templates;
CREATE POLICY "Users can insert own templates"
  ON public.tracker_templates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own templates" ON public.tracker_templates;
CREATE POLICY "Users can update own templates"
  ON public.tracker_templates FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own templates" ON public.tracker_templates;
CREATE POLICY "Users can delete own templates"
  ON public.tracker_templates FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));
