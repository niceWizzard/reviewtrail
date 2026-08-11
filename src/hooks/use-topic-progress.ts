"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertTopicProgressAction, updateProgressNotesAction } from "@/src/lib/actions/progress";
import type { TrackerWorkspaceData } from "@/src/lib/types/database";

export function useTopicProgress(examTrackerId: string) {
  const queryClient = useQueryClient();
  const workspaceQueryKey = ["workspace", examTrackerId];

  const toggleMutation = useMutation({
    mutationFn: (payload: { topicId: string; sectionId: string; isCompleted: boolean }) =>
      upsertTopicProgressAction({
        exam_tracker_id: examTrackerId,
        topic_id: payload.topicId,
        section_id: payload.sectionId,
        is_completed: payload.isCompleted,
      }),
    onMutate: async (newProgress) => {
      await queryClient.cancelQueries({ queryKey: workspaceQueryKey });
      const previousData = queryClient.getQueryData<TrackerWorkspaceData>(workspaceQueryKey);

      if (previousData) {
        const updatedProgress = [...previousData.progress];
        const index = updatedProgress.findIndex(
          (p) => p.topic_id === newProgress.topicId && p.section_id === newProgress.sectionId
        );

        if (index > -1) {
          updatedProgress[index] = {
            ...updatedProgress[index],
            is_completed: newProgress.isCompleted,
            completed_at: newProgress.isCompleted ? new Date().toISOString() : null,
          };
        } else {
          updatedProgress.push({
            id: `temp-${Date.now()}`,
            exam_tracker_id: examTrackerId,
            topic_id: newProgress.topicId,
            section_id: newProgress.sectionId,
            is_completed: newProgress.isCompleted,
            completed_at: newProgress.isCompleted ? new Date().toISOString() : null,
            notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        const totalCheckboxes = previousData.stats.totalCheckboxes;
        const completedCheckboxes = updatedProgress.filter((p) => p.is_completed).length;
        const overallPercentage =
          totalCheckboxes > 0 ? Math.round((completedCheckboxes / totalCheckboxes) * 100) : 0;

        queryClient.setQueryData<TrackerWorkspaceData>(workspaceQueryKey, {
          ...previousData,
          progress: updatedProgress,
          stats: {
            ...previousData.stats,
            completedCheckboxes,
            overallPercentage,
          },
        });
      }

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(workspaceQueryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKey });
    },
  });

  const notesMutation = useMutation({
    mutationFn: (payload: { topicId: string; sectionId: string; notes: string }) =>
      updateProgressNotesAction({
        exam_tracker_id: examTrackerId,
        topic_id: payload.topicId,
        section_id: payload.sectionId,
        notes: payload.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKey });
    },
  });

  return {
    toggleProgress: (topicId: string, sectionId: string, isCompleted: boolean) =>
      toggleMutation.mutate({ topicId, sectionId, isCompleted }),
    updateNotes: (topicId: string, sectionId: string, notes: string) =>
      notesMutation.mutateAsync({ topicId, sectionId, notes }),
    isToggling: toggleMutation.isPending,
  };
}
