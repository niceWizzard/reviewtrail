"use client";

import React, { useState, useEffect } from "react";
import { Edit3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import type { ExamTracker } from "@/src/lib/types/database";
import { updateExamTrackerAction } from "@/src/lib/actions/trackers";
import { TrackerInfoForm, TrackerInfoValues } from "./tracker-info-form";

export interface EditTrackerDialogProps {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
    }
  }, [isOpen, tracker]);

  if (!tracker) return null;

  const handleSubmit = async (values: TrackerInfoValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const updated = await updateExamTrackerAction({
        trackerId: tracker.id,
        exam_name: values.examName.trim(),
        exam_date: values.examDate || null,
        description: values.description ? values.description.trim() : null,
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
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Edit3 className="size-5 text-primary" />
            Edit Exam Details
          </DialogTitle>
          <DialogDescription>
            Update your board exam title, target exam date, or notes.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          <TrackerInfoForm
            key={`${tracker.id}-${isOpen}`}
            initialValues={{
              examName: tracker.exam_name || "",
              examDate: tracker.exam_date || "",
              description: tracker.description || "",
              prepopulateColumns: false,
            }}
            showPrepopulateOption={false}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
            onCancel={onClose}
            onSubmit={handleSubmit}
            errorMessage={errorMsg}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

