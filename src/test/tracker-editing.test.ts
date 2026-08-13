import { describe, it, expect } from "vitest";
import { validateDraft } from "@/src/app/(main)/builder/builder-context";
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
    chapters: [{ tempId: "ch-1", subjectTempId: "sub-1", name: "Neuroanatomy", position: 1 }],
    topics: [
      { tempId: "top-1", subjectTempId: "sub-1", chapterTempId: "ch-1", name: "Cranial Nerves", position: 1 },
      { tempId: "top-2", subjectTempId: "sub-2", chapterTempId: null, name: "Homeostasis", position: 2 },
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
});
