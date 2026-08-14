-- Declarative Schema definition for public.tracker_template_uses

CREATE TABLE IF NOT EXISTS public.tracker_template_uses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id uuid NOT NULL REFERENCES public.tracker_templates(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_tracker_id uuid REFERENCES public.exam_trackers(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tracker_template_uses_template_id ON public.tracker_template_uses(template_id);
CREATE INDEX IF NOT EXISTS idx_tracker_template_uses_user_id ON public.tracker_template_uses(user_id);

-- DATA API PERMISSIONS & ROW LEVEL SECURITY
GRANT ALL ON TABLE public.tracker_template_uses TO anon, authenticated, service_role;
ALTER TABLE public.tracker_template_uses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view template uses for accessible templates" ON public.tracker_template_uses;
CREATE POLICY "Users can view template uses for accessible templates"
  ON public.tracker_template_uses FOR SELECT
  TO anon, authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.tracker_templates t
      WHERE t.id = template_id AND t.is_public = true
    )
  );

DROP POLICY IF EXISTS "Authenticated users can insert template uses" ON public.tracker_template_uses;
CREATE POLICY "Authenticated users can insert template uses"
  ON public.tracker_template_uses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
