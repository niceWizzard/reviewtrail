import React, { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { fetchTrackerWorkspaceAction } from "@/src/lib/actions/workspace";
import { TrackerEditorClient } from "./tracker-editor-client";

async function EditorContent({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = await paramsPromise;
  try {
    const workspaceData = await fetchTrackerWorkspaceAction(id);

    if (!workspaceData || !workspaceData.tracker) {
      return (
        <div className="container mx-auto max-w-7xl px-4 py-12 text-center space-y-4">
          <h2 className="text-xl font-bold text-destructive">Tracker Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The requested exam tracker could not be loaded or you do not have permission to edit it.
          </p>
          <Button render={<Link href="/dashboard" />} size="sm" nativeButton={false}>
            Back to Dashboard
          </Button>
        </div>
      );
    }

    if (workspaceData.tracker.is_archived) {
      return (
        <div className="container mx-auto max-w-7xl px-4 py-12 text-center space-y-4">
          <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400">Tracker is Archived</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            This exam tracker is archived and cannot be edited. Please unarchive it from the workspace or dashboard to make changes.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button render={<Link href={`/dashboard/tracker/${id}`} />} size="sm" nativeButton={false}>
              Go to Workspace
            </Button>
            <Button variant="outline" render={<Link href="/dashboard" />} size="sm" nativeButton={false}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return (
      <TrackerEditorClient
        key={workspaceData.tracker.updated_at || id}
        examTrackerId={id}
        initialWorkspaceData={workspaceData}
      />
    );
  } catch (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-destructive">Tracker Not Found</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "The requested exam tracker could not be loaded."}
        </p>
        <Button render={<Link href="/dashboard" />} size="sm" nativeButton={false}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
}

export default function TrackerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl px-4 py-16 flex flex-col items-center justify-center min-h-[400px]">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
          <p className="text-sm text-muted-foreground font-medium">Loading dedicated table editor...</p>
        </div>
      }
    >
      <EditorContent paramsPromise={params} />
    </Suspense>
  );
}
