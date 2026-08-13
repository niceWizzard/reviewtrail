export interface DraftChecklist {
  tempId: string;
  id?: string;
  name: string;
  position: number;
  color?: string | null;
}

export interface DraftSubject {
  tempId: string;
  id?: string;
  name: string;
  position: number;
  color?: string | null;
}

export interface DraftChapter {
  tempId: string;
  id?: string;
  subjectTempId: string;
  name: string;
  description?: string | null;
  position: number;
}

export interface DraftTopic {
  tempId: string;
  id?: string;
  subjectTempId: string;
  chapterTempId?: string | null;
  name: string;
  position: number;
}

export interface TrackerDraft {
  examName: string;
  examDate?: string | null;
  description?: string | null;
  checklists: DraftChecklist[];
  subjects: DraftSubject[];
  chapters: DraftChapter[];
  topics: DraftTopic[];
}

export interface DraftValidationError {
  field?: string;
  message: string;
}
