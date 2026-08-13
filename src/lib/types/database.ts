export type ExamStatus =
  | "in_progress"
  | "taken_waiting_results"
  | "passed"
  | "retaking"
  | "postponed";

export interface ExamTracker {
  id: string;
  user_id: string;
  exam_name: string;
  exam_date: string | null;
  description: string | null;
  is_archived: boolean;
  status: ExamStatus;
  outcome_logged_at: string | null;
  retake_count: number;
  created_at: string;
  updated_at: string;
}

export interface TrackerChecklist {
  id: string;
  exam_tracker_id: string;
  name: string;
  position: number;
  color: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  exam_tracker_id: string;
  name: string;
  position: number;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  exam_tracker_id: string;
  subject_id: string;
  name: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  exam_tracker_id: string;
  subject_id: string;
  chapter_id: string | null;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TopicSectionProgress {
  id: string;
  exam_tracker_id: string;
  topic_id: string;
  section_id: string;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChapterWithTopics extends Chapter {
  topics: Topic[];
}

export interface SubjectWithTree extends Subject {
  chapters: ChapterWithTopics[];
  ungroupedTopics: Topic[];
}

export interface TrackerWorkspaceData {
  tracker: ExamTracker;
  checklists: TrackerChecklist[];
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  progress: TopicSectionProgress[];
  subjectTree: SubjectWithTree[];
  stats: {
    totalTopics: number;
    completedCheckboxes: number;
    totalCheckboxes: number;
    overallPercentage: number;
  };
}
