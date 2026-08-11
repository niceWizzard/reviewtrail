import { createClient } from "@/src/lib/supabase/client";
import type { ExamTracker } from "@/src/lib/types/database";

export async function fetchExamTrackers(): Promise<ExamTracker[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("exam_trackers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as ExamTracker[]) || [];
}
