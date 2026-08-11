"use server";

import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import { createClient, createStaticClient } from "@/src/lib/supabase/server";
import type {
  ExamTracker,
  TrackerSection,
  Subject,
  Chapter,
  Topic,
  TopicSectionProgress,
  TrackerWorkspaceData,
  SubjectWithTree,
  ChapterWithTopics,
} from "@/src/lib/types/database";

export async function fetchTrackerWorkspaceAction(
  examTrackerId: string
): Promise<TrackerWorkspaceData> {
  const cookieStore = await cookies();
  return getCachedTrackerWorkspace(examTrackerId, cookieStore.toString());
}

async function getCachedTrackerWorkspace(
  examTrackerId: string,
  cookieString: string
): Promise<TrackerWorkspaceData> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`workspace-${examTrackerId}`);

  const supabase = createStaticClient(cookieString);



  const [trackerRes, sectionsRes, subjectsRes, chaptersRes, topicsRes, progressRes] =
    await Promise.all([
      supabase.from("exam_trackers").select("*").eq("id", examTrackerId).single(),
      supabase
        .from("tracker_sections")
        .select("*")
        .eq("exam_tracker_id", examTrackerId)
        .order("position"),
      supabase
        .from("subjects")
        .select("*")
        .eq("exam_tracker_id", examTrackerId)
        .order("position"),
      supabase
        .from("chapters")
        .select("*")
        .eq("exam_tracker_id", examTrackerId)
        .order("position"),
      supabase
        .from("topics")
        .select("*")
        .eq("exam_tracker_id", examTrackerId)
        .order("position"),
      supabase.from("topic_section_progress").select("*").eq("exam_tracker_id", examTrackerId),
    ]);

  if (trackerRes.error) {
    throw new Error(trackerRes.error.message);
  }

  const tracker = trackerRes.data as ExamTracker;
  const sections = (sectionsRes.data || []) as TrackerSection[];
  const subjects = (subjectsRes.data || []) as Subject[];
  const chapters = (chaptersRes.data || []) as Chapter[];
  const topics = (topicsRes.data || []) as Topic[];
  const progress = (progressRes.data || []) as TopicSectionProgress[];

  // Build hierarchical subject tree
  const subjectTree: SubjectWithTree[] = subjects.map((sub) => {
    const subChapters = chapters.filter((ch) => ch.subject_id === sub.id);

    const chaptersWithTopics: ChapterWithTopics[] = subChapters.map((ch) => ({
      ...ch,
      topics: topics.filter((t) => t.chapter_id === ch.id),
    }));

    const ungroupedTopics = topics.filter(
      (t) => t.subject_id === sub.id && (!t.chapter_id || t.chapter_id === null)
    );

    return {
      ...sub,
      chapters: chaptersWithTopics,
      ungroupedTopics,
    };
  });

  const totalTopics = topics.length;
  const totalCheckboxes = totalTopics * (sections.length || 1);
  const completedCheckboxes = progress.filter((p) => p.is_completed).length;
  const overallPercentage =
    totalCheckboxes > 0 ? Math.round((completedCheckboxes / totalCheckboxes) * 100) : 0;

  return {
    tracker,
    sections,
    subjects,
    chapters,
    topics,
    progress,
    subjectTree,
    stats: {
      totalTopics,
      completedCheckboxes,
      totalCheckboxes,
      overallPercentage,
    },
  };
}
