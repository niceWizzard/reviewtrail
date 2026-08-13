import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useExamCountdown } from "@/src/hooks/use-exam-countdown";

describe("useExamCountdown Hook", () => {
  it("handles null or missing exam date", () => {
    const { result } = renderHook(() => useExamCountdown(null));
    expect(result.current.formattedDate).toBe("Date not scheduled");
    expect(result.current.isToday).toBe(false);
    expect(result.current.isPassed).toBe(false);
  });

  it("identifies exam date as today", () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const { result } = renderHook(() => useExamCountdown(todayStr, "in_progress"));
    expect(result.current.isToday).toBe(true);
    expect(result.current.statusBadgeLabel).toBe("Exam Today");
    expect(result.current.statusBadgeVariant).toBe("destructive");
  });

  it("identifies past unchecked exam date", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const pastDateStr = pastDate.toISOString().split("T")[0];

    const { result } = renderHook(() => useExamCountdown(pastDateStr, "in_progress"));
    expect(result.current.isPastUnchecked).toBe(true);
    expect(result.current.statusBadgeVariant).toBe("destructive");
  });

  it("handles taken_waiting_results status override", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);

    const { result } = renderHook(() =>
      useExamCountdown(pastDate.toISOString(), "taken_waiting_results")
    );
    expect(result.current.isAwaitingResults).toBe(true);
    expect(result.current.statusBadgeLabel).toBe("Awaiting Results");
    expect(result.current.statusBadgeVariant).toBe("outline");
  });

  it("handles passed status override", () => {
    const { result } = renderHook(() => useExamCountdown("2026-05-01", "passed"));
    expect(result.current.isPassed).toBe(true);
    expect(result.current.statusBadgeLabel).toBe("Passed");
    expect(result.current.statusBadgeVariant).toBe("secondary");
  });

  it("handles retaking status & count", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const { result } = renderHook(() =>
      useExamCountdown(futureDate.toISOString(), "retaking", 1)
    );
    expect(result.current.isRetaking).toBe(true);
    expect(result.current.statusBadgeLabel).toContain("Retake Pass 2");
  });
});
