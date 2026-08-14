import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TrackerWorkspaceClient } from "./workspace-client";
import type { TrackerWorkspaceData } from "@/src/lib/types/database";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function renderWithClient(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

const mockWorkspaceData: TrackerWorkspaceData = {
  tracker: {
    id: "tracker-1",
    user_id: "user-1",
    exam_name: "USMLE Step 1",
    exam_date: "2026-12-01",
    description: "Sample Description",
    status: "in_progress",
    retake_count: 0,
    is_archived: false,
    outcome_logged_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  checklists: [
    { id: "sec-1", exam_tracker_id: "tracker-1", name: "Read", position: 1, color: null, created_at: "" },
  ],
  subjects: [
    { id: "sub-1", exam_tracker_id: "tracker-1", name: "Anatomy", position: 1, color: null, created_at: "", updated_at: "" },
  ],
  chapters: [],
  topics: [
    { id: "top-1", exam_tracker_id: "tracker-1", subject_id: "sub-1", chapter_id: null, name: "Gross Anatomy", position: 1, created_at: "", updated_at: "" },
  ],
  progress: [],
  subjectTree: [
    {
      id: "sub-1",
      exam_tracker_id: "tracker-1",
      name: "Anatomy",
      position: 1,
      color: null,
      created_at: "",
      updated_at: "",
      chapters: [],
      ungroupedTopics: [
        { id: "top-1", exam_tracker_id: "tracker-1", subject_id: "sub-1", chapter_id: null, name: "Gross Anatomy", position: 1, created_at: "", updated_at: "" },
      ],
    },
  ],
  stats: {
    totalTopics: 1,
    completedCheckboxes: 0,
    totalCheckboxes: 1,
    overallPercentage: 0,
  },
};

describe("TrackerWorkspaceClient Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders active workspace with edit buttons", () => {
    renderWithClient(
      <TrackerWorkspaceClient
        examTrackerId="tracker-1"
        workspaceData={mockWorkspaceData}
      />
    );

    expect(screen.getByText("USMLE Step 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit info/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit table/i })).toBeInTheDocument();
    expect(screen.queryByText(/archived workspace \(read-only\)/i)).not.toBeInTheDocument();
  });

  it("renders read-only archived workspace banner and disables edit buttons when archived", () => {
    const archivedData: TrackerWorkspaceData = {
      ...mockWorkspaceData,
      tracker: {
        ...mockWorkspaceData.tracker,
        is_archived: true,
      },
    };

    renderWithClient(
      <TrackerWorkspaceClient
        examTrackerId="tracker-1"
        workspaceData={archivedData}
      />
    );

    expect(screen.getByText(/archived workspace \(read-only\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /unarchive tracker/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit info/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /edit table/i })).toBeDisabled();
  });
});
