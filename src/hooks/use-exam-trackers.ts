"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchExamTrackersAction,
  createExamTrackerAction,
  archiveExamTrackerAction,
  deleteExamTrackerAction,
} from "@/src/lib/actions/trackers";

export function useExamTrackers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["exam_trackers"],
    queryFn: fetchExamTrackersAction,
  });


  const createMutation = useMutation({
    mutationFn: createExamTrackerAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam_trackers"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: ({ trackerId, isArchived }: { trackerId: string; isArchived: boolean }) =>
      archiveExamTrackerAction(trackerId, isArchived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam_trackers"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExamTrackerAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam_trackers"] });
    },
  });

  return {
    trackers: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createTracker: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    archiveTracker: archiveMutation.mutateAsync,
    deleteTracker: deleteMutation.mutateAsync,
  };
}
