import { describe, it, expect } from "vitest";
import {
  validateTemplateDraft,
  convertDraftToTemplateStructure,
  convertTemplateStructureToDraft,
  transformTrackerToTemplateStructure,
  TemplateStructureSchema,
  TemplateMetadataSchema,
} from "@/src/lib/types/template";
import type { TrackerDraft } from "@/src/lib/types/builder-draft";
import type { Subject, Chapter, Topic, TrackerChecklist } from "@/src/lib/types/database";

describe("Tracker Template Validation & Schema Tests", () => {
  const sampleValidDraft: TrackerDraft = {
    examName: "Civil Engineering Board Template",
    examDate: null,
    description: "Full syllabus template for structural and hydraulics engineering",
    checklists: [
      { tempId: "col-1", name: "1st Read", position: 1 },
      { tempId: "col-2", name: "Notes", position: 2 },
    ],
    subjects: [{ tempId: "sub-1", name: "Structural Engineering", position: 1 }],
    chapters: [{ tempId: "ch-1", subjectTempId: "sub-1", name: "Beams & Columns", position: 1 }],
    topics: [{ tempId: "top-1", subjectTempId: "sub-1", chapterTempId: "ch-1", name: "Flexural Strength", position: 1 }],
  };

  it("validates a complete, valid template draft successfully", () => {
    const error = validateTemplateDraft(sampleValidDraft);
    expect(error).toBeNull();
  });

  it("rejects a template draft with empty or whitespace title", () => {
    const emptyDraft = { ...sampleValidDraft, examName: "   " };
    expect(validateTemplateDraft(emptyDraft)).toBe("Please enter a Template Title before saving.");
  });

  it("rejects a template draft with 0 checklist stages", () => {
    const noColsDraft = { ...sampleValidDraft, checklists: [] };
    expect(validateTemplateDraft(noColsDraft)).toBe("At least 1 checklist stage is required.");
  });

  it("rejects a template draft with 0 subjects", () => {
    const noSubsDraft = { ...sampleValidDraft, subjects: [] };
    expect(validateTemplateDraft(noSubsDraft)).toBe("Please add at least 1 subject to your template.");
  });

  it("silently prunes empty chapters from the output (does not block save)", () => {
    const emptyChapterDraft: TrackerDraft = {
      ...sampleValidDraft,
      chapters: [
        { tempId: "ch-1", subjectTempId: "sub-1", name: "Beams & Columns", position: 1 },
        { tempId: "ch-2", subjectTempId: "sub-1", name: "Concrete Shear", position: 2 },
      ],
      topics: [{ tempId: "top-1", subjectTempId: "sub-1", chapterTempId: "ch-1", name: "Flexural Strength", position: 1 }],
    };

    // Validation should pass — the subject has a topic via ch-1
    expect(validateTemplateDraft(emptyChapterDraft)).toBeNull();

    // Empty chapter "Concrete Shear" (ch-2) should be pruned from the serialised structure
    const structure = convertDraftToTemplateStructure(emptyChapterDraft);
    expect(structure.subjects[0].chapters).toHaveLength(1);
    expect(structure.subjects[0].chapters[0].name).toBe("Beams & Columns");
  });

  it("converts a valid draft into a clean TemplateStructure JSON", () => {
    const structure = convertDraftToTemplateStructure(sampleValidDraft);
    expect(structure.checklists).toHaveLength(2);
    expect(structure.subjects).toHaveLength(1);
    expect(structure.subjects[0].name).toBe("Structural Engineering");
    expect(structure.subjects[0].chapters[0].topics[0].name).toBe("Flexural Strength");

    const zodResult = TemplateStructureSchema.safeParse(structure);
    expect(zodResult.success).toBe(true);
  });

  it("transforms database tracker models into clean TemplateStructure JSON", () => {
    const mockChecklists: TrackerChecklist[] = [
      { id: "c1", exam_tracker_id: "tr1", name: "1st Read", position: 1, color: null, created_at: "" },
      { id: "c2", exam_tracker_id: "tr1", name: "Practice Qs", position: 2, color: null, created_at: "" },
    ];
    const mockSubjects: Subject[] = [
      { id: "s1", exam_tracker_id: "tr1", name: "Pharmacology", position: 1, color: null, created_at: "", updated_at: "" },
    ];
    const mockChapters: Chapter[] = [
      { id: "ch1", exam_tracker_id: "tr1", subject_id: "s1", name: "Autonomically Active Drugs", description: null, position: 1, created_at: "", updated_at: "" },
    ];
    const mockTopics: Topic[] = [
      { id: "t1", exam_tracker_id: "tr1", subject_id: "s1", chapter_id: "ch1", name: "Cholinergic Agonists", position: 1, created_at: "", updated_at: "" },
    ];

    const structure = transformTrackerToTemplateStructure(
      mockSubjects,
      mockChapters,
      mockTopics,
      mockChecklists
    );

    expect(structure.checklists).toHaveLength(2);
    expect(structure.subjects[0].name).toBe("Pharmacology");
    expect(structure.subjects[0].chapters[0].name).toBe("Autonomically Active Drugs");
    expect(structure.subjects[0].chapters[0].topics[0].name).toBe("Cholinergic Agonists");

    const zodResult = TemplateStructureSchema.safeParse(structure);
    expect(zodResult.success).toBe(true);
  });

  it("validates TemplateMetadataSchema defaults and requirements", () => {
    const metadataResult = TemplateMetadataSchema.safeParse({
      title: "  Nursing Syllabi Template ",
      category: "Nursing",
      is_public: true,
      description: "Official 2026 nursing review template",
    });

    expect(metadataResult.success).toBe(true);
    if (metadataResult.success) {
      expect(metadataResult.data.title).toBe("Nursing Syllabi Template");
      expect(metadataResult.data.is_public).toBe(true);
    }
  });

  it("converts a TemplateStructure JSON back into an editable TrackerDraft format", () => {
    const structure = convertDraftToTemplateStructure(sampleValidDraft);
    const draft = convertTemplateStructureToDraft(structure, "Reconstructed CPA Template", "Reconstructed description");

    expect(draft.examName).toBe("Reconstructed CPA Template");
    expect(draft.description).toBe("Reconstructed description");
    expect(draft.checklists).toHaveLength(2);
    expect(draft.subjects).toHaveLength(1);
    expect(draft.chapters).toHaveLength(1);
    expect(draft.topics).toHaveLength(1);
    expect(draft.topics[0].name).toBe("Flexural Strength");
  });
});
