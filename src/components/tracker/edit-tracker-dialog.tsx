"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Edit3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Field, FieldLabel } from "@/src/components/ui/field";
import type { ExamTracker } from "@/src/lib/types/database";
import { updateExamTrackerAction } from "@/src/lib/actions/trackers";

interface EditTrackerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tracker: ExamTracker | null;
  onSuccess?: (updatedTracker: ExamTracker) => void;
}

export function EditTrackerDialog({
  isOpen,
  onClose,
  tracker,
  onSuccess,
}: EditTrackerDialogProps) {
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (tracker) {
      setExamName(tracker.exam_name || "");
      setExamDate(tracker.exam_date || "");
      setDescription(tracker.description || "");
      setErrorMsg(null);
    }
  }, [tracker, isOpen]);

  if (!tracker) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = examName.trim();
    if (!trimmedName) {
      setErrorMsg("Exam name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const updated = await updateExamTrackerAction({
        trackerId: tracker.id,
        exam_name: trimmedName,
        exam_date: examDate || null,
        description: description ? description.trim() : null,
      });

      if (onSuccess) onSuccess(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update exam tracker.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Edit3 className="size-5 text-primary" />
              Edit Exam Details
            </DialogTitle>
            <DialogDescription>
              Update your board exam title, target exam date, or notes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {errorMsg && (
              <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                {errorMsg}
              </div>
            )}

            <Field className="space-y-1">
              <FieldLabel htmlFor="edit-exam-name">Exam Name *</FieldLabel>
              <Input
                id="edit-exam-name"
                required
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. CPA Licensure Exam 2026"
              />
            </Field>

            <Field className="space-y-1">
              <FieldLabel htmlFor="edit-exam-date">Target Exam Date</FieldLabel>
              <Input
                id="edit-exam-date"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </Field>

            <Field className="space-y-1">
              <FieldLabel htmlFor="edit-description">Description / Notes</FieldLabel>
              <Textarea
                id="edit-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Target score, review center details, or focus strategy..."
              />
            </Field>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !examName.trim()} className="gap-2">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
