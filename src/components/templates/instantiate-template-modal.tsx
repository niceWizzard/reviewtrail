"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import type { TrackerTemplate } from "@/src/lib/types/template";
import { instantiateTrackerFromTemplateAction } from "@/src/lib/actions/templates";
import { ErrorAlert } from "@/src/app/(main)/builder/components/error-alert";

interface InstantiateTemplateModalProps {
  template: TrackerTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InstantiateTemplateModal({
  template,
  isOpen,
  onClose,
}: InstantiateTemplateModalProps) {
  const router = useRouter();
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (template) {
      setExamName(template.title);
      setExamDate("");
      setError(null);
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;
    if (!examName.trim()) {
      setError("Please enter a name for your tracker.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const tracker = await instantiateTrackerFromTemplateAction({
        templateId: template.id,
        exam_name: examName.trim(),
        exam_date: examDate || null,
      });

      setIsSubmitting(false);
      onClose();
      router.push(`/dashboard/tracker/${tracker.id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to create tracker from template");
      setIsSubmitting(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Create Tracker from Template
          </DialogTitle>
          <DialogDescription className="text-sm">
            Instantiate <strong>{template.title}</strong> into your personal study workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <ErrorAlert errorMessage={error} onClear={() => setError(null)} />

          <div className="space-y-1.5">
            <Label htmlFor="exam-name" className="text-xs font-semibold">
              Exam Tracker Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="exam-name"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g. My CPA Licensure Review Tracker"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exam-date" className="text-xs font-semibold">
              Target Exam Date (Optional)
            </Label>
            <Input
              id="exam-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Launching Tracker...
                </>
              ) : (
                "Launch Tracker"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
