import { describe, it, expect } from "vitest";
import { validateDraft } from "@/src/app/(main)/builder/builder-context";
import type { TrackerDraft } from "@/src/lib/types/builder-draft";

describe("Tracker Draft State & Validation Rules", () => {
  const sampleValidDraft: TrackerDraft = {
    examName: "Physician Licensure Exam",
    examDate: "2026-10-15",
    description: "Complete review plan",
    checklists: [
      { tempId: "col-1", name: "1st Read", position: 1 },
      { tempId: "col-2", name: "Notes", position: 2 },
    ],
    subjects: [{ tempId: "sub-1", name: "Pathology", position: 1 }],
    chapters: [{ tempId: "ch-1", subjectTempId: "sub-1", name: "Cell Injury", position: 1 }],
    topics: [{ tempId: "top-1", subjectTempId: "sub-1", chapterTempId: "ch-1", name: "Apoptosis", position: 1 }],
  };

  it("validates a complete, valid draft successfully", () => {
    const error = validateDraft(sampleValidDraft);
    expect(error).toBeNull();
  });

  it("rejects a draft with empty or whitespace exam name", () => {
    const emptyDraft = { ...sampleValidDraft, examName: "   " };
    expect(validateDraft(emptyDraft)).toBe("Please enter an Exam Name before launching.");
  });

  it("rejects a draft with 0 checklist columns", () => {
    const noColumnsDraft = { ...sampleValidDraft, checklists: [] };
    expect(validateDraft(noColumnsDraft)).toBe("At least 1 checklist column is required before launching.");
  });

  it("rejects a draft with 0 subjects", () => {
    const noSubjectsDraft = { ...sampleValidDraft, subjects: [] };
    expect(validateDraft(noSubjectsDraft)).toBe("Please add at least 1 subject to your syllabus.");
  });

  it("rejects a draft with 0 topics", () => {
    const noTopicsDraft = { ...sampleValidDraft, topics: [] };
    expect(validateDraft(noTopicsDraft)).toBe("Please add at least 1 topic to your syllabus.");
  });

  it("rejects a draft containing an empty chapter without topics", () => {
    const emptyChapterDraft: TrackerDraft = {
      ...sampleValidDraft,
      chapters: [
        { tempId: "ch-1", subjectTempId: "sub-1", name: "Cell Injury", position: 1 },
        { tempId: "ch-2", subjectTempId: "sub-1", name: "Inflammation", position: 2 },
      ],
      topics: [{ tempId: "top-1", subjectTempId: "sub-1", chapterTempId: "ch-1", name: "Apoptosis", position: 1 }],
    };

    expect(validateDraft(emptyChapterDraft)).toBe(
      'Chapter "Inflammation" under "Pathology" has no topics. Please add topics to it or remove the empty chapter.'
    );
  });
});
