"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Calendar as CalendarIcon, Loader2, Flame, Hourglass, Trophy } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { markExamTakenAction, logExamOutcomeAction } from "@/src/lib/actions/trackers";
import type { ExamStatus } from "@/src/lib/types/database";

interface ExamStatusBannerProps {
  examTrackerId: string;
  examName: string;
  examDate: string | null;
  outcomeLoggedAt?: string | null;
  status: ExamStatus;
  isToday: boolean;
  isPastUnchecked: boolean;
  isAwaitingResults: boolean;
  onOpenOutcomeDialog: () => void;
  readOnly?: boolean;
}

export function ExamStatusBanner({
  examTrackerId,
  examDate,
  outcomeLoggedAt,
  status,
  isToday,
  isPastUnchecked,
  isAwaitingResults,
  onOpenOutcomeDialog,
  readOnly = false,
}: ExamStatusBannerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleMarkTaken = () => {
    if (readOnly) return;
    startTransition(async () => {
      await markExamTakenAction(examTrackerId);
      router.refresh();
    });
  };

  const effectiveStatus = status || "in_progress";

  if (isToday && (effectiveStatus === "in_progress" || effectiveStatus === "retaking")) {
    return (
      <Card className="border-primary/40 bg-primary/10 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Flame className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Your board exam is scheduled for today.</h3>
              <p className="text-xs text-muted-foreground">
                Mark your attendance once you&apos;ve completed the exam.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Button
              size="sm"
              onClick={handleMarkTaken}
              disabled={isPending || readOnly}
              title={readOnly ? "Unarchive tracker to enable" : undefined}
              className="gap-1.5 w-full sm:w-auto shadow-xs disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              I Took the Exam Today
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPastUnchecked) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Your scheduled exam date has passed</h3>
              <p className="text-xs text-muted-foreground">
                Let us know how it went or mark your exam status.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkTaken}
              disabled={isPending || readOnly}
              title={readOnly ? "Unarchive tracker to enable" : undefined}
              className="gap-1 text-xs disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              I Took the Exam
            </Button>
            <Button
              size="sm"
              onClick={onOpenOutcomeDialog}
              disabled={isPending || readOnly}
              title={readOnly ? "Unarchive tracker to enable" : undefined}
              className="gap-1 text-xs shadow-xs disabled:opacity-50"
            >
              Log Result
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleResetStatus = () => {
    if (readOnly) return;
    startTransition(async () => {
      await logExamOutcomeAction({
        trackerId: examTrackerId,
        status: "in_progress",
      });
      router.refresh();
    });
  };

  if (isAwaitingResults) {
    return (
      <Card className="border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-500/15 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Hourglass className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Exam Taken • Awaiting Board Results</h3>
              <p className="text-xs text-muted-foreground">
                Your exam has been recorded. Log your official result once board results are published.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap w-full sm:w-auto">
            <Button
              size="sm"
              onClick={onOpenOutcomeDialog}
              disabled={isPending || readOnly}
              title={readOnly ? "Unarchive tracker to enable" : undefined}
              className="gap-1.5 shadow-xs disabled:opacity-50"
            >
              <CalendarIcon className="size-3.5" />
              Log Official Result
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetStatus}
              disabled={isPending || readOnly}
              title={readOnly ? "Unarchive tracker to enable" : undefined}
              className="gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Clock className="size-3.5" />}
              Undo Check-in
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "passed") {
    const rawPassedDate = outcomeLoggedAt || examDate;
    const formattedPassedDate = rawPassedDate
      ? new Date(rawPassedDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

    return (
      <Card className="border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Trophy className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h3 className="font-bold text-sm text-foreground">Congratulations on Passing!</h3>
                {formattedPassedDate && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    Passed on {formattedPassedDate}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Your hard work paid off. You passed your licensure exam!{formattedPassedDate ? ` (Logged on ${formattedPassedDate})` : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
