"use server";

import { updateTag } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import type { TrackerChecklist, Subject, Chapter, Topic } from "@/src/lib/types/database";

export async function createTrackerChecklistAction(payload: {
  exam_tracker_id: string;
  name: string;
  position?: number;
  color?: string | null;
}): Promise<TrackerChecklist> {
  const supabase = await createClient();
  const trimmedName = payload.name.trim();
  if (!trimmedName) {
    throw new Error("Checklist column name cannot be empty.");
  }

  // Validate existing checklist count and duplicates
  const { data: existingChecklists, error: fetchErr } = await supabase
    .from("tracker_checklists")
    .select("id, name, position")
    .eq("exam_tracker_id", payload.exam_tracker_id)
    .order("position", { ascending: true });

  if (fetchErr) throw new Error(fetchErr.message);

  const currentCount = existingChecklists?.length || 0;
  if (currentCount >= 10) {
    throw new Error("Maximum limit of 10 checklist columns reached.");
  }

  if (existingChecklists?.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error(`A checklist column named "${trimmedName}" already exists.`);
  }

  const nextPosition = payload.position ?? currentCount + 1;

  const { data, error } = await supabase
    .from("tracker_checklists")
    .insert({
      exam_tracker_id: payload.exam_tracker_id,
      name: trimmedName,
      position: nextPosition,
      color: payload.color || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  updateTag(`workspace-${payload.exam_tracker_id}`);
  return data as TrackerChecklist;
}

export async function clearTrackerChecklistsAction(examTrackerId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tracker_checklists")
    .delete()
    .eq("exam_tracker_id", examTrackerId);

  if (error) throw new Error(error.message);
  updateTag(`workspace-${examTrackerId}`);
}

export async function createSubjectAction(payload: {
  exam_tracker_id: string;
  name: string;
  position?: number;
  color?: string | null;
}): Promise<Subject> {
  const supabase = await createClient();
  const trimmedName = payload.name.trim();
  if (!trimmedName) {
    throw new Error("Subject name cannot be empty.");
  }

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      exam_tracker_id: payload.exam_tracker_id,
      name: trimmedName,
      position: payload.position ?? 0,
      color: payload.color || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  updateTag(`workspace-${payload.exam_tracker_id}`);
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
  const trimmedName = payload.name.trim();
  if (!trimmedName) {
    throw new Error("Chapter name cannot be empty.");
  }

  const { data, error } = await supabase
    .from("chapters")
    .insert({
      exam_tracker_id: payload.exam_tracker_id,
      subject_id: payload.subject_id,
      name: trimmedName,
      description: payload.description ? payload.description.trim() : null,
      position: payload.position ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  updateTag(`workspace-${payload.exam_tracker_id}`);
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
  const trimmedName = payload.name.trim();
  if (!trimmedName) {
    throw new Error("Topic name cannot be empty.");
  }

  const { data, error } = await supabase
    .from("topics")
    .insert({
      exam_tracker_id: payload.exam_tracker_id,
      subject_id: payload.subject_id,
      chapter_id: payload.chapter_id || null,
      name: trimmedName,
      position: payload.position ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  updateTag(`workspace-${payload.exam_tracker_id}`);
  return data as Topic;
}

export async function deleteTopicAction(topicId: string): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("topics")
    .select("exam_tracker_id, chapter_id")
    .eq("id", topicId)
    .single();

  const { error } = await supabase.from("topics").delete().eq("id", topicId);
  if (error) throw new Error(error.message);

  // Auto-cleanup empty chapter if deleting this topic left the chapter empty
  if (data?.chapter_id) {
    const { count } = await supabase
      .from("topics")
      .select("id", { count: "exact", head: true })
      .eq("chapter_id", data.chapter_id);

    if (count === 0) {
      await supabase.from("chapters").delete().eq("id", data.chapter_id);
    }
  }

  if (data?.exam_tracker_id) {
    updateTag(`workspace-${data.exam_tracker_id}`);
  }
  updateTag("exam_trackers");
}

export async function deleteSubjectAction(subjectId: string): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("exam_tracker_id")
    .eq("id", subjectId)
    .single();

  const { error } = await supabase.from("subjects").delete().eq("id", subjectId);
  if (error) throw new Error(error.message);
  if (data?.exam_tracker_id) {
    updateTag(`workspace-${data.exam_tracker_id}`);
  }
  updateTag("exam_trackers");
}

export async function deleteTrackerChecklistAction(checklistId: string): Promise<void> {
  const supabase = await createClient();
  const { data: targetItem } = await supabase
    .from("tracker_checklists")
    .select("exam_tracker_id")
    .eq("id", checklistId)
    .single();

  if (!targetItem) throw new Error("Checklist column not found.");

  // Check remaining checklist column count
  const { count } = await supabase
    .from("tracker_checklists")
    .select("id", { count: "exact", head: true })
    .eq("exam_tracker_id", targetItem.exam_tracker_id);

  if ((count || 0) <= 1) {
    throw new Error("Trackers must maintain at least 1 section column.");
  }

  const { error } = await supabase.from("tracker_checklists").delete().eq("id", checklistId);
  if (error) throw new Error(error.message);
  updateTag(`workspace-${targetItem.exam_tracker_id}`);
  updateTag("exam_trackers");
}

export async function deleteChapterAction(chapterId: string): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chapters")
    .select("exam_tracker_id")
    .eq("id", chapterId)
    .single();

  const { error } = await supabase.from("chapters").delete().eq("id", chapterId);
  if (error) throw new Error(error.message);
  if (data?.exam_tracker_id) {
    updateTag(`workspace-${data.exam_tracker_id}`);
  }
  updateTag("exam_trackers");
}

export async function updateTopicChapterAction(payload: {
  topicId: string;
  chapterId: string | null;
  subjectId?: string;
}): Promise<void> {
  const supabase = await createClient();

  let targetSubjectId = payload.subjectId;
  if (payload.chapterId) {
    const { data: chapterData } = await supabase
      .from("chapters")
      .select("subject_id")
      .eq("id", payload.chapterId)
      .single();

    if (chapterData?.subject_id) {
      targetSubjectId = chapterData.subject_id;
    }
  }

  const updateData: { chapter_id: string | null; subject_id?: string } = {
    chapter_id: payload.chapterId,
  };
  if (targetSubjectId) {
    updateData.subject_id = targetSubjectId;
  }

  const { data, error } = await supabase
    .from("topics")
    .update(updateData)
    .eq("id", payload.topicId)
    .select("exam_tracker_id")
    .single();

  if (error) throw new Error(error.message);
  if (data?.exam_tracker_id) {
    updateTag(`workspace-${data.exam_tracker_id}`);
  }
}

export async function updateSubjectAction(payload: {
  subjectId: string;
  name: string;
  color?: string | null;
}): Promise<Subject> {
  const supabase = await createClient();
  const trimmedName = payload.name.trim();
  if (!trimmedName) {
    throw new Error("Subject name cannot be empty.");
  }

  const { data: currentSubject } = await supabase
    .from("subjects")
    .select("exam_tracker_id")
    .eq("id", payload.subjectId)
    .single();

  if (!currentSubject) throw new Error("Subject not found.");

  const { data: existingSubs } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("exam_tracker_id", currentSubject.exam_tracker_id)
    .neq("id", payload.subjectId);

  if (existingSubs?.some((s) => s.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error(`A subject named "${trimmedName}" already exists.`);
  }

  const updateFields: { name: string; color?: string | null } = { name: trimmedName };
  if (payload.color !== undefined) updateFields.color = payload.color;

  const { data, error } = await supabase
    .from("subjects")
    .update(updateFields)
    .eq("id", payload.subjectId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  updateTag(`workspace-${currentSubject.exam_tracker_id}`);
  return data as Subject;
}

export async function updateChapterAction(payload: {
  chapterId: string;
  name: string;
  description?: string | null;
}): Promise<Chapter> {
  const supabase = await createClient();
  const trimmedName = payload.name.trim();
  if (!trimmedName) {
    throw new Error("Chapter name cannot be empty.");
  }

  const { data: currentChapter } = await supabase
    .from("chapters")
    .select("exam_tracker_id, subject_id")
    .eq("id", payload.chapterId)
    .single();

  if (!currentChapter) throw new Error("Chapter not found.");

  const { data: existingChapters } = await supabase
    .from("chapters")
    .select("id, name")
    .eq("subject_id", currentChapter.subject_id)
    .neq("id", payload.chapterId);

  if (existingChapters?.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error(`A chapter named "${trimmedName}" already exists in this subject.`);
  }

  const updateFields: { name: string; description?: string | null } = { name: trimmedName };
  if (payload.description !== undefined) {
    updateFields.description = payload.description ? payload.description.trim() : null;
  }

  const { data, error } = await supabase
    .from("chapters")
    .update(updateFields)
    .eq("id", payload.chapterId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  updateTag(`workspace-${currentChapter.exam_tracker_id}`);
  return data as Chapter;
}

export async function updateTopicAction(payload: {
  topicId: string;
  name: string;
}): Promise<Topic> {
  const supabase = await createClient();
  const trimmedName = payload.name.trim();
  if (!trimmedName) {
    throw new Error("Topic name cannot be empty.");
  }

  const { data, error } = await supabase
    .from("topics")
    .update({ name: trimmedName })
    .eq("id", payload.topicId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (data?.exam_tracker_id) {
    updateTag(`workspace-${data.exam_tracker_id}`);
  }
  return data as Topic;
}

export async function updateTrackerChecklistAction(payload: {
  checklistId: string;
  name: string;
  color?: string | null;
}): Promise<TrackerChecklist> {
  const supabase = await createClient();
  const trimmedName = payload.name.trim();
  if (!trimmedName) {
    throw new Error("Checklist column name cannot be empty.");
  }

  const { data: currentChecklist } = await supabase
    .from("tracker_checklists")
    .select("exam_tracker_id")
    .eq("id", payload.checklistId)
    .single();

  if (!currentChecklist) throw new Error("Checklist column not found.");

  const { data: existingChecklists } = await supabase
    .from("tracker_checklists")
    .select("id, name")
    .eq("exam_tracker_id", currentChecklist.exam_tracker_id)
    .neq("id", payload.checklistId);

  if (existingChecklists?.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error(`A checklist column named "${trimmedName}" already exists.`);
  }

  const updateFields: { name: string; color?: string | null } = { name: trimmedName };
  if (payload.color !== undefined) updateFields.color = payload.color;

  const { data, error } = await supabase
    .from("tracker_checklists")
    .update(updateFields)
    .eq("id", payload.checklistId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  updateTag(`workspace-${currentChecklist.exam_tracker_id}`);
  return data as TrackerChecklist;
}

