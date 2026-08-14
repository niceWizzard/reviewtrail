"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/src/components/ui/alert-dialog";
import { Globe, Lock, Users, Sparkles, Trash2, ArrowUpRight, Eye, Pencil, Clock } from "lucide-react";
import type { TrackerTemplate } from "@/src/lib/types/template";
import { deleteTemplateAction } from "@/src/lib/actions/templates";

interface TemplateCardProps {
  template: TrackerTemplate;
  currentUserId?: string | null;
  onUseTemplate: (template: TrackerTemplate) => void;
  onPreviewTemplate?: (template: TrackerTemplate) => void;
  onRefresh?: () => void;
}

export function TemplateCard({
  template,
  currentUserId,
  onUseTemplate,
  onPreviewTemplate,
  onRefresh,
}: TemplateCardProps) {
  const isOwner = currentUserId && template.user_id === currentUserId;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteTemplateAction(template.id);
      setIsDeleteDialogOpen(false);
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const subjectCount = template.structure?.subjects?.length || 0;
  const checklistCount = template.structure?.checklists?.length || 0;
  const formattedUpdatedAt = template.updated_at
    ? format(new Date(template.updated_at), "MMM d, yyyy")
    : null;

  return (
    <>
      <Card className="flex flex-col justify-between hover:shadow-sm hover:border-border/80 transition-all duration-200">
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-xs font-medium">
              {template.category || "Custom"}
            </Badge>

            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {template.is_public ? (
                <>
                  <Globe className="size-3 text-emerald-500" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="size-3 text-muted-foreground" />
                  <span>Private</span>
                </>
              )}
            </span>
          </div>

          <div>
            <CardTitle className="text-sm font-semibold line-clamp-1 leading-snug">
              {template.title}
            </CardTitle>
            {template.description && (
              <CardDescription className="text-xs line-clamp-2 mt-1">
                {template.description}
              </CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent className="py-2 space-y-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="size-3 text-primary" />
              {subjectCount} {subjectCount === 1 ? "Subject" : "Subjects"}
            </span>
            <span>&bull;</span>
            <span>{checklistCount} Stages</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="size-3" />
              {template.use_count || 0} {template.use_count === 1 ? "use" : "uses"}
            </span>

            {formattedUpdatedAt && (
              <span className="flex items-center gap-1 text-muted-foreground" title="Last updated">
                <Clock className="size-3" />
                {formattedUpdatedAt}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-border flex items-center gap-2">
          {onPreviewTemplate && (
            <Button
              variant="outline"
              onClick={() => onPreviewTemplate(template)}
              size="sm"
              className="flex-1 gap-1.5 text-xs"
            >
              <Eye className="size-3.5" /> Preview
            </Button>
          )}

          <Button
            onClick={() => onUseTemplate(template)}
            size="sm"
            className="flex-1 gap-1.5 text-xs font-medium"
          >
            Use <ArrowUpRight className="size-3.5" />
          </Button>

          {isOwner && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                render={<Link href={`/templates/${template.id}/edit`} />}
                variant="ghost"
                size="sm"
                nativeButton={false}
                className="size-8 p-0"
                title="Edit template"
              >
                <Pencil className="size-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                onClick={() => setIsDeleteDialogOpen(true)}
                className="size-8 p-0 text-muted-foreground hover:text-destructive"
                title="Delete template"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{template.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Existing trackers created from this template will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
