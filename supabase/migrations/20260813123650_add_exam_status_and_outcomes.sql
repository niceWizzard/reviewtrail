-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

ALTER TABLE public.exam_trackers
  ADD COLUMN status text DEFAULT 'in_progress'::text NOT NULL;

ALTER TABLE public.exam_trackers
  ADD CONSTRAINT exam_trackers_status_check CHECK (status = ANY (ARRAY['in_progress'::text, 'taken_waiting_results'::text, 'passed'::text, 'retaking'::text, 'postponed'::text]));

ALTER TABLE public.exam_trackers
  ADD COLUMN outcome_logged_at timestamp with time zone;

ALTER TABLE public.exam_trackers
  ADD COLUMN retake_count integer DEFAULT 0 NOT NULL;