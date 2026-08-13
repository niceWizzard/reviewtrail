"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Plus,
  ArrowRight,
  Archive,
  Trash2,
  Edit3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { useExamCountdown } from "@/src/hooks/use-exam-countdown";
import { SignOutButton } from "./sign-out-button";
import {
  archiveExamTrackerAction,
  deleteExamTrackerAction,
} from "@/src/lib/actions/trackers";
import type { ExamTracker } from "@/src/lib/types/database";
import { EditTrackerDialog } from "@/src/components/tracker/edit-tracker-dialog";

export function DashboardClient({ trackers }: { trackers: ExamTracker[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingTracker, setEditingTracker] = useState<ExamTracker | null>(null);

  const handleArchive = (trackerId: string, isArchived: boolean) => {
    startTransition(async () => {
      await archiveExamTrackerAction(trackerId, isArchived);
      router.refresh();
    });
  };

  const handleDelete = (trackerId: string) => {
    startTransition(async () => {
      await deleteExamTrackerAction(trackerId);
      router.refresh();
    });
  };

  const activeTrackers = trackers.filter((t) => !t.is_archived);
  const archivedTrackers = trackers.filter((t) => t.is_archived);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Examinee Dashboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your board exam review trackers, syllabus topics, and checklist progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button render={<Link href="/builder" />} size="sm" className="gap-2 shadow-sm" nativeButton={false}>
            <Plus className="size-4" />
            Create New Tracker
          </Button>
          <SignOutButton />
        </div>
      </div>

      {/* Trackers Grid */}
      {activeTrackers.length === 0 ? (
        <Card className="shadow-xs border-dashed border-2 flex flex-col justify-center items-center text-center p-12">
          <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <BookOpen className="size-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Active Review Trackers</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            You don't have any active exam trackers yet. Create your custom syllabus tracker to start checking off topics as you study!
          </p>
          <Button render={<Link href="/builder" />} size="default" className="gap-2 shadow-sm" nativeButton={false}>
            <Plus className="size-4" />
            Create Your First Tracker
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            Your Active Trackers ({activeTrackers.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTrackers.map((tracker) => (
              <TrackerCard
                key={tracker.id}
                tracker={tracker}
                onEdit={() => setEditingTracker(tracker)}
                onArchive={() => handleArchive(tracker.id, true)}
                onDelete={() => handleDelete(tracker.id)}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Archived Trackers */}
      {archivedTrackers.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
            <Archive className="size-4" />
            Archived Trackers ({archivedTrackers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
            {archivedTrackers.map((tracker) => (
              <TrackerCard
                key={tracker.id}
                tracker={tracker}
                onEdit={() => setEditingTracker(tracker)}
                onArchive={() => handleArchive(tracker.id, false)}
                onDelete={() => handleDelete(tracker.id)}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditTrackerDialog
        isOpen={editingTracker !== null}
        onClose={() => setEditingTracker(null)}
        tracker={editingTracker}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

function TrackerCard({
  tracker,
  onEdit,
  onArchive,
  onDelete,
  isPending,
}: {
  tracker: ExamTracker;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const countdown = useExamCountdown(tracker.exam_date);

  return (
    <Card className="shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <CardTitle className="text-lg font-bold truncate">{tracker.exam_name}</CardTitle>
          <Badge
            variant={countdown.isUrgent ? "destructive" : "secondary"}
            className="shrink-0 text-[11px]"
          >
            {countdown.statusLabel}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 text-xs">
          {tracker.description || "No description provided."}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-y border-border/60 py-2.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary" />
            <span>{countdown.formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            render={<Link href={`/dashboard/tracker/${tracker.id}`} />}
            size="sm"
            className="flex-1 gap-1.5"
            nativeButton={false}
          >
            Open Workspace
            <ArrowRight className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            disabled={isPending}
            title="Edit Tracker Details"
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onArchive}
            disabled={isPending}
            title={tracker.is_archived ? "Unarchive" : "Archive"}
            className="text-muted-foreground hover:text-foreground"
          >
            <Archive className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            disabled={isPending}
            title="Delete Tracker"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
