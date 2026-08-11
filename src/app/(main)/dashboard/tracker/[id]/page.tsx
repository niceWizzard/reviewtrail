"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  CheckCircle2,
  BookOpen,
  LayoutGrid,
  ListFilter,
  Layers,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { useTrackerWorkspace } from "@/src/hooks/use-tracker-workspace";
import { useExamCountdown } from "@/src/hooks/use-exam-countdown";
import { useMediaQuery } from "@/src/hooks/use-media-query";
import { TrackerGridDesktop } from "@/src/components/tracker/tracker-grid-desktop";
import { TrackerAccordionMobile } from "@/src/components/tracker/tracker-accordion-mobile";
import { WorkspaceStructureEditor } from "@/src/components/tracker/workspace-structure-editor";

export default function TrackerWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const trackerId = resolvedParams.id;

  const { data: workspaceData, isLoading, error } = useTrackerWorkspace(trackerId);
  const countdown = useExamCountdown(workspaceData?.tracker.exam_date || null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 flex flex-col items-center justify-center min-h-[400px]">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-muted-foreground font-medium">Loading workspace syllabus...</p>
      </div>
    );
  }

  if (error || !workspaceData) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-destructive">Tracker Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested exam tracker could not be loaded or you do not have permission to view it.
        </p>
        <Button render={<Link href="/dashboard" />} size="sm" nativeButton={false}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const { tracker, stats } = workspaceData;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
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

        <WorkspaceStructureEditor examTrackerId={trackerId} />
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
              {workspaceData.sections.length} Section Columns
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Responsive Grid / Accordion Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <LayoutGrid className="size-5 text-primary" />
            Syllabus Review Matrix
          </h2>

          <Badge variant="outline" className="text-xs font-normal">
            {isMobile ? "Mobile Accordion View" : "Desktop Matrix Table View"}
          </Badge>
        </div>

        {isMobile ? (
          <TrackerAccordionMobile workspaceData={workspaceData} />
        ) : (
          <TrackerGridDesktop workspaceData={workspaceData} />
        )}
      </div>
    </div>
  );
}
