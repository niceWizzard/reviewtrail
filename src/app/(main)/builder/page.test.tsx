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

describe("BuilderPage Orchestration - Phase 1", () => {
  const mockSetStep = vi.fn();
  const mockSetTrackerId = vi.fn();
  const mockResetBuilder = vi.fn();
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
      setTrackerId: mockSetTrackerId,
      resetBuilder: mockResetBuilder,
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

  it("renders Phase 1 page layout and hides Phase 2 matrix builder", () => {
    render(<BuilderPage />);

    expect(screen.getByText("Create Custom Exam Tracker")).toBeInTheDocument();
    expect(screen.getByText("1. Exam Details")).toBeInTheDocument();
    expect(screen.getByText("Exam Title & Target Date")).toBeInTheDocument();

    expect(screen.queryByText("Interactive Review Matrix Builder")).not.toBeInTheDocument();
  });

  it("navigates to dashboard directly when clicking header back button in Phase 1", async () => {
    const user = userEvent.setup();
    render(<BuilderPage />);

    const backBtn = screen.getByRole("button", { name: /Dashboard/i });
    await user.click(backBtn);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    expect(mockResetBuilder).toHaveBeenCalled();
    expect(screen.queryByText(/Are you sure you want to leave\?/i)).not.toBeInTheDocument();
  });

  it("resets builder state when component unmounts", () => {
    const { unmount } = render(<BuilderPage />);
    unmount();
    expect(mockResetBuilder).toHaveBeenCalled();
  });

  it("displays and dismisses error alert when Phase 1 save throws an error", async () => {
    const user = userEvent.setup();
    mockSaveExamInfo.mockRejectedValueOnce(new Error("Failed to create exam tracker"));

    render(<BuilderPage />);

    const examNameInput = screen.getByLabelText(/Exam Name/i);
    await user.type(examNameInput, "CPA Exam");

    const submitBtn = screen.getByRole("button", { name: /Next: Build Review Matrix/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Failed to create exam tracker")).toBeInTheDocument();
    });

    const dismissBtn = screen.getByRole("button", { name: /Dismiss/i });
    await user.click(dismissBtn);

    expect(screen.queryByText("Failed to create exam tracker")).not.toBeInTheDocument();
  });
});
