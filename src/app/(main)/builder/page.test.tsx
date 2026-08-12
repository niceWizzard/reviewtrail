import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BuilderPage from "./page";
import { mockPush } from "@/src/test/mocks/navigation";
import { useTrackerBuilder } from "@/src/hooks/use-tracker-builder";
import { useTrackerWorkspace } from "@/src/hooks/use-tracker-workspace";

vi.mock("@/src/hooks/use-tracker-builder");
vi.mock("@/src/hooks/use-tracker-workspace");

describe("BuilderPage - Phase 1 (Exam Info Form)", () => {
  const mockSetStep = vi.fn();
  const mockSaveExamInfo = vi.fn();
  const mockAddSectionColumn = vi.fn();
  const mockAddSubject = vi.fn();
  const mockAddChapter = vi.fn();
  const mockAddTopic = vi.fn();

  const mockWorkspaceData = {
    checklists: [],
    subjects: [],
    chapters: [],
    topics: [],
    deleteSectionColumn: vi.fn(),
    deleteSubject: vi.fn(),
    deleteChapter: vi.fn(),
    deleteTopic: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTrackerBuilder).mockReturnValue({
      step: 1,
      setStep: mockSetStep,
      trackerId: null,
      saveExamInfo: mockSaveExamInfo,
      isSavingExamInfo: false,
      addSectionColumn: mockAddSectionColumn,
      isAddingSection: false,
      addSubject: mockAddSubject,
      isAddingSubject: false,
      addChapter: mockAddChapter,
      addTopic: mockAddTopic,
      isAddingTopic: false,
    });

    vi.mocked(useTrackerWorkspace).mockReturnValue(mockWorkspaceData as any);
  });

  it("renders Phase 1 (Exam Info Form) elements and header correctly", () => {
    render(<BuilderPage />);

    // Header step 1 title check
    expect(screen.getByText("Create Custom Exam Tracker")).toBeInTheDocument();
    expect(screen.getByText("1. Exam Details")).toBeInTheDocument();

    // Form title & inputs check
    expect(screen.getByText("Exam Title & Target Date")).toBeInTheDocument();
    expect(screen.getByLabelText(/Exam Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Pre-populate default checklist columns/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next: Build Review Matrix/i })).toBeInTheDocument();

    // Ensure Phase 2 component is NOT rendered
    expect(screen.queryByText("Interactive Review Matrix Builder")).not.toBeInTheDocument();
  });

  it("handles form submission in Phase 1 with valid inputs", async () => {
    const user = userEvent.setup();
    mockSaveExamInfo.mockResolvedValueOnce({ id: "tracker-123" });

    render(<BuilderPage />);

    const examNameInput = screen.getByLabelText(/Exam Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);

    await user.type(examNameInput, "USMLE Step 1");
    await user.type(descriptionInput, "Pass on first attempt");

    const submitBtn = screen.getByRole("button", { name: /Next: Build Review Matrix/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockSaveExamInfo).toHaveBeenCalledWith({
        exam_name: "USMLE Step 1",
        exam_date: undefined,
        description: "Pass on first attempt",
        prepopulateColumns: true,
      });
    });
  });

  it("displays loading state during Phase 1 form submission", () => {
    vi.mocked(useTrackerBuilder).mockReturnValue({
      step: 1,
      setStep: mockSetStep,
      trackerId: null,
      saveExamInfo: mockSaveExamInfo,
      isSavingExamInfo: true,
      addSectionColumn: mockAddSectionColumn,
      isAddingSection: false,
      addSubject: mockAddSubject,
      isAddingSubject: false,
      addChapter: mockAddChapter,
      addTopic: mockAddTopic,
      isAddingTopic: false,
    });

    render(<BuilderPage />);

    const submitBtn = screen.getByRole("button", { name: /Autosaving Exam Info.../i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  it("displays and clears error alert if Phase 1 save fails", async () => {
    const user = userEvent.setup();
    mockSaveExamInfo.mockRejectedValueOnce(new Error("Failed to create exam tracker"));

    render(<BuilderPage />);

    const examNameInput = screen.getByLabelText(/Exam Name/i);
    await user.type(examNameInput, "CPA Exam");

    const submitBtn = screen.getByRole("button", { name: /Next: Build Review Matrix/i });
    await user.click(submitBtn);

    // Wait for error alert to display
    await waitFor(() => {
      expect(screen.getByText("Failed to create exam tracker")).toBeInTheDocument();
    });

    // Dismiss error alert
    const dismissBtn = screen.getByRole("button", { name: /Dismiss/i });
    await user.click(dismissBtn);

    expect(screen.queryByText("Failed to create exam tracker")).not.toBeInTheDocument();
  });

  it("navigates to dashboard directly when user attempts header navigation in Phase 1", async () => {
    const user = userEvent.setup();
    render(<BuilderPage />);

    const backBtn = screen.getByRole("button", { name: /Dashboard/i });
    await user.click(backBtn);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    expect(screen.queryByText(/Are you sure you want to leave\?/i)).not.toBeInTheDocument();
  });
});
