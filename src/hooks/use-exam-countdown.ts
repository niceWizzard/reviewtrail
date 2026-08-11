"use client";

import { useMemo } from "react";

export interface ExamCountdownResult {
  daysRemaining: number | null;
  formattedDate: string;
  statusLabel: string;
  isUrgent: boolean;
  isPassed: boolean;
}

export function useExamCountdown(examDateInput: string | Date | null): ExamCountdownResult {
  return useMemo(() => {
    if (!examDateInput) {
      return {
        daysRemaining: null,
        formattedDate: "Date not scheduled",
        statusLabel: "Date not scheduled",
        isUrgent: false,
        isPassed: false,
      };
    }

    const examDate = new Date(examDateInput);
    if (isNaN(examDate.getTime())) {
      return {
        daysRemaining: null,
        formattedDate: "Invalid Date",
        statusLabel: "Invalid Date",
        isUrgent: false,
        isPassed: false,
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

    if (diffDays < 0) {
      return {
        daysRemaining: diffDays,
        formattedDate,
        statusLabel: `Exam passed (${Math.abs(diffDays)}d ago)`,
        isUrgent: false,
        isPassed: true,
      };
    }

    if (diffDays === 0) {
      return {
        daysRemaining: 0,
        formattedDate,
        statusLabel: "Exam is today!",
        isUrgent: true,
        isPassed: false,
      };
    }

    return {
      daysRemaining: diffDays,
      formattedDate,
      statusLabel: `${diffDays} Day${diffDays === 1 ? "" : "s"} Remaining`,
      isUrgent: diffDays <= 14,
      isPassed: false,
    };
  }, [examDateInput]);
}
