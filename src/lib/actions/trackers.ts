"use server";

import { cacheLife, cacheTag, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { createClient, createStaticClient } from "@/src/lib/supabase/server";
import type { ExamTracker } from "@/src/lib/types/database";

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




