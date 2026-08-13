"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, isValid, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Trophy, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { Field, FieldLabel, FieldDescription, FieldContent } from "@/src/components/ui/field";
import { logExamOutcomeAction, archiveExamTrackerAction } from "@/src/lib/actions/trackers";
import type { ExamStatus } from "@/src/lib/types/database";

interface ExamOutcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  examTrackerId: string;
  examName: string;
}

export function ExamOutcomeDialog({
  isOpen,
  onClose,
  examTrackerId,
  examName,
}: ExamOutcomeDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedOutcome, setSelectedOutcome] = useState<"passed" | "retaking" | null>(null);
  const [nextExamDate, setNextExamDate] = useState<string>("");
  const [resetProgress, setResetProgress] = useState<boolean>(true);
  const [archiveOnPass, setArchiveOnPass] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [calendarBounds, setCalendarBounds] = useState<{ startMonth?: Date; endMonth?: Date }>({});

  React.useEffect(() => {
    const now = new Date();
    setCalendarBounds({
      startMonth: now,
      endMonth: new Date(now.getFullYear() + 2, 11),
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutcome) return;

    setErrorMessage(null);
    startTransition(async () => {
      try {
        await logExamOutcomeAction({
          trackerId: examTrackerId,
          status: selectedOutcome,
          newExamDate: selectedOutcome === "retaking" ? nextExamDate || null : undefined,
          resetProgress: selectedOutcome === "retaking" ? resetProgress : false,
        });

        if (selectedOutcome === "passed" && archiveOnPass) {
          await archiveExamTrackerAction(examTrackerId, true);
        }

        onClose();
        router.refresh();
      } catch (err: any) {
        setErrorMessage(err?.message || "Failed to log exam outcome");
      }
    });
  };

  const handleResetStatus = () => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await logExamOutcomeAction({
          trackerId: examTrackerId,
          status: "in_progress",
        });
        onClose();
        router.refresh();
      } catch (err: any) {
        setErrorMessage(err?.message || "Failed to reset exam status");
      }
    });
  };

  const validDate = nextExamDate ? parseISO(nextExamDate) : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Log Board Exam Outcome</DialogTitle>
          <DialogDescription className="text-xs">
            Record your official result for <strong>{examName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {errorMessage && (
            <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Outcome Choice Cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedOutcome("passed")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                selectedOutcome === "passed"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20"
                  : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <Trophy className="size-6 text-emerald-500" />
              <span className="text-sm">I Passed</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOutcome("retaking")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                selectedOutcome === "retaking"
                  ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-500/20"
                  : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <RotateCcw className="size-6 text-amber-500" />
              <span className="text-sm">Retaking</span>
            </button>
          </div>

          {/* Options for Passed */}
          {selectedOutcome === "passed" && (
            <Field orientation="horizontal" className="p-3 rounded-lg border border-border bg-muted/20 items-center">
              <Checkbox
                id="archiveOnPass"
                checked={archiveOnPass}
                onCheckedChange={(c) => setArchiveOnPass(!!c)}
              />
              <FieldContent>
                <FieldLabel htmlFor="archiveOnPass" className="text-xs font-semibold cursor-pointer">
                  Archive tracker to keep dashboard clean
                </FieldLabel>
              </FieldContent>
            </Field>
          )}

          {/* Options for Retaking */}
          {selectedOutcome === "retaking" && (
            <div className="space-y-4 pt-1 border-t border-border">
              <Field className="space-y-1.5">
                <FieldLabel htmlFor="nextExamDate">Next Target Exam Date</FieldLabel>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        id="nextExamDate"
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-9 text-xs border-input bg-background"
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 size-3.5 text-muted-foreground" />
                    {validDate && isValid(validDate) ? (
                      format(validDate, "PPP")
                    ) : (
                      <span className="text-muted-foreground">Pick next board exam date</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={validDate && isValid(validDate) ? validDate : undefined}
                      disabled={(date) => date < startOfDay(new Date())}
                      onSelect={(date) => setNextExamDate(date ? format(date, "yyyy-MM-dd") : "")}
                      endMonth={calendarBounds.endMonth}
                      startMonth={calendarBounds.startMonth}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </Field>

              <Field orientation="horizontal" className="p-3 rounded-lg border border-border bg-muted/20 items-start">
                <Checkbox
                  id="resetProgress"
                  checked={resetProgress}
                  onCheckedChange={(c) => setResetProgress(!!c)}
                  className="mt-0.5"
                />
                <FieldContent>
                  <FieldLabel htmlFor="resetProgress" className="text-xs font-semibold cursor-pointer block">
                    Reset review checkmarks for a fresh pass
                  </FieldLabel>
                  <FieldDescription className="text-[11px] text-muted-foreground">
                    Clears completed checkmarks while preserving your custom subjects, chapters, and topics.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </div>
          )}

          {/* Reset Status Row for Accidental Check-ins */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Need to make a correction?</span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleResetStatus}
              disabled={isPending}
              className="gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {isPending && <Loader2 className="size-3 animate-spin" />}
              Revert to In Progress
            </Button>
          </div>

          <DialogFooter className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedOutcome || isPending} className="gap-2">
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              Save Result
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
