import { describe, it, expect } from "vitest";
import {
  validateDraft,
  draftReducer,
  validateRenameSubject,
  validateRenameChapter,
  validateRenameChecklist,
  validateRenameTopic,
} from "@/src/app/(main)/builder/builder-context";
import { updateExamTrackerAction } from "@/src/lib/actions/trackers";
import type { TrackerDraft } from "@/src/lib/types/builder-draft";

describe("Tracker Editing & Rename Validation Rules", () => {
  const initialDraft: TrackerDraft = {
    examName: "Medical Board Exam",
    examDate: "2026-11-01",
    description: "Initial notes",
    checklists: [
      { tempId: "col-1", name: "1st Read", position: 1 },
      { tempId: "col-2", name: "Notes", position: 2 },
    ],
    subjects: [
      { tempId: "sub-1", name: "Anatomy", position: 1 },
      { tempId: "sub-2", name: "Physiology", position: 2 },
    ],
    chapters: [
      { tempId: "ch-1", subjectTempId: "sub-1", name: "Neuroanatomy", position: 1 },
      { tempId: "ch-2", subjectTempId: "sub-1", name: "Histology", position: 2 },
    ],
    topics: [
      { tempId: "top-1", subjectTempId: "sub-1", chapterTempId: "ch-1", name: "Cranial Nerves", position: 1 },
      { tempId: "top-2", subjectTempId: "sub-1", chapterTempId: "ch-1", name: "Spinal Cord", position: 2 },
      { tempId: "top-3", subjectTempId: "sub-2", chapterTempId: null, name: "Homeostasis", position: 3 },
    ],
  };

  it("validates a draft after renaming subjects, chapters, and topics", () => {
    const renamedDraft: TrackerDraft = {
      ...initialDraft,
      examName: "Updated Physician Licensure Exam",
      subjects: [
        { tempId: "sub-1", name: "Gross Anatomy", position: 1 },
        { tempId: "sub-2", name: "Medical Physiology", position: 2 },
      ],
      chapters: [{ tempId: "ch-1", subjectTempId: "sub-1", name: "Brain Anatomy", position: 1 }],
      topics: [
        { tempId: "top-1", subjectTempId: "sub-1", chapterTempId: "ch-1", name: "Optic Nerve", position: 1 },
        { tempId: "top-2", subjectTempId: "sub-2", chapterTempId: null, name: "Renal Function", position: 2 },
      ],
    };

    const error = validateDraft(renamedDraft);
    expect(error).toBeNull();
  });

  it("rejects renaming an exam to an empty string in validateDraft", () => {
    const invalidDraft = { ...initialDraft, examName: "  " };
    expect(validateDraft(invalidDraft)).toBe("Please enter an Exam Name before launching.");
  });

  it("rejects creating or updating a tracker with a past date in server actions", async () => {
    await expect(
      updateExamTrackerAction({
        trackerId: "tracker-123",
        exam_name: "Test Exam",
        exam_date: "2020-01-01",
      })
    ).rejects.toThrow("Target exam date cannot be in the past.");
  });

  it("returns error message when renaming a subject to an existing subject name", () => {
    const err = validateRenameSubject(initialDraft, "sub-2", "Anatomy");
    expect(err).toBe('A subject named "Anatomy" already exists.');
  });

  it("returns error message when renaming a chapter to an existing chapter name in the same subject", () => {
    const err = validateRenameChapter(initialDraft, "ch-2", "Neuroanatomy");
    expect(err).toBe('A chapter named "Neuroanatomy" already exists in this subject.');
  });

  it("returns error message when renaming a checklist column to an existing column name", () => {
    const err = validateRenameChecklist(initialDraft, "col-2", "1st Read");
    expect(err).toBe('A checklist column named "1st Read" already exists.');
  });

  it("returns error message when renaming a topic to an existing topic name in the same group", () => {
    const err = validateRenameTopic(initialDraft, "top-2", "Cranial Nerves");
    expect(err).toBe('A topic named "Cranial Nerves" already exists in this group.');
  });

  it("ensures draftReducer returns state unchanged for invalid actions without throwing exceptions", () => {
    const nextState = draftReducer(initialDraft, {
      type: "RENAME_CHECKLIST",
      payload: { tempId: "col-2", name: "1st Read" },
    });
    expect(nextState).toEqual(initialDraft);
  });
});
