import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TemplateCard } from "@/src/components/templates/template-card";
import { SaveAsTemplateModal } from "@/src/components/trackers/save-as-template-modal";
import { InstantiateTemplateModal } from "@/src/components/templates/instantiate-template-modal";
import { TemplatePreviewModal } from "@/src/components/templates/template-preview-modal";
import { TemplateHubClient } from "@/src/components/templates/template-hub-client";
import type { TrackerTemplate } from "@/src/lib/types/template";

// Mocks for Next.js navigation and server actions
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/src/lib/actions/templates", () => ({
  createTemplateFromScratchAction: vi.fn().mockResolvedValue({ id: "tmpl-1" }),
  createTemplateFromTrackerAction: vi.fn().mockResolvedValue({ id: "tmpl-2" }),
  updateTemplateVisibilityAction: vi.fn().mockResolvedValue(undefined),
  deleteTemplateAction: vi.fn().mockResolvedValue(undefined),
  instantiateTrackerFromTemplateAction: vi.fn().mockResolvedValue({ id: "tracker-999" }),
}));

describe("Template UI Components Test Suite", () => {
  const sampleTemplate: TrackerTemplate = {
    id: "tmpl-123",
    user_id: "user-1",
    title: "Physician Board Exam Master Template",
    description: "Complete 12-subject medical review template",
    category: "Medical",
    is_public: true,
    use_count: 42,
    structure: {
      checklists: [
        { name: "1st Read", position: 1 },
        { name: "Notes", position: 2 },
        { name: "Practice Qs", position: 3 },
      ],
      subjects: [
        {
          name: "Pharmacology",
          position: 1,
          chapters: [],
          topics: [{ name: "Autonomic Drugs", position: 1 }],
        },
        {
          name: "Pathology",
          position: 2,
          chapters: [],
          topics: [{ name: "Cellular Injury", position: 1 }],
        },
      ],
    },
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };

  describe("TemplateCard Component", () => {
    it("renders template metadata, subject counts, stage counts, usage metrics, and formatted updated_at date", () => {
      const onUseTemplate = vi.fn();
      render(
        <TemplateCard
          template={sampleTemplate}
          currentUserId="user-2"
          onUseTemplate={onUseTemplate}
        />
      );

      expect(screen.getByText("Physician Board Exam Master Template")).toBeInTheDocument();
      expect(screen.getByText("Complete 12-subject medical review template")).toBeInTheDocument();
      expect(screen.getByText("Medical")).toBeInTheDocument();
      expect(screen.getByText("2 Subjects")).toBeInTheDocument();
      expect(screen.getByText("3 Stages")).toBeInTheDocument();
      expect(screen.getByText("42 uses")).toBeInTheDocument();
      expect(screen.getByText("Public")).toBeInTheDocument();
      expect(screen.getByText("Jan 1, 2026")).toBeInTheDocument();
    });

    it("triggers onUseTemplate when 'Use Template' button is clicked", () => {
      const onUseTemplate = vi.fn();
      render(
        <TemplateCard
          template={sampleTemplate}
          currentUserId="user-2"
          onUseTemplate={onUseTemplate}
        />
      );

      const useBtn = screen.getByRole("button", { name: /^use$/i });
      fireEvent.click(useBtn);

      expect(onUseTemplate).toHaveBeenCalledWith(sampleTemplate);
    });

    it("shows owner controls (Edit link and Delete button) when current user is creator", () => {
      const onUseTemplate = vi.fn();
      render(
        <TemplateCard
          template={sampleTemplate}
          currentUserId="user-1" // matching creator
          onUseTemplate={onUseTemplate}
        />
      );

      expect(screen.getByTitle("Edit template")).toBeInTheDocument();
      expect(screen.getByTitle("Delete template")).toBeInTheDocument();
    });

    it("opens AlertDialog confirmation when clicking Delete button", async () => {
      const onUseTemplate = vi.fn();
      render(
        <TemplateCard
          template={sampleTemplate}
          currentUserId="user-1"
          onUseTemplate={onUseTemplate}
        />
      );

      const deleteBtn = screen.getByTitle("Delete template");
      fireEvent.click(deleteBtn);

      expect(screen.getByText(/delete.*physician board exam/i)).toBeInTheDocument();
      expect(
        screen.getByText(/this cannot be undone/i)
      ).toBeInTheDocument();
    });
  });

  describe("SaveAsTemplateModal Component", () => {
    it("renders form with pre-filled title and handles submission", async () => {
      const onClose = vi.fn();
      render(
        <SaveAsTemplateModal
          isOpen={true}
          onClose={onClose}
          trackerId="tracker-123"
          defaultTitle="CPA Review Plan"
        />
      );

      expect(screen.getByText("Save as Template")).toBeInTheDocument();
      const titleInput = screen.getByLabelText(/template title/i);
      expect(titleInput).toHaveValue("CPA Review Plan Template");

      // Select category
      const nursingCategory = screen.getByText("Nursing");
      fireEvent.click(nursingCategory);

      // Select Public
      const publicBtn = screen.getByText("Public");
      fireEvent.click(publicBtn);

      const submitBtn = screen.getByRole("button", { name: /create template/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe("InstantiateTemplateModal Component", () => {
    it("renders modal with template details and handles tracker instantiation", async () => {
      const onClose = vi.fn();
      render(
        <InstantiateTemplateModal
          template={sampleTemplate}
          isOpen={true}
          onClose={onClose}
        />
      );

      expect(screen.getByText("Create Tracker from Template")).toBeInTheDocument();
      const nameInput = screen.getByLabelText(/exam tracker name/i);
      expect(nameInput).toHaveValue("Physician Board Exam Master Template");

      const launchBtn = screen.getByRole("button", { name: /launch tracker/i });
      fireEvent.click(launchBtn);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe("TemplatePreviewModal Component", () => {
    it("renders detailed subject, chapter, topic, and checklist stage preview", () => {
      const onClose = vi.fn();
      const onUseTemplate = vi.fn();
      render(
        <TemplatePreviewModal
          template={sampleTemplate}
          isOpen={true}
          onClose={onClose}
          onUseTemplate={onUseTemplate}
        />
      );

      expect(screen.getByText("Physician Board Exam Master Template")).toBeInTheDocument();
      expect(screen.getByText("Pharmacology")).toBeInTheDocument();
      expect(screen.getByText("Pathology")).toBeInTheDocument();
      expect(screen.getByText("Autonomic Drugs")).toBeInTheDocument();
      expect(screen.getByText("Cellular Injury")).toBeInTheDocument();

      const useBtn = screen.getByRole("button", { name: /use this template/i });
      fireEvent.click(useBtn);

      expect(onClose).toHaveBeenCalled();
      expect(onUseTemplate).toHaveBeenCalledWith(sampleTemplate);
    });
  });

  describe("TemplateHubClient Component", () => {
    const userTemplate: TrackerTemplate = {
      ...sampleTemplate,
      id: "tmpl-user-99",
      title: "My Private CPA Template",
      is_public: false,
      user_id: "user-1",
    };

    it("renders community templates and supports search filtering", () => {
      render(
        <TemplateHubClient
          publicTemplates={[sampleTemplate]}
          userTemplates={[userTemplate]}
          currentUserId="user-1"
        />
      );

      expect(screen.getByText("Template Hub")).toBeInTheDocument();
      expect(screen.getByText("Physician Board Exam Master Template")).toBeInTheDocument();

      // Filter by search query
      const searchInput = screen.getByPlaceholderText(/search templates/i);
      fireEvent.change(searchInput, { target: { value: "NonExistentSubject" } });

      expect(screen.getByText("No templates found")).toBeInTheDocument();
    });

    it("switches to 'My Templates' tab and displays user's private templates", () => {
      render(
        <TemplateHubClient
          publicTemplates={[sampleTemplate]}
          userTemplates={[userTemplate]}
          currentUserId="user-1"
        />
      );

      const myTemplatesTab = screen.getByRole("tab", { name: /my templates/i });
      fireEvent.click(myTemplatesTab);

      expect(screen.getByText("My Private CPA Template")).toBeInTheDocument();
    });
  });
});
