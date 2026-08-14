"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import { Label } from "@/src/components/ui/label";
import { Globe, Lock, Loader2 } from "lucide-react";
import { createTemplateFromTrackerAction } from "@/src/lib/actions/templates";
import { ErrorAlert } from "@/src/app/(main)/builder/components/error-alert";

const CATEGORIES = ["Medical", "Engineering", "Accountancy", "Law", "Nursing", "Custom"];

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackerId: string;
  defaultTitle?: string;
  onSuccess?: () => void;
}

export function SaveAsTemplateModal({
  isOpen,
  onClose,
  trackerId,
  defaultTitle = "",
  onSuccess,
}: SaveAsTemplateModalProps) {
  const [title, setTitle] = useState(defaultTitle ? `${defaultTitle} Template` : "");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Custom");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a template title.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await createTemplateFromTrackerAction({
        trackerId,
        metadata: {
          title: title.trim(),
          description: description.trim() || null,
          category,
          is_public: isPublic,
        },
      });

      setIsSaving(false);
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Failed to save template");
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Save as Template</DialogTitle>
          <DialogDescription className="text-sm">
            Create a reusable template snapshot from this tracker. Progress checkmarks are reset in templates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <ErrorAlert errorMessage={error} onClear={() => setError(null)} />

          <div className="space-y-1.5">
            <Label htmlFor="template-title" className="text-xs font-semibold">
              Template Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="template-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Physician Licensure Exam 2026 Template"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-desc" className="text-xs font-semibold">
              Description (Optional)
            </Label>
            <Textarea
              id="template-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the topics and review stages covered in this template..."
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Category</Label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  className="cursor-pointer px-2.5 py-1 text-xs"
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <Label className="text-xs font-semibold">Visibility Setting</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-3 rounded-lg border text-left transition-colors flex items-start gap-2.5 ${
                  !isPublic ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border text-muted-foreground hover:bg-accent/50"
                }`}
              >
                <Lock className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Private</div>
                  <div className="text-[10px] text-muted-foreground">Only visible to you</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-3 rounded-lg border text-left transition-colors flex items-start gap-2.5 ${
                  isPublic ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border text-muted-foreground hover:bg-accent/50"
                }`}
              >
                <Globe className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Public</div>
                  <div className="text-[10px] text-muted-foreground">Visible in Community Hub</div>
                </div>
              </button>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Saving...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
