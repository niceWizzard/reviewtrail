"use client";

import React from "react";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Globe, Lock, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

const CATEGORIES = ["Medical", "Engineering", "Accountancy", "Law", "Nursing", "Custom"] as const;

interface TemplateMetaFormProps {
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onIsPublicChange: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
}

export function TemplateMetaForm({
  title,
  description,
  category,
  isPublic,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onIsPublicChange,
  onSubmit,
  submitLabel,
}: TemplateMetaFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="template-title">
          Template Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="template-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g. Master CPA Board Exam Review Plan"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="template-description">Description</Label>
        <Textarea
          id="template-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Provide context on what syllabus, review centers, or subjects this covers..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                category === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-border">
        <Label>Visibility</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onIsPublicChange(false)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors flex items-start gap-2.5",
              !isPublic
                ? "border-primary bg-primary/5"
                : "border-border text-muted-foreground hover:bg-accent/50"
            )}
          >
            <Lock className="size-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold">Private</div>
              <div className="text-[11px] text-muted-foreground">Only visible to you</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onIsPublicChange(true)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors flex items-start gap-2.5",
              isPublic
                ? "border-primary bg-primary/5"
                : "border-border text-muted-foreground hover:bg-accent/50"
            )}
          >
            <Globe className="size-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold">Public</div>
              <div className="text-[11px] text-muted-foreground">Visible in Community Hub</div>
            </div>
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-border">
        <Button type="submit" className="gap-1.5">
          {submitLabel} <ChevronRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}
