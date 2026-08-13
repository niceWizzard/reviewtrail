"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import type {
  TrackerDraft,
  DraftChecklist,
  DraftSubject,
  DraftChapter,
  DraftTopic,
} from "@/src/lib/types/builder-draft";

const DEFAULT_CHECKLISTS: DraftChecklist[] = [
  { tempId: "default-col-1", name: "1st Read", position: 1 },
  { tempId: "default-col-2", name: "Notes", position: 2 },
  { tempId: "default-col-3", name: "Practice Qs", position: 3 },
];

const initialDraftState: TrackerDraft = {
  examName: "",
  examDate: null,
  description: null,
  checklists: DEFAULT_CHECKLISTS,
  subjects: [],
  chapters: [],
  topics: [],
};

type Action =
  | {
      type: "SET_EXAM_INFO";
      payload: {
        examName: string;
        examDate?: string | null;
        description?: string | null;
        prepopulateColumns?: boolean;
      };
    }
  | { type: "ADD_SUBJECT"; payload: { name: string } }
  | { type: "DELETE_SUBJECT"; payload: { tempId: string } }
  | { type: "ADD_CHAPTER"; payload: { subjectTempId: string; name: string; description?: string } }
  | { type: "DELETE_CHAPTER"; payload: { tempId: string } }
  | {
      type: "ADD_TOPIC";
      payload: { subjectTempId: string; chapterTempId?: string | null; name: string };
    }
  | { type: "DELETE_TOPIC"; payload: { tempId: string } }
  | { type: "ADD_CHECKLIST"; payload: { name: string } }
  | { type: "DELETE_CHECKLIST"; payload: { tempId: string } }
  | { type: "RENAME_SUBJECT"; payload: { tempId: string; name: string } }
  | { type: "RENAME_CHAPTER"; payload: { tempId: string; name: string } }
  | { type: "RENAME_TOPIC"; payload: { tempId: string; name: string } }
  | { type: "RENAME_CHECKLIST"; payload: { tempId: string; name: string } }
  | { type: "SET_DRAFT"; payload: TrackerDraft }
  | { type: "RESET_DRAFT" };

export function validateAddSubject(draft: TrackerDraft, name: string): string | null {
  const trimmedName = name.trim();
  if (!trimmedName) return "Subject name cannot be empty.";
  if (draft.subjects.some((s) => s.name.toLowerCase() === trimmedName.toLowerCase())) {
    return `A subject named "${trimmedName}" already exists.`;
  }
  return null;
}

export function validateRenameSubject(draft: TrackerDraft, tempId: string, name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Subject name cannot be empty.";
  if (
    draft.subjects.some(
      (s) =>
        (s.tempId !== tempId && (s as any).id !== tempId) &&
        s.name.toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    return `A subject named "${trimmed}" already exists.`;
  }
  return null;
}

export function validateAddChapter(draft: TrackerDraft, subjectTempId: string, name: string): string | null {
  const trimmedName = name.trim();
  if (!trimmedName || !subjectTempId) return "Chapter name and target subject are required.";
  const subChapters = draft.chapters.filter(
    (c) => c.subjectTempId === subjectTempId || (c as any).subject_id === subjectTempId
  );
  if (subChapters.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
    return `A chapter named "${trimmedName}" already exists in this subject.`;
  }
  return null;
}

export function validateRenameChapter(draft: TrackerDraft, tempId: string, name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Chapter name cannot be empty.";
  const targetCh = draft.chapters.find((c) => c.tempId === tempId || (c as any).id === tempId);
  if (!targetCh) return "Chapter not found.";
  const targetSubId = targetCh.subjectTempId || (targetCh as any).subject_id;
  if (
    draft.chapters.some(
      (c) =>
        (c.tempId !== tempId && (c as any).id !== tempId) &&
        (c.subjectTempId === targetSubId || (c as any).subject_id === targetSubId) &&
        c.name.toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    return `A chapter named "${trimmed}" already exists in this subject.`;
  }
  return null;
}

export function validateAddTopic(
  draft: TrackerDraft,
  subjectTempId: string,
  chapterTempId: string | null,
  name: string
): string | null {
  const trimmedName = name.trim();
  if (!trimmedName || !subjectTempId) return "Topic name and target subject are required.";
  const normalizedChapterId = chapterTempId || null;
  const groupTopics = draft.topics.filter(
    (t) =>
      (t.subjectTempId === subjectTempId || (t as any).subject_id === subjectTempId) &&
      ((t.chapterTempId || (t as any).chapter_id || null) === normalizedChapterId)
  );
  if (groupTopics.some((t) => t.name.toLowerCase() === trimmedName.toLowerCase())) {
    return `A topic named "${trimmedName}" already exists in this group.`;
  }
  return null;
}

export function validateRenameTopic(draft: TrackerDraft, tempId: string, name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Topic name cannot be empty.";
  const targetTopic = draft.topics.find((t) => t.tempId === tempId || (t as any).id === tempId);
  if (!targetTopic) return "Topic not found.";
  const targetSubId = targetTopic.subjectTempId || (targetTopic as any).subject_id;
  const targetChId = targetTopic.chapterTempId || (targetTopic as any).chapter_id || null;

  if (
    draft.topics.some(
      (t) =>
        (t.tempId !== tempId && (t as any).id !== tempId) &&
        (t.subjectTempId === targetSubId || (t as any).subject_id === targetSubId) &&
        ((t.chapterTempId || (t as any).chapter_id || null) === targetChId) &&
        t.name.toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    return `A topic named "${trimmed}" already exists in this group.`;
  }
  return null;
}

export function validateAddChecklist(draft: TrackerDraft, name: string): string | null {
  const trimmedName = name.trim();
  if (!trimmedName) return "Checklist column name cannot be empty.";
  if (draft.checklists.length >= 10) {
    return "Maximum limit of 10 checklist columns reached.";
  }
  if (draft.checklists.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
    return `A checklist column named "${trimmedName}" already exists.`;
  }
  return null;
}

export function validateRenameChecklist(draft: TrackerDraft, tempId: string, name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Checklist column name cannot be empty.";
  if (
    draft.checklists.some(
      (c) =>
        (c.tempId !== tempId && (c as any).id !== tempId) &&
        c.name.toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    return `A checklist column named "${trimmed}" already exists.`;
  }
  return null;
}

export function validateDeleteChecklist(draft: TrackerDraft): string | null {
  if (draft.checklists.length <= 1) {
    return "Trackers must maintain at least 1 checklist column.";
  }
  return null;
}

export function draftReducer(state: TrackerDraft, action: Action): TrackerDraft {
  switch (action.type) {
    case "SET_DRAFT": {
      return action.payload;
    }
    case "SET_EXAM_INFO": {
      const trimmedName = action.payload.examName.trim();
      const prepopulate = action.payload.prepopulateColumns !== false;
      return {
        ...state,
        examName: trimmedName,
        examDate: action.payload.examDate || null,
        description: action.payload.description ? action.payload.description.trim() : null,
        checklists: prepopulate ? state.checklists.length > 0 ? state.checklists : DEFAULT_CHECKLISTS : [],
      };
    }

    case "ADD_SUBJECT": {
      const trimmedName = action.payload.name.trim();
      if (!trimmedName) return state;

      if (state.subjects.some((s) => s.name.toLowerCase() === trimmedName.toLowerCase())) {
        return state;
      }

      const newSubject: DraftSubject = {
        tempId: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmedName,
        position: state.subjects.length + 1,
      };

      return {
        ...state,
        subjects: [...state.subjects, newSubject],
      };
    }

    case "RENAME_SUBJECT": {
      const trimmed = action.payload.name.trim();
      if (!trimmed) return state;
      if (
        state.subjects.some(
          (s) => s.tempId !== action.payload.tempId && s.name.toLowerCase() === trimmed.toLowerCase()
        )
      ) {
        return state;
      }
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.tempId === action.payload.tempId ? { ...s, name: trimmed } : s
        ),
      };
    }

    case "DELETE_SUBJECT": {
      const { tempId } = action.payload;
      const remainingSubjects = state.subjects.filter((s) => s.tempId !== tempId);
      const remainingChapters = state.chapters.filter((c) => c.subjectTempId !== tempId);
      const remainingTopics = state.topics.filter((t) => t.subjectTempId !== tempId);

      return {
        ...state,
        subjects: remainingSubjects,
        chapters: remainingChapters,
        topics: remainingTopics,
      };
    }

    case "ADD_CHAPTER": {
      const trimmedName = action.payload.name.trim();
      if (!trimmedName || !action.payload.subjectTempId) return state;

      const subChapters = state.chapters.filter(
        (c) => c.subjectTempId === action.payload.subjectTempId
      );

      if (subChapters.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
        return state;
      }

      const newChapter: DraftChapter = {
        tempId: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        subjectTempId: action.payload.subjectTempId,
        name: trimmedName,
        description: action.payload.description ? action.payload.description.trim() : null,
        position: subChapters.length + 1,
      };

      return {
        ...state,
        chapters: [...state.chapters, newChapter],
      };
    }

    case "RENAME_CHAPTER": {
      const trimmed = action.payload.name.trim();
      if (!trimmed) return state;
      const targetCh = state.chapters.find((c) => c.tempId === action.payload.tempId);
      if (!targetCh) return state;
      if (
        state.chapters.some(
          (c) =>
            c.tempId !== action.payload.tempId &&
            c.subjectTempId === targetCh.subjectTempId &&
            c.name.toLowerCase() === trimmed.toLowerCase()
        )
      ) {
        return state;
      }
      return {
        ...state,
        chapters: state.chapters.map((c) =>
          c.tempId === action.payload.tempId ? { ...c, name: trimmed } : c
        ),
      };
    }

    case "DELETE_CHAPTER": {
      const { tempId } = action.payload;
      const targetChapter = state.chapters.find((c) => c.tempId === tempId);
      if (!targetChapter) return state;

      const remainingChapters = state.chapters.filter((c) => c.tempId !== tempId);
      const remainingTopics = state.topics.filter((t) => t.chapterTempId !== tempId);

      return {
        ...state,
        chapters: remainingChapters,
        topics: remainingTopics,
      };
    }

    case "ADD_TOPIC": {
      const trimmedName = action.payload.name.trim();
      if (!trimmedName || !action.payload.subjectTempId) return state;

      const newTopic: DraftTopic = {
        tempId: `top-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        subjectTempId: action.payload.subjectTempId,
        chapterTempId: action.payload.chapterTempId || null,
        name: trimmedName,
        position: state.topics.length + 1,
      };

      return {
        ...state,
        topics: [...state.topics, newTopic],
      };
    }

    case "RENAME_TOPIC": {
      const trimmed = action.payload.name.trim();
      if (!trimmed) return state;
      const targetTopic = state.topics.find((t) => t.tempId === action.payload.tempId);
      if (!targetTopic) return state;

      if (
        state.topics.some(
          (t) =>
            t.tempId !== action.payload.tempId &&
            t.subjectTempId === targetTopic.subjectTempId &&
            (t.chapterTempId || null) === (targetTopic.chapterTempId || null) &&
            t.name.toLowerCase() === trimmed.toLowerCase()
        )
      ) {
        return state;
      }

      return {
        ...state,
        topics: state.topics.map((t) =>
          t.tempId === action.payload.tempId ? { ...t, name: trimmed } : t
        ),
      };
    }

    case "DELETE_TOPIC": {
      return {
        ...state,
        topics: state.topics.filter((t) => t.tempId !== action.payload.tempId),
      };
    }

    case "ADD_CHECKLIST": {
      const trimmedName = action.payload.name.trim();
      if (!trimmedName) return state;

      if (
        state.checklists.length >= 10 ||
        state.checklists.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())
      ) {
        return state;
      }

      const newChecklist: DraftChecklist = {
        tempId: `col-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmedName,
        position: state.checklists.length + 1,
      };

      return {
        ...state,
        checklists: [...state.checklists, newChecklist],
      };
    }

    case "RENAME_CHECKLIST": {
      const trimmed = action.payload.name.trim();
      if (!trimmed) return state;
      if (
        state.checklists.some(
          (c) => c.tempId !== action.payload.tempId && c.name.toLowerCase() === trimmed.toLowerCase()
        )
      ) {
        return state;
      }
      return {
        ...state,
        checklists: state.checklists.map((c) =>
          c.tempId === action.payload.tempId ? { ...c, name: trimmed } : c
        ),
      };
    }

    case "DELETE_CHECKLIST": {
      if (state.checklists.length <= 1) {
        return state;
      }
      return {
        ...state,
        checklists: state.checklists.filter((c) => c.tempId !== action.payload.tempId),
      };
    }

    case "RESET_DRAFT": {
      return initialDraftState;
    }

    default:
      return state;
  }
}

export function validateDraft(draft: TrackerDraft): string | null {
  if (!draft.examName.trim()) {
    return "Please enter an Exam Name before launching.";
  }
  if (draft.checklists.length === 0) {
    return "At least 1 checklist column is required before launching.";
  }
  if (draft.subjects.length === 0) {
    return "Please add at least 1 subject to your syllabus.";
  }
  if (draft.topics.length === 0) {
    return "Please add at least 1 topic to your syllabus.";
  }

  // Verify no empty chapters
  for (const ch of draft.chapters) {
    const hasTopics = draft.topics.some((t) => t.chapterTempId === ch.tempId);
    if (!hasTopics) {
      const parentSub = draft.subjects.find((s) => s.tempId === ch.subjectTempId);
      const subInfo = parentSub ? ` under "${parentSub.name}"` : "";
      return `Chapter "${ch.name}"${subInfo} has no topics. Please add topics to it or remove the empty chapter.`;
    }
  }

  // Verify no empty subjects
  for (const sub of draft.subjects) {
    const hasTopics = draft.topics.some((t) => t.subjectTempId === sub.tempId);
    if (!hasTopics) {
      return `Subject "${sub.name}" has no topics. Please add topics to it or remove the empty subject.`;
    }
  }

  return null;
}

interface BuilderContextValue {
  draft: TrackerDraft;
  dispatch: React.Dispatch<Action>;
  validateDraft: () => string | null;
  resetDraft: () => void;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const [draft, dispatch] = useReducer(draftReducer, initialDraftState);

  const handleValidate = useCallback(() => {
    return validateDraft(draft);
  }, [draft]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET_DRAFT" });
  }, []);

  return (
    <BuilderContext.Provider
      value={{
        draft,
        dispatch,
        validateDraft: handleValidate,
        resetDraft: handleReset,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilderContext() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilderContext must be used within a BuilderProvider");
  }
  return context;
}
