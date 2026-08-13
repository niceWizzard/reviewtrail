import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ExamStatusBanner } from "./exam-status-banner";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/src/lib/actions/trackers", () => ({
  markExamTakenAction: vi.fn().mockResolvedValue(undefined),
}));

describe("ExamStatusBanner Component", () => {
  it("renders Exam Day banner on exam date", () => {
    render(
      <ExamStatusBanner
        examTrackerId="tracker-1"
        examName="CPALE 2026"
        examDate="2026-08-13"
        status="in_progress"
        isToday={true}
        isPastUnchecked={false}
        isAwaitingResults={false}
        onOpenOutcomeDialog={vi.fn()}
      />
    );

    expect(screen.getByText(/Your board exam is scheduled for today/i)).toBeInTheDocument();
    expect(screen.getByText(/I Took the Exam Today/i)).toBeInTheDocument();
  });

  it("renders Exam Day banner on exam date when status is retaking", () => {
    render(
      <ExamStatusBanner
        examTrackerId="tracker-1"
        examName="CPALE 2026"
        examDate="2026-08-13"
        status="retaking"
        isToday={true}
        isPastUnchecked={false}
        isAwaitingResults={false}
        onOpenOutcomeDialog={vi.fn()}
      />
    );

    expect(screen.getByText(/Your board exam is scheduled for today/i)).toBeInTheDocument();
    expect(screen.getByText(/I Took the Exam Today/i)).toBeInTheDocument();
  });

  it("renders Past Date Unchecked banner when exam date has passed", () => {
    render(
      <ExamStatusBanner
        examTrackerId="tracker-1"
        examName="CPALE 2026"
        examDate="2026-08-10"
        status="in_progress"
        isToday={false}
        isPastUnchecked={true}
        isAwaitingResults={false}
        onOpenOutcomeDialog={vi.fn()}
      />
    );

    expect(screen.getByText(/Your scheduled exam date has passed/i)).toBeInTheDocument();
    expect(screen.getByText(/Log Result/i)).toBeInTheDocument();
  });

  it("renders Awaiting Results banner when status is taken_waiting_results", () => {
    render(
      <ExamStatusBanner
        examTrackerId="tracker-1"
        examName="CPALE 2026"
        examDate="2026-08-10"
        status="taken_waiting_results"
        isToday={false}
        isPastUnchecked={false}
        isAwaitingResults={true}
        onOpenOutcomeDialog={vi.fn()}
      />
    );

    expect(screen.getByText(/Exam Taken • Awaiting Board Results/i)).toBeInTheDocument();
    expect(screen.getByText(/Log Official Result/i)).toBeInTheDocument();
  });
});
