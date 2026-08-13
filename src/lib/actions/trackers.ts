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

function validateExamDateNotInPast(dateStr?: string | null) {
  if (!dateStr || !dateStr.trim()) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  if (isNaN(target.getTime()) || target < today) {
    throw new Error("Target exam date cannot be in the past.");
  }
}

export async function createExamTrackerAction(payload: {
  exam_name: string;
  exam_date?: string | null;
  description?: string | null;
}): Promise<ExamTracker> {
  validateExamDateNotInPast(payload.exam_date);

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
  validateExamDateNotInPast(draft.examDate);

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

export async function updateExamTrackerAction(payload: {
  trackerId: string;
  exam_name: string;
  exam_date?: string | null;
  description?: string | null;
}): Promise<ExamTracker> {
  validateExamDateNotInPast(payload.exam_date);

  const supabase = await createClient();
  const trimmedName = payload.exam_name.trim();
  if (!trimmedName) {
    throw new Error("Exam name cannot be empty.");
  }

  const { data, error } = await supabase
    .from("exam_trackers")
    .update({
      exam_name: trimmedName,
      exam_date: payload.exam_date || null,
      description: payload.description ? payload.description.trim() : null,
    })
    .eq("id", payload.trackerId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  updateTag("exam_trackers");
  updateTag(`workspace-${payload.trackerId}`);
  return data as ExamTracker;
}

export async function saveTrackerWorkspaceEditAction(payload: {
  trackerId: string;
  draft: TrackerDraft;
}): Promise<void> {
  const { trackerId, draft } = payload;
  validateExamDateNotInPast(draft.examDate);

  const supabase = await createClient();

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

  // 1. Update Exam Tracker Metadata
  const { error: trackerErr } = await supabase
    .from("exam_trackers")
    .update({
      exam_name: trimmedExamName,
      exam_date: draft.examDate || null,
      description: draft.description ? draft.description.trim() : null,
    })
    .eq("id", trackerId);

  if (trackerErr) {
    throw new Error(trackerErr.message);
  }

  // 2. Fetch existing DB items to calculate deletions
  const { data: dbCols } = await supabase.from("tracker_checklists").select("id").eq("exam_tracker_id", trackerId);
  const { data: dbSubs } = await supabase.from("subjects").select("id").eq("exam_tracker_id", trackerId);
  const { data: dbChs } = await supabase.from("chapters").select("id").eq("exam_tracker_id", trackerId);
  const { data: dbTops } = await supabase.from("topics").select("id").eq("exam_tracker_id", trackerId);

  const draftColIds = new Set(draft.checklists.map((c) => c.id).filter(Boolean));
  const draftSubIds = new Set(draft.subjects.map((s) => s.id).filter(Boolean));
  const draftChIds = new Set(draft.chapters.map((c) => c.id).filter(Boolean));
  const draftTopIds = new Set(draft.topics.map((t) => t.id).filter(Boolean));

  // Delete missing items in proper order
  const topsToDelete = (dbTops || []).map((t) => t.id).filter((id) => !draftTopIds.has(id));
  if (topsToDelete.length > 0) {
    await supabase.from("topics").delete().in("id", topsToDelete);
  }

  const chsToDelete = (dbChs || []).map((c) => c.id).filter((id) => !draftChIds.has(id));
  if (chsToDelete.length > 0) {
    await supabase.from("chapters").delete().in("id", chsToDelete);
  }

  const subsToDelete = (dbSubs || []).map((s) => s.id).filter((id) => !draftSubIds.has(id));
  if (subsToDelete.length > 0) {
    await supabase.from("subjects").delete().in("id", subsToDelete);
  }

  const colsToDelete = (dbCols || []).map((c) => c.id).filter((id) => !draftColIds.has(id));
  if (colsToDelete.length > 0) {
    await supabase.from("tracker_checklists").delete().in("id", colsToDelete);
  }

  // 3. Upsert / Sync Checklists
  for (let i = 0; i < draft.checklists.length; i++) {
    const col = draft.checklists[i];
    if (col.id) {
      await supabase
        .from("tracker_checklists")
        .update({ name: col.name.trim(), position: i + 1 })
        .eq("id", col.id);
    } else {
      await supabase.from("tracker_checklists").insert({
        exam_tracker_id: trackerId,
        name: col.name.trim(),
        position: i + 1,
      });
    }
  }

  // 4. Upsert / Sync Subjects & map tempId -> real ID
  const subjectMap = new Map<string, string>();
  for (let i = 0; i < draft.subjects.length; i++) {
    const sub = draft.subjects[i];
    if (sub.id) {
      await supabase
        .from("subjects")
        .update({ name: sub.name.trim(), position: i + 1 })
        .eq("id", sub.id);
      subjectMap.set(sub.tempId, sub.id);
      subjectMap.set(sub.id, sub.id);
    } else {
      const { data: insertedSub, error: subErr } = await supabase
        .from("subjects")
        .insert({
          exam_tracker_id: trackerId,
          name: sub.name.trim(),
          position: i + 1,
        })
        .select("id")
        .single();
      if (subErr || !insertedSub) throw new Error(subErr?.message || "Failed to insert subject");
      subjectMap.set(sub.tempId, insertedSub.id);
    }
  }

  // 5. Upsert / Sync Chapters & map tempId -> real ID
  const chapterMap = new Map<string, string>();
  for (let i = 0; i < draft.chapters.length; i++) {
    const ch = draft.chapters[i];
    const realSubId = subjectMap.get(ch.subjectTempId);
    if (!realSubId) continue;

    if (ch.id) {
      await supabase
        .from("chapters")
        .update({
          name: ch.name.trim(),
          description: ch.description ? ch.description.trim() : null,
          position: i + 1,
          subject_id: realSubId,
        })
        .eq("id", ch.id);
      chapterMap.set(ch.tempId, ch.id);
      chapterMap.set(ch.id, ch.id);
    } else {
      const { data: insertedCh, error: chErr } = await supabase
        .from("chapters")
        .insert({
          exam_tracker_id: trackerId,
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
  }

  // 6. Upsert / Sync Topics
  for (let i = 0; i < draft.topics.length; i++) {
    const t = draft.topics[i];
    const realSubId = subjectMap.get(t.subjectTempId);
    if (!realSubId) continue;
    const realChId = t.chapterTempId ? chapterMap.get(t.chapterTempId) || null : null;

    if (t.id) {
      await supabase
        .from("topics")
        .update({
          name: t.name.trim(),
          position: i + 1,
          subject_id: realSubId,
          chapter_id: realChId,
        })
        .eq("id", t.id);
    } else {
      await supabase.from("topics").insert({
        exam_tracker_id: trackerId,
        subject_id: realSubId,
        chapter_id: realChId,
        name: t.name.trim(),
        position: i + 1,
      });
    }
  }

  updateTag("exam_trackers");
  updateTag(`workspace-${trackerId}`);
}
