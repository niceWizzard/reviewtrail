import { useMemo } from "react";
import type { ExamStatus } from "@/src/lib/types/database";

export interface ExamCountdownResult {
  daysRemaining: number | null;
  formattedDate: string;
  statusLabel: string;
  isUrgent: boolean;
  isToday: boolean;
  isPastUnchecked: boolean;
  isAwaitingResults: boolean;
  isPassed: boolean;
  isRetaking: boolean;
  statusBadgeLabel: string;
  statusBadgeVariant: "default" | "secondary" | "destructive" | "outline";
}

function parseLocalDate(dateInput: string | Date): Date {
  if (typeof dateInput === "string") {
    const cleanStr = dateInput.split("T")[0];
    const parts = cleanStr.split("-");
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
  }
  return new Date(dateInput);
}

export function useExamCountdown(
  examDateInput: string | Date | null,
  status: ExamStatus = "in_progress",
  retakeCount = 0
): ExamCountdownResult {
  return useMemo(() => {
    // 1. Status-overriding flags
    if (status === "passed") {
      return {
        daysRemaining: null,
        formattedDate: examDateInput
          ? parseLocalDate(examDateInput).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",
        statusLabel: "Passed",
        isUrgent: false,
        isToday: false,
        isPastUnchecked: false,
        isAwaitingResults: false,
        isPassed: true,
        isRetaking: false,
        statusBadgeLabel: "Passed",
        statusBadgeVariant: "secondary",
      };
    }

    if (status === "taken_waiting_results") {
      return {
        daysRemaining: null,
        formattedDate: examDateInput
          ? parseLocalDate(examDateInput).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",
        statusLabel: "Awaiting Results",
        isUrgent: false,
        isToday: false,
        isPastUnchecked: false,
        isAwaitingResults: true,
        isPassed: false,
        isRetaking: false,
        statusBadgeLabel: "Awaiting Results",
        statusBadgeVariant: "outline",
      };
    }

    if (!examDateInput) {
      return {
        daysRemaining: null,
        formattedDate: "Date not scheduled",
        statusLabel: "Date not scheduled",
        isUrgent: false,
        isToday: false,
        isPastUnchecked: false,
        isAwaitingResults: false,
        isPassed: false,
        isRetaking: false,
        statusBadgeLabel: "Date not scheduled",
        statusBadgeVariant: "secondary",
      };
    }

    const examDate = parseLocalDate(examDateInput);
    if (isNaN(examDate.getTime())) {
      return {
        daysRemaining: null,
        formattedDate: "Invalid Date",
        statusLabel: "Invalid Date",
        isUrgent: false,
        isToday: false,
        isPastUnchecked: false,
        isAwaitingResults: false,
        isPassed: false,
        isRetaking: false,
        statusBadgeLabel: "Invalid Date",
        statusBadgeVariant: "secondary",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(examDate);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = examDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const isRetakeCycle = status === "retaking" || retakeCount > 0;

    if (diffDays < 0) {
      return {
        daysRemaining: diffDays,
        formattedDate,
        statusLabel: `Date Passed (${Math.abs(diffDays)}d ago)`,
        isUrgent: false,
        isToday: false,
        isPastUnchecked: status === "in_progress" || status === "retaking",
        isAwaitingResults: false,
        isPassed: false,
        isRetaking: isRetakeCycle,
        statusBadgeLabel: `Date Passed (${Math.abs(diffDays)}d ago)`,
        statusBadgeVariant: "destructive",
      };
    }

    if (diffDays === 0) {
      return {
        daysRemaining: 0,
        formattedDate,
        statusLabel: "Exam is today!",
        isUrgent: true,
        isToday: true,
        isPastUnchecked: false,
        isAwaitingResults: false,
        isPassed: false,
        isRetaking: isRetakeCycle,
        statusBadgeLabel: "Exam Today",
        statusBadgeVariant: "destructive",
      };
    }

    const remainingLabel = isRetakeCycle
      ? `${diffDays} Day${diffDays === 1 ? "" : "s"} Left (Retake Pass ${retakeCount + 1})`
      : `${diffDays} Day${diffDays === 1 ? "" : "s"} Remaining`;

    return {
      daysRemaining: diffDays,
      formattedDate,
      statusLabel: remainingLabel,
      isUrgent: diffDays <= 14,
      isToday: false,
      isPastUnchecked: false,
      isAwaitingResults: false,
      isPassed: false,
      isRetaking: isRetakeCycle,
      statusBadgeLabel: remainingLabel,
      statusBadgeVariant: diffDays <= 14 ? "destructive" : "secondary",
    };
  }, [examDateInput, status, retakeCount]);
}
