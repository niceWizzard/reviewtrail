"use server";

import { cacheLife, cacheTag, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { createClient, createStaticClient } from "@/src/lib/supabase/server";
import type { ExamTracker } from "@/src/lib/types/database";
import { TrackerDraft } from "../types/builder-draft";

export async function fetchExamTrackersAction(): Promise<ExamTracker[]> {
  const cookieStore = await cookies();
  return getCachedExamTrackers(cookieStore.toString());
}

async function getCachedExamTrackers(cookieString: string): Promise<ExamTracker[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("exam_trackers");

  const supabase = createStaticClient(cookieString);
  const { data, error } = await supabase
    .from("exam_trackers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as ExamTracker[]) || [];
}

export async function createExamTrackerAction(payload: {
  exam_name: string;
  exam_date?: string | null;
  description?: string | null;
}): Promise<ExamTracker> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User must be authenticated to create a tracker");
  }

  const { data, error } = await supabase
    .from("exam_trackers")
    .insert({
      user_id: user.id,
      exam_name: payload.exam_name,
      exam_date: payload.exam_date || null,
      description: payload.description || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  updateTag("exam_trackers");
  return data as ExamTracker;
}

export async function archiveExamTrackerAction(
  trackerId: string,
  isArchived = true
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exam_trackers")
    .update({ is_archived: isArchived })
    .eq("id", trackerId);

  if (error) {
    throw new Error(error.message);
  }

  updateTag("exam_trackers");
}

export async function deleteExamTrackerAction(trackerId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("exam_trackers").delete().eq("id", trackerId);

  if (error) {
    throw new Error(error.message);
  }

  updateTag("exam_trackers");
}

export async function commitExamTrackerDraftAction(
  draft: TrackerDraft
): Promise<ExamTracker> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User must be authenticated to save a tracker");
  }

  // Server-side validation
  const trimmedExamName = draft.examName.trim();
  if (!trimmedExamName) {
    throw new Error("Exam name is required.");
  }
  if (!draft.checklists || draft.checklists.length === 0) {
    throw new Error("Trackers must contain at least 1 section column.");
  }
  if (!draft.subjects || draft.subjects.length === 0) {
    throw new Error("At least 1 subject is required.");
  }
  if (!draft.topics || draft.topics.length === 0) {
    throw new Error("At least 1 topic is required.");
  }

  // Verify no empty chapters
  for (const ch of draft.chapters) {
    const hasTopics = draft.topics.some((t) => t.chapterTempId === ch.tempId);
    if (!hasTopics) {
      throw new Error(`Chapter "${ch.name}" has no topics. Empty chapters are not allowed.`);
    }
  }

  // Verify no empty subjects
  for (const sub of draft.subjects) {
    const hasTopics = draft.topics.some((t) => t.subjectTempId === sub.tempId);
    if (!hasTopics) {
      throw new Error(`Subject "${sub.name}" has no topics. Empty subjects are not allowed.`);
    }
  }

  // 1. Insert Exam Tracker
  const { data: tracker, error: trackerErr } = await supabase
    .from("exam_trackers")
    .insert({
      user_id: user.id,
      exam_name: trimmedExamName,
      exam_date: draft.examDate || null,
      description: draft.description ? draft.description.trim() : null,
    })
    .select()
    .single();

  if (trackerErr || !tracker) {
    throw new Error(trackerErr?.message || "Failed to create tracker");
  }

  // Clear trigger default checklists so we insert exact draft checklists
  await supabase.from("tracker_checklists").delete().eq("exam_tracker_id", tracker.id);

  // 2. Insert Checklists
  const checklistRows = draft.checklists.map((col, idx) => ({
    exam_tracker_id: tracker.id,
    name: col.name.trim(),
    position: idx + 1,
    color: col.color || null,
  }));
  const { error: colErr } = await supabase.from("tracker_checklists").insert(checklistRows);
  if (colErr) throw new Error(colErr.message);

  // 3. Insert Subjects & build tempId -> realId map
  const subjectMap = new Map<string, string>();
  for (let i = 0; i < draft.subjects.length; i++) {
    const sub = draft.subjects[i];
    const { data: insertedSub, error: subErr } = await supabase
      .from("subjects")
      .insert({
        exam_tracker_id: tracker.id,
        name: sub.name.trim(),
        position: i + 1,
        color: sub.color || null,
      })
      .select("id")
      .single();

    if (subErr || !insertedSub) throw new Error(subErr?.message || "Failed to insert subject");
    subjectMap.set(sub.tempId, insertedSub.id);
  }

  // 4. Insert Chapters & build tempId -> realId map
  const chapterMap = new Map<string, string>();
  for (let i = 0; i < draft.chapters.length; i++) {
    const ch = draft.chapters[i];
    const realSubId = subjectMap.get(ch.subjectTempId);
    if (!realSubId) continue;

    const { data: insertedCh, error: chErr } = await supabase
      .from("chapters")
      .insert({
        exam_tracker_id: tracker.id,
        subject_id: realSubId,
        name: ch.name.trim(),
        description: ch.description ? ch.description.trim() : null,
        position: i + 1,
      })
      .select("id")
      .single();

    if (chErr || !insertedCh) throw new Error(chErr?.message || "Failed to insert chapter");
    chapterMap.set(ch.tempId, insertedCh.id);
  }

  // 5. Insert Topics
  const topicRows = draft.topics.map((t, idx) => {
    const realSubId = subjectMap.get(t.subjectTempId);
    if (!realSubId) {
      throw new Error(`Topic "${t.name}" references an invalid subject.`);
    }
    const realChId = t.chapterTempId ? chapterMap.get(t.chapterTempId) || null : null;
    return {
      exam_tracker_id: tracker.id,
      subject_id: realSubId,
      chapter_id: realChId,
      name: t.name.trim(),
      position: idx + 1,
    };
  });

  if (topicRows.length > 0) {
    const { error: topicErr } = await supabase.from("topics").insert(topicRows);
    if (topicErr) throw new Error(topicErr.message);
  }

  updateTag("exam_trackers");
  updateTag(`workspace-${tracker.id}`);
  return tracker as ExamTracker;
}





