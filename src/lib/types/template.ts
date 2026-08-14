import { z } from "zod";
import type { TrackerDraft } from "./builder-draft";
import type { Chapter, Subject, Topic, TrackerChecklist } from "./database";

// Types
export interface TemplateChecklist {
  name: string;
  position: number;
  color?: string | null;
}

export interface TemplateTopic {
  name: string;
  position: number;
}

export interface TemplateChapter {
  name: string;
  description?: string | null;
  position: number;
  topics: TemplateTopic[];
}

export interface TemplateSubject {
  name: string;
  color?: string | null;
  position: number;
  chapters: TemplateChapter[];
  topics: TemplateTopic[]; // Direct topics under subject without a chapter
}

export interface TemplateStructure {
  checklists: TemplateChecklist[];
  subjects: TemplateSubject[];
}

export interface TrackerTemplate {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  category: string;
  is_public: boolean;
  source_tracker_id?: string | null;
  structure: TemplateStructure;
  use_count?: number;
  created_at: string;
  updated_at: string;
  author_email?: string | null;
}

// Zod Schemas
export const TemplateChecklistSchema = z.object({
  name: z.string().trim().min(1, "Checklist stage name cannot be empty"),
  position: z.number().int().min(1),
  color: z.string().nullable().optional(),
});

export const TemplateTopicSchema = z.object({
  name: z.string().trim().min(1, "Topic name cannot be empty"),
  position: z.number().int().min(1),
});

export const TemplateChapterSchema = z.object({
  name: z.string().trim().min(1, "Chapter name cannot be empty"),
  description: z.string().nullable().optional(),
  position: z.number().int().min(1),
  topics: z.array(TemplateTopicSchema).min(1, "Each chapter must contain at least 1 topic"),
});

export const TemplateSubjectSchema = z.object({
  name: z.string().trim().min(1, "Subject name cannot be empty"),
  color: z.string().nullable().optional(),
  position: z.number().int().min(1),
  chapters: z.array(TemplateChapterSchema),
  topics: z.array(TemplateTopicSchema),
}).refine(
  (data) => data.chapters.length > 0 || data.topics.length > 0,
  "Subject must contain at least 1 topic or chapter"
);

export const TemplateStructureSchema = z.object({
  checklists: z.array(TemplateChecklistSchema).min(1, "At least 1 checklist column is required"),
  subjects: z.array(TemplateSubjectSchema).min(1, "At least 1 subject is required"),
}).refine((data) => {
  const totalTopics = data.subjects.reduce((acc, sub) => {
    const directTopics = sub.topics.length;
    const chapterTopics = sub.chapters.reduce((cAcc, ch) => cAcc + ch.topics.length, 0);
    return acc + directTopics + chapterTopics;
  }, 0);
  return totalTopics > 0;
}, "Template must contain at least 1 topic overall");

export const TemplateMetadataSchema = z.object({
  title: z.string().trim().min(1, "Template title is required"),
  description: z.string().trim().nullable().optional(),
  category: z.string().trim().min(1, "Category is required"),
  is_public: z.boolean().default(false),
});

// Draft Validation Function for Standalone Template Builder
export function validateTemplateDraft(draft: TrackerDraft): string | null {
  if (!draft.examName || !draft.examName.trim()) {
    return "Please enter a Template Title before saving.";
  }

  if (!draft.checklists || draft.checklists.length === 0) {
    return "At least 1 checklist stage is required.";
  }

  if (!draft.subjects || draft.subjects.length === 0) {
    return "Please add at least 1 subject to your template.";
  }

  if (!draft.topics || draft.topics.length === 0) {
    return "Please add at least 1 topic to your template.";
  }

  // Check for empty subjects (subjects must have at least one topic, directly or via chapters)
  for (const sub of draft.subjects) {
    const hasTopics = draft.topics.some((t) => t.subjectTempId === sub.tempId);
    if (!hasTopics) {
      return `Subject "${sub.name}" has no topics. Please add at least one topic to it.`;
    }
  }

  return null;
}

// Convert Builder Draft into clean TemplateStructure JSON
export function convertDraftToTemplateStructure(draft: TrackerDraft): TemplateStructure {
  const checklists: TemplateChecklist[] = draft.checklists.map((c, idx) => ({
    name: c.name.trim(),
    position: idx + 1,
    color: c.color || null,
  }));

  const subjects: TemplateSubject[] = draft.subjects.map((sub, sIdx) => {
    const subChapters = draft.chapters
      .filter((ch) => ch.subjectTempId === sub.tempId)
      .map((ch, cIdx) => {
        const chTopics = draft.topics
          .filter((t) => t.chapterTempId === ch.tempId)
          .map((t, tIdx) => ({
            name: t.name.trim(),
            position: tIdx + 1,
          }));

        return {
          name: ch.name.trim(),
          description: ch.description ? ch.description.trim() : null,
          position: cIdx + 1,
          topics: chTopics,
        };
      })
      // Drop chapters that ended up with no topics (e.g. user added topics directly to subject)
      .filter((ch) => ch.topics.length > 0);

    const directTopics = draft.topics
      .filter((t) => t.subjectTempId === sub.tempId && !t.chapterTempId)
      .map((t, tIdx) => ({
        name: t.name.trim(),
        position: tIdx + 1,
      }));

    return {
      name: sub.name.trim(),
      color: sub.color || null,
      position: sIdx + 1,
      chapters: subChapters,
      topics: directTopics,
    };
  });

  return {
    checklists,
    subjects,
  };
}

// Transform an active Exam Tracker (Database model) into a clean TemplateStructure JSON
export function transformTrackerToTemplateStructure(
  dbSubjects: Subject[],
  dbChapters: Chapter[],
  dbTopics: Topic[],
  dbChecklists: TrackerChecklist[]
): TemplateStructure {
  const sortedChecklists = [...dbChecklists].sort((a, b) => a.position - b.position);
  const checklists: TemplateChecklist[] = sortedChecklists.map((c, idx) => ({
    name: c.name.trim(),
    position: idx + 1,
    color: c.color || null,
  }));

  const sortedSubjects = [...dbSubjects].sort((a, b) => a.position - b.position);
  const subjects: TemplateSubject[] = sortedSubjects.map((sub, sIdx) => {
    const subChapters = dbChapters
      .filter((ch) => ch.subject_id === sub.id)
      .sort((a, b) => a.position - b.position)
      .map((ch, cIdx) => {
        const chTopics = dbTopics
          .filter((t) => t.chapter_id === ch.id)
          .sort((a, b) => a.position - b.position)
          .map((t, tIdx) => ({
            name: t.name.trim(),
            position: tIdx + 1,
          }));

        return {
          name: ch.name.trim(),
          description: ch.description ? ch.description.trim() : null,
          position: cIdx + 1,
          topics: chTopics,
        };
      });

    const directTopics = dbTopics
      .filter((t) => t.subject_id === sub.id && !t.chapter_id)
      .sort((a, b) => a.position - b.position)
      .map((t, tIdx) => ({
        name: t.name.trim(),
        position: tIdx + 1,
      }));

    return {
      name: sub.name.trim(),
      color: sub.color || null,
      position: sIdx + 1,
      chapters: subChapters,
      topics: directTopics,
    };
  });

  return {
    checklists,
    subjects,
  };
}

// Convert TemplateStructure JSON back into an editable TrackerDraft format
export function convertTemplateStructureToDraft(
  structure: TemplateStructure,
  title: string,
  description?: string | null
): TrackerDraft {
  const checklists = (structure.checklists || []).map((col, idx) => ({
    tempId: `col-${idx + 1}`,
    name: col.name,
    position: col.position || idx + 1,
    color: col.color || null,
  }));

  const draftSubjects: TrackerDraft["subjects"] = [];
  const draftChapters: TrackerDraft["chapters"] = [];
  const draftTopics: TrackerDraft["topics"] = [];

  (structure.subjects || []).forEach((sub, sIdx) => {
    const subTempId = `sub-${sIdx + 1}`;
    draftSubjects.push({
      tempId: subTempId,
      name: sub.name,
      position: sub.position || sIdx + 1,
      color: sub.color || null,
    });

    (sub.chapters || []).forEach((ch, cIdx) => {
      const chTempId = `ch-${sIdx + 1}-${cIdx + 1}`;
      draftChapters.push({
        tempId: chTempId,
        subjectTempId: subTempId,
        name: ch.name,
        description: ch.description || null,
        position: ch.position || cIdx + 1,
      });

      (ch.topics || []).forEach((top, tIdx) => {
        draftTopics.push({
          tempId: `top-${sIdx + 1}-${cIdx + 1}-${tIdx + 1}`,
          subjectTempId: subTempId,
          chapterTempId: chTempId,
          name: top.name,
          position: top.position || tIdx + 1,
        });
      });
    });

    (sub.topics || []).forEach((top, tIdx) => {
      draftTopics.push({
        tempId: `top-dir-${sIdx + 1}-${tIdx + 1}`,
        subjectTempId: subTempId,
        chapterTempId: null,
        name: top.name,
        position: top.position || tIdx + 1,
      });
    });
  });

  return {
    examName: title,
    examDate: null,
    description: description || null,
    checklists,
    subjects: draftSubjects,
    chapters: draftChapters,
    topics: draftTopics,
  };
}
