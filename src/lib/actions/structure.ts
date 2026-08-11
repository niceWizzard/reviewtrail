"use server";

import { createClient } from "@/src/lib/supabase/server";
import type { TrackerSection, Subject, Chapter, Topic } from "@/src/lib/types/database";

export async function createTrackerSectionAction(payload: {
  exam_tracker_id: string;
  name: string;
  position?: number;
  color?: string | null;
}): Promise<TrackerSection> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracker_sections")
    .insert({
      exam_tracker_id: payload.exam_tracker_id,
      name: payload.name,
      position: payload.position ?? 0,
      color: payload.color || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as TrackerSection;
}

export async function createSubjectAction(payload: {
  exam_tracker_id: string;
  name: string;
  position?: number;
  color?: string | null;
}): Promise<Subject> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .insert({
      exam_tracker_id: payload.exam_tracker_id,
      name: payload.name,
      position: payload.position ?? 0,
      color: payload.color || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Subject;
}

export async function createChapterAction(payload: {
  exam_tracker_id: string;
  subject_id: string;
  name: string;
  description?: string | null;
  position?: number;
}): Promise<Chapter> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chapters")
    .insert({
      exam_tracker_id: payload.exam_tracker_id,
      subject_id: payload.subject_id,
      name: payload.name,
      description: payload.description || null,
      position: payload.position ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Chapter;
}

export async function createTopicAction(payload: {
  exam_tracker_id: string;
  subject_id: string;
  chapter_id?: string | null;
  name: string;
  position?: number;
}): Promise<Topic> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topics")
    .insert({
      exam_tracker_id: payload.exam_tracker_id,
      subject_id: payload.subject_id,
      chapter_id: payload.chapter_id || null,
      name: payload.name,
      position: payload.position ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Topic;
}

export async function deleteTopicAction(topicId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("topics").delete().eq("id", topicId);
  if (error) throw new Error(error.message);
}

export async function deleteSubjectAction(subjectId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("subjects").delete().eq("id", subjectId);
  if (error) throw new Error(error.message);
}

export async function deleteTrackerSectionAction(sectionId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("tracker_sections").delete().eq("id", sectionId);
  if (error) throw new Error(error.message);
}
