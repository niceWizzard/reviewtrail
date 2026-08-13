import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditTrackerDialog } from "./edit-tracker-dialog";
import { updateExamTrackerAction } from "@/src/lib/actions/trackers";
import type { ExamTracker } from "@/src/lib/types/database";

vi.mock("@/src/lib/actions/trackers", () => ({
  updateExamTrackerAction: vi.fn(),
}));

describe("EditTrackerDialog Component", () => {
  const mockClose = vi.fn();
  const mockSuccess = vi.fn();

  const mockTracker: ExamTracker = {
    id: "tracker-123",
    user_id: "user-1",
    exam_name: "CPA Licensure Exam 2026",
    exam_date: "2026-10-15",
    description: "Aim for 90+ rating",
    is_archived: false,
    status: "in_progress",
    outcome_logged_at: null,
    retake_count: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false or tracker is null", () => {
    const { container } = render(
      <EditTrackerDialog isOpen={false} onClose={mockClose} tracker={mockTracker} />
    );
    expect(container).toBeEmptyDOMElement();

    const { container: containerNull } = render(
      <EditTrackerDialog isOpen={true} onClose={mockClose} tracker={null} />
    );
    expect(containerNull).toBeEmptyDOMElement();
  });

  it("renders dialog header and pre-filled form inputs when open", () => {
    render(<EditTrackerDialog isOpen={true} onClose={mockClose} tracker={mockTracker} />);

    expect(screen.getByText("Edit Exam Details")).toBeInTheDocument();
    expect(screen.getByLabelText(/Exam Name/i)).toHaveValue("CPA Licensure Exam 2026");
    expect(screen.getByLabelText(/Description/i)).toHaveValue("Aim for 90+ rating");
    // Pre-populate checklist field should NOT be rendered in Edit mode
    expect(
      screen.queryByRole("checkbox", { name: /Pre-populate default checklist columns/i })
    ).not.toBeInTheDocument();
  });

  it("invokes updateExamTrackerAction and onSuccess when submitted", async () => {
    const user = userEvent.setup();
    const updatedTracker = { ...mockTracker, exam_name: "Updated CPA 2026" };
    vi.mocked(updateExamTrackerAction).mockResolvedValueOnce(updatedTracker);

    render(
      <EditTrackerDialog
        isOpen={true}
        onClose={mockClose}
        tracker={mockTracker}
        onSuccess={mockSuccess}
      />
    );

    const examNameInput = screen.getByLabelText(/Exam Name/i);
    await user.clear(examNameInput);
    await user.type(examNameInput, "Updated CPA 2026");

    const saveBtn = screen.getByRole("button", { name: /Save Changes/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(updateExamTrackerAction).toHaveBeenCalledWith({
        trackerId: "tracker-123",
        exam_name: "Updated CPA 2026",
        exam_date: "2026-10-15",
        description: "Aim for 90+ rating",
      });
      expect(mockSuccess).toHaveBeenCalledWith(updatedTracker);
      expect(mockClose).toHaveBeenCalled();
    });
  });
});
