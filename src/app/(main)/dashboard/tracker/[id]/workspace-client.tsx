"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  BookOpen,
  LayoutGrid,
  Layers,
  Edit3,
  Lock,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { useExamCountdown } from "@/src/hooks/use-exam-countdown";
import { useMediaQuery } from "@/src/hooks/use-media-query";
import { TrackerGridDesktop } from "@/src/components/tracker/tracker-grid-desktop";
import { TrackerAccordionMobile } from "@/src/components/tracker/tracker-accordion-mobile";
import type { TrackerWorkspaceData } from "@/src/lib/types/database";
import { archiveExamTrackerAction } from "@/src/lib/actions/trackers";

import { ExamStatusBanner } from "@/src/components/tracker/exam-status-banner";
import { ExamOutcomeDialog } from "@/src/components/tracker/exam-outcome-dialog";

import { EditTrackerDialog } from "@/src/components/tracker/edit-tracker-dialog";

export function TrackerWorkspaceClient({
  examTrackerId,
  workspaceData,
}: {
  examTrackerId: string;
  workspaceData: TrackerWorkspaceData;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tracker, stats } = workspaceData;
  const countdown = useExamCountdown(
    tracker.exam_date || null,
    tracker.status,
    tracker.retake_count
  );
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isUnarchiving, setIsUnarchiving] = React.useState(false);

  const handleUnarchive = async () => {
    setIsUnarchiving(true);
    try {
      await archiveExamTrackerAction(examTrackerId, false);
      queryClient.invalidateQueries({ queryKey: ["workspace", examTrackerId] });
      router.refresh();
    } finally {
      setIsUnarchiving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Archived Read-Only Banner Notice */}
      {tracker.is_archived && (
        <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <AlertTitle className="text-sm font-semibold">Archived Workspace (Read-Only)</AlertTitle>
                <AlertDescription className="text-xs text-amber-800 dark:text-amber-300">
                  This tracker is archived. The workspace is currently in read-only mode and progress updates are disabled.
                </AlertDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={handleUnarchive}
              disabled={isUnarchiving}
              className="gap-1 bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-900 dark:text-amber-100 shrink-0"
            >
              <RotateCcw className="size-3.5" />
              {isUnarchiving ? "Unarchiving..." : "Unarchive Tracker"}
            </Button>
          </div>
        </Alert>
      )}

      {/* Status Banner Notice */}
      <ExamStatusBanner
        examTrackerId={examTrackerId}
        examName={tracker.exam_name}
        examDate={tracker.exam_date}
        status={tracker.status}
        isToday={countdown.isToday}
        isPastUnchecked={countdown.isPastUnchecked}
        isAwaitingResults={countdown.isAwaitingResults}
        onOpenOutcomeDialog={() => setIsOutcomeDialogOpen(true)}
        readOnly={tracker.is_archived}
      />

      {/* Outcome Dialog Modal */}
      <ExamOutcomeDialog
        isOpen={isOutcomeDialogOpen}
        onClose={() => setIsOutcomeDialogOpen(false)}
        examTrackerId={examTrackerId}
        examName={tracker.exam_name}
      />

      {/* Edit Tracker Dialog Modal */}
      <EditTrackerDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        tracker={tracker}
      />

      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Button
          render={<Link href="/dashboard" />}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          nativeButton={false}
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => !tracker.is_archived && setIsEditDialogOpen(true)}
            disabled={tracker.is_archived}
            title={tracker.is_archived ? "Unarchive tracker to enable" : undefined}
            className="gap-1.5 disabled:opacity-50"
          >
            <Edit3 className="size-4" />
            Edit Info
          </Button>

          {tracker.is_archived ? (
            <Button
              variant="default"
              size="sm"
              disabled={true}
              title="Unarchive tracker to enable"
              className="gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Edit3 className="size-4" />
              Edit Table
            </Button>
          ) : (
            <Button
              render={<Link href={`/dashboard/tracker/${examTrackerId}/edit`} />}
              variant="default"
              size="sm"
              className="gap-1.5 shadow-xs"
              nativeButton={false}
            >
              <Edit3 className="size-4" />
              Edit Table
            </Button>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <Card className="border-border shadow-xs bg-linear-to-r from-card via-card to-primary/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {tracker.exam_name}
                </h1>
                <Badge
                  variant={countdown.isUrgent ? "destructive" : "secondary"}
                  className="gap-1 font-semibold"
                >
                  <Calendar className="size-3" />
                  {countdown.statusLabel}
                </Badge>
                {tracker.is_archived && (
                  <Badge variant="outline" className="gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30">
                    <Lock className="size-3" />
                    Archived
                  </Badge>
                )}
              </div>
              {tracker.description && (
                <p className="text-sm text-muted-foreground max-w-2xl">{tracker.description}</p>
              )}
            </div>

            {/* Overall Progress Stat Box */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border shrink-0">
              <div className="flex flex-col text-right sm:text-left">
                <span className="text-xs text-muted-foreground font-medium">Overall Mastery</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-primary">
                    {stats.overallPercentage}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({stats.completedCheckboxes}/{stats.totalCheckboxes} items)
                  </span>
                </div>
              </div>
              <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                <CheckCircle2 className="size-5" />
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/60">
            <span className="flex items-center gap-1.5 font-medium">
              <BookOpen className="size-3.5 text-primary" />
              {stats.totalTopics} Total Topics
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="size-3.5 text-primary" />
              {workspaceData.subjects.length} Subjects
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="size-3.5 text-primary" />
              {workspaceData.checklists.length} Checklist Columns
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Responsive Grid / Accordion Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <LayoutGrid className="size-5 text-primary" />
            Review Table
          </h2>
        </div>

        {isMobile ? (
          <TrackerAccordionMobile workspaceData={workspaceData} readOnly={tracker.is_archived} />
        ) : (
          <TrackerGridDesktop workspaceData={workspaceData} readOnly={tracker.is_archived} />
        )}
      </div>
    </div>
  );
}
