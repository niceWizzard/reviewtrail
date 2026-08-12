import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BuilderPage from "./page";
import { mockPush } from "@/src/test/mocks/navigation";
import { useTrackerBuilder } from "@/src/hooks/use-tracker-builder";

vi.mock("@/src/hooks/use-tracker-builder");

describe("BuilderPage Orchestration - Phase 1 & Local Draft", () => {
  const mockSetStep = vi.fn();
  const mockResetBuilder = vi.fn();
  const mockCommitDraft = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTrackerBuilder).mockReturnValue({
      step: 1,
      setStep: mockSetStep,
      resetBuilder: mockResetBuilder,
      commitDraft: mockCommitDraft,
      isCommitting: false,
    });
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
});
