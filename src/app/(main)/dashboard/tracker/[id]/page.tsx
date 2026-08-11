import React, { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { fetchTrackerWorkspaceAction } from "@/src/lib/actions/workspace";
import { TrackerWorkspaceClient } from "./workspace-client";

async function WorkspaceContent({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = await paramsPromise;
  try {
    const workspaceData = await fetchTrackerWorkspaceAction(id);

    if (!workspaceData || !workspaceData.tracker) {
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

    return <TrackerWorkspaceClient examTrackerId={id} workspaceData={workspaceData} />;
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

export default function TrackerWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl px-4 py-16 flex flex-col items-center justify-center min-h-[400px]">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
          <p className="text-sm text-muted-foreground font-medium">Loading workspace syllabus...</p>
        </div>
      }
    >
      <WorkspaceContent paramsPromise={params} />
    </Suspense>
  );
}
