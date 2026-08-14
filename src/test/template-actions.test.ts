import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createTemplateFromScratchAction,
  createTemplateFromTrackerAction,
  updateTemplateVisibilityAction,
  updateTemplateAction,
  deleteTemplateAction,
  instantiateTrackerFromTemplateAction,
} from "@/src/lib/actions/templates";
import type { TrackerDraft } from "@/src/lib/types/builder-draft";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/src/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

vi.mock("next/cache", () => ({
  updateTag: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

describe("Template Server Actions Test Suite", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };

  const validDraft: TrackerDraft = {
    examName: "Master CPA Review Template",
    examDate: null,
    description: "Full CPA syllabus",
    checklists: [
      { tempId: "c1", name: "1st Read", position: 1 },
      { tempId: "c2", name: "Practice Qs", position: 2 },
    ],
    subjects: [{ tempId: "s1", name: "Auditing", position: 1 }],
    chapters: [{ tempId: "ch1", subjectTempId: "s1", name: "Audit Planning", position: 1 }],
    topics: [{ tempId: "t1", subjectTempId: "s1", chapterTempId: "ch1", name: "Risk Assessment", position: 1 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTemplateFromScratchAction", () => {
    it("throws an error if user is unauthenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error("Unauthenticated") });

      await expect(
        createTemplateFromScratchAction({
          metadata: { title: "My Template", category: "Custom", is_public: false },
          draft: validDraft,
        })
      ).rejects.toThrow("You must be logged in to create a template.");
    });

    it("creates a template successfully when user is authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "tmpl-999",
          user_id: "user-123",
          title: "Master CPA Review Template",
          category: "Accountancy",
          is_public: true,
          structure: {},
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await createTemplateFromScratchAction({
        metadata: { title: "Master CPA Review Template", category: "Accountancy", is_public: true },
        draft: validDraft,
      });

      expect(result.id).toBe("tmpl-999");
      expect(result.title).toBe("Master CPA Review Template");
      expect(mockFrom).toHaveBeenCalledWith("tracker_templates");
    });
  });

  describe("updateTemplateVisibilityAction", () => {
    it("updates visibility boolean for template owner", async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const mockEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await updateTemplateVisibilityAction("tmpl-999", true);

      expect(mockFrom).toHaveBeenCalledWith("tracker_templates");
      expect(mockUpdate).toHaveBeenCalledWith({ is_public: true });
    });
  });

  describe("deleteTemplateAction", () => {
    it("deletes template for template owner", async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const mockEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await deleteTemplateAction("tmpl-999");

      expect(mockFrom).toHaveBeenCalledWith("tracker_templates");
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe("updateTemplateAction", () => {
    it("updates template metadata and structure successfully for template owner", async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "tmpl-999",
          user_id: "user-123",
          title: "Updated CPA Title",
          category: "Accountancy",
          is_public: true,
          structure: {},
          created_at: "2026-01-01",
          updated_at: "2026-08-14",
        },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq2 = vi.fn().mockReturnValue({ select: mockSelect });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateTemplateAction({
        templateId: "tmpl-999",
        metadata: { title: "Updated CPA Title", category: "Accountancy", is_public: true },
        draft: validDraft,
      });

      expect(result.id).toBe("tmpl-999");
      expect(result.title).toBe("Updated CPA Title");
      expect(mockFrom).toHaveBeenCalledWith("tracker_templates");
    });
  });
});
