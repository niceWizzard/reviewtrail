import { createClient } from "@/src/lib/supabase/client";
import type { TopicSectionProgress } from "@/src/lib/types/database";

export interface UpsertProgressPayload {
  exam_tracker_id: string;
  topic_id: string;
  section_id: string;
  is_completed: boolean;
  notes?: string | null;
}

export async function upsertTopicProgress(
  payload: UpsertProgressPayload
): Promise<TopicSectionProgress> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("topic_section_progress")
    .upsert(
      {
        exam_tracker_id: payload.exam_tracker_id,
        topic_id: payload.topic_id,
        section_id: payload.section_id,
        is_completed: payload.is_completed,
        completed_at: payload.is_completed ? new Date().toISOString() : null,
        notes: payload.notes !== undefined ? payload.notes : null,
      },
      { onConflict: "topic_id,section_id" }
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TopicSectionProgress;
}

export async function updateProgressNotes(
  payload: Omit<UpsertProgressPayload, "is_completed"> & { notes: string }
): Promise<TopicSectionProgress> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("topic_section_progress")
    .upsert(
      {
        exam_tracker_id: payload.exam_tracker_id,
        topic_id: payload.topic_id,
        section_id: payload.section_id,
        notes: payload.notes,
      },
      { onConflict: "topic_id,section_id" }
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TopicSectionProgress;
}
