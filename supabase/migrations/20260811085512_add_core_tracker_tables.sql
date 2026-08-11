-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE FUNCTION public.handle_new_exam_tracker()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
BEGIN
  INSERT INTO public.tracker_sections (exam_tracker_id, name, position)
  VALUES
    (NEW.id, '1st Read', 1),
    (NEW.id, 'Notes', 2),
    (NEW.id, 'Practice Qs', 3);
  RETURN NEW;
END;
$function$;

CREATE FUNCTION public.is_exam_owner (
  exam_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.exam_trackers
    WHERE id = exam_id AND user_id = (SELECT auth.uid())
  );
$function$;

CREATE FUNCTION public.update_updated_at_column()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE TABLE public.chapters (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  exam_tracker_id uuid                     NOT NULL,
  subject_id      uuid                     NOT NULL,
  name            text                     NOT NULL,
  description     text,
  "position"      integer                  DEFAULT 0 NOT NULL,
  created_at      timestamp with time zone DEFAULT now() NOT NULL,
  updated_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.chapters
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.chapters
  ADD CONSTRAINT chapters_id_exam_key UNIQUE (id, exam_tracker_id);

ALTER TABLE public.chapters
  ADD CONSTRAINT chapters_pkey PRIMARY KEY (id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.chapters TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.chapters TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.chapters TO service_role;

CREATE INDEX idx_chapters_exam_id ON public.chapters (exam_tracker_id);

CREATE INDEX idx_chapters_subject_id ON public.chapters (subject_id, "position");

CREATE TRIGGER set_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users manage own chapters" ON public.chapters
  TO authenticated
  USING (public.is_exam_owner(exam_tracker_id))
  WITH CHECK (public.is_exam_owner(exam_tracker_id));

CREATE TABLE public.exam_trackers (
  id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id     uuid                     NOT NULL,
  exam_name   text                     NOT NULL,
  exam_date   date,
  description text,
  is_archived boolean                  DEFAULT false NOT NULL,
  created_at  timestamp with time zone DEFAULT now() NOT NULL,
  updated_at  timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.exam_trackers
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.exam_trackers
  ADD CONSTRAINT exam_trackers_pkey PRIMARY KEY (id);

ALTER TABLE public.chapters
  ADD CONSTRAINT chapters_exam_tracker_id_fkey FOREIGN KEY (exam_tracker_id) REFERENCES public.exam_trackers(id) ON DELETE CASCADE;

ALTER TABLE public.exam_trackers
  ADD CONSTRAINT exam_trackers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.exam_trackers TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.exam_trackers TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.exam_trackers TO service_role;

CREATE INDEX idx_exam_trackers_user_id ON public.exam_trackers (user_id);

CREATE TRIGGER on_exam_tracker_created
  AFTER INSERT ON public.exam_trackers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_exam_tracker();

CREATE TRIGGER set_exam_trackers_updated_at
  BEFORE UPDATE ON public.exam_trackers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users manage own exam trackers" ON public.exam_trackers
  TO authenticated
  USING ((user_id = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE TABLE public.subjects (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  exam_tracker_id uuid                     NOT NULL,
  name            text                     NOT NULL,
  "position"      integer                  DEFAULT 0 NOT NULL,
  color           text,
  created_at      timestamp with time zone DEFAULT now() NOT NULL,
  updated_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.subjects
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.subjects
  ADD CONSTRAINT subjects_exam_tracker_id_fkey FOREIGN KEY (exam_tracker_id) REFERENCES public.exam_trackers(id) ON DELETE CASCADE;

ALTER TABLE public.subjects
  ADD CONSTRAINT subjects_id_exam_key UNIQUE (id, exam_tracker_id);

ALTER TABLE public.chapters
  ADD CONSTRAINT fk_chapters_subject_exam FOREIGN KEY (subject_id, exam_tracker_id) REFERENCES public.subjects(id, exam_tracker_id) ON DELETE CASCADE;

ALTER TABLE public.subjects
  ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.subjects TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.subjects TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.subjects TO service_role;

CREATE INDEX idx_subjects_exam_id ON public.subjects (exam_tracker_id, "position");

CREATE TRIGGER set_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users manage own subjects" ON public.subjects
  TO authenticated
  USING (public.is_exam_owner(exam_tracker_id))
  WITH CHECK (public.is_exam_owner(exam_tracker_id));

CREATE TABLE public.topic_section_progress (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  exam_tracker_id uuid                     NOT NULL,
  topic_id        uuid                     NOT NULL,
  section_id      uuid                     NOT NULL,
  is_completed    boolean                  DEFAULT false NOT NULL,
  completed_at    timestamp with time zone,
  notes           text,
  created_at      timestamp with time zone DEFAULT now() NOT NULL,
  updated_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.topic_section_progress
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.topic_section_progress
  ADD CONSTRAINT topic_section_progress_exam_tracker_id_fkey FOREIGN KEY (exam_tracker_id) REFERENCES public.exam_trackers(id) ON DELETE CASCADE;

ALTER TABLE public.topic_section_progress
  ADD CONSTRAINT topic_section_progress_pkey PRIMARY KEY (id);

ALTER TABLE public.topic_section_progress
  ADD CONSTRAINT topic_section_progress_unique UNIQUE (topic_id, section_id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.topic_section_progress TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.topic_section_progress TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.topic_section_progress TO service_role;

CREATE INDEX idx_topic_section_progress_topic ON public.topic_section_progress (topic_id);

CREATE INDEX idx_topic_section_progress_exam ON public.topic_section_progress (exam_tracker_id);

CREATE INDEX idx_topic_section_progress_section ON public.topic_section_progress (section_id);

CREATE TRIGGER set_topic_section_progress_updated_at
  BEFORE UPDATE ON public.topic_section_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users manage own topic progress" ON public.topic_section_progress
  TO authenticated
  USING (public.is_exam_owner(exam_tracker_id))
  WITH CHECK (public.is_exam_owner(exam_tracker_id));

CREATE TABLE public.topics (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  exam_tracker_id uuid                     NOT NULL,
  subject_id      uuid                     NOT NULL,
  chapter_id      uuid,
  name            text                     NOT NULL,
  "position"      integer                  DEFAULT 0 NOT NULL,
  created_at      timestamp with time zone DEFAULT now() NOT NULL,
  updated_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.topics
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.topics
  ADD CONSTRAINT fk_topics_chapter_exam FOREIGN KEY (chapter_id, exam_tracker_id) REFERENCES public.chapters(id, exam_tracker_id) ON DELETE SET NULL;

ALTER TABLE public.topics
  ADD CONSTRAINT fk_topics_subject_exam FOREIGN KEY (subject_id, exam_tracker_id) REFERENCES public.subjects(id, exam_tracker_id) ON DELETE CASCADE;

ALTER TABLE public.topics
  ADD CONSTRAINT topics_exam_tracker_id_fkey FOREIGN KEY (exam_tracker_id) REFERENCES public.exam_trackers(id) ON DELETE CASCADE;

ALTER TABLE public.topics
  ADD CONSTRAINT topics_id_exam_key UNIQUE (id, exam_tracker_id);

ALTER TABLE public.topic_section_progress
  ADD CONSTRAINT fk_progress_topic_exam FOREIGN KEY (topic_id, exam_tracker_id) REFERENCES public.topics(id, exam_tracker_id) ON DELETE CASCADE;

ALTER TABLE public.topics
  ADD CONSTRAINT topics_pkey PRIMARY KEY (id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.topics TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.topics TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.topics TO service_role;

CREATE INDEX idx_topics_exam_tracker_id ON public.topics (exam_tracker_id, "position");

CREATE INDEX idx_topics_subject_id ON public.topics (subject_id, "position");

CREATE INDEX idx_topics_chapter_id ON public.topics (chapter_id)
  WHERE chapter_id IS NOT NULL;

CREATE TRIGGER set_topics_updated_at
  BEFORE UPDATE ON public.topics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users manage own topics" ON public.topics
  TO authenticated
  USING (public.is_exam_owner(exam_tracker_id))
  WITH CHECK (public.is_exam_owner(exam_tracker_id));

CREATE TABLE public.tracker_sections (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  exam_tracker_id uuid                     NOT NULL,
  name            text                     NOT NULL,
  "position"      integer                  DEFAULT 0 NOT NULL,
  color           text,
  created_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.tracker_sections
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tracker_sections
  ADD CONSTRAINT tracker_sections_exam_tracker_id_fkey FOREIGN KEY (exam_tracker_id) REFERENCES public.exam_trackers(id) ON DELETE CASCADE;

ALTER TABLE public.tracker_sections
  ADD CONSTRAINT tracker_sections_id_exam_key UNIQUE (id, exam_tracker_id);

ALTER TABLE public.topic_section_progress
  ADD CONSTRAINT fk_progress_section_exam FOREIGN KEY (section_id, exam_tracker_id) REFERENCES public.tracker_sections(id, exam_tracker_id) ON DELETE CASCADE;

ALTER TABLE public.tracker_sections
  ADD CONSTRAINT tracker_sections_pkey PRIMARY KEY (id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.tracker_sections TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.tracker_sections TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.tracker_sections TO service_role;

CREATE INDEX idx_tracker_sections_exam ON public.tracker_sections (exam_tracker_id, "position");

CREATE POLICY "Users manage own sections" ON public.tracker_sections
  TO authenticated
  USING (public.is_exam_owner(exam_tracker_id))
  WITH CHECK (public.is_exam_owner(exam_tracker_id));