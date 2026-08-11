import React, { Suspense } from "react";
import { fetchExamTrackersAction } from "@/src/lib/actions/trackers";
import { DashboardClient } from "./dashboard-client";

async function DashboardContent() {
  const trackers = await fetchExamTrackersAction();
  return <DashboardClient trackers={trackers} />;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl px-4 py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
          <p className="text-sm text-muted-foreground font-medium">Loading your examinee dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
