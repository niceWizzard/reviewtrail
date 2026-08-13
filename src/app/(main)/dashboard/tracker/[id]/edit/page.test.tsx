import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TrackerEditorClient } from "./tracker-editor-client";
import { saveTrackerWorkspaceEditAction } from "@/src/lib/actions/trackers";

vi.mock("@/src/lib/actions/trackers", () => ({
  saveTrackerWorkspaceEditAction: vi.fn().mockResolvedValue(undefined),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

describe("TrackerEditorClient Component (Local Draft State)", () => {
  const mockWorkspaceData = {
    tracker: {
      id: "tracker-1",
      exam_name: "CPA Licensure Exam",
      exam_date: "2026-10-15",
      description: "Full study tracker",
    },
    checklists: [
      { id: "col-1", name: "1st Read", position: 1 },
      { id: "col-2", name: "Notes", position: 2 },
    ],
    subjects: [{ id: "sub-1", name: "Auditing", position: 1 }],
    chapters: [{ id: "ch-1", subject_id: "sub-1", name: "Internal Controls", position: 1 }],
    topics: [{ id: "top-1", subject_id: "sub-1", chapter_id: "ch-1", name: "Control Risk", position: 1 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders local draft editor page header and tracker title", () => {
    render(
      <TrackerEditorClient
        examTrackerId="tracker-1"
        initialWorkspaceData={mockWorkspaceData as any}
      />
    );

    expect(screen.getByText(/Edit Tracker Table: CPA Licensure Exam/i)).toBeInTheDocument();
    expect(screen.getAllByText("Save Changes")[0]).toBeInTheDocument();
    expect(screen.getByText("Cancel / Back to Workspace")).toBeInTheDocument();
  });

  it("updates item name locally when double-clicked without immediately calling server action", async () => {
    const user = userEvent.setup();
    render(
      <TrackerEditorClient
        examTrackerId="tracker-1"
        initialWorkspaceData={mockWorkspaceData as any}
      />
    );

    const topicTitle = screen.getByText("Control Risk");
    fireEvent.doubleClick(topicTitle);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Advanced Control Risk{Enter}");

    expect(saveTrackerWorkspaceEditAction).not.toHaveBeenCalled();
    expect(screen.getByText("Advanced Control Risk")).toBeInTheDocument();
    expect(screen.getByText("Unsaved Edits")).toBeInTheDocument();
  });

  it("invokes saveTrackerWorkspaceEditAction when Save Changes is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TrackerEditorClient
        examTrackerId="tracker-1"
        initialWorkspaceData={mockWorkspaceData as any}
      />
    );

    await user.click(screen.getByRole("button", { name: /Save Changes/i }));

    expect(saveTrackerWorkspaceEditAction).toHaveBeenCalledWith({
      trackerId: "tracker-1",
      draft: expect.objectContaining({
        examName: "CPA Licensure Exam",
      }),
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard/tracker/tracker-1");
  });
});
