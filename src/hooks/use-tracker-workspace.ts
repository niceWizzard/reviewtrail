"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTrackerWorkspaceAction } from "@/src/lib/actions/workspace";
import {
  createSubjectAction,
  createChapterAction,
  createTopicAction,
  createTrackerChecklistAction,
  deleteTopicAction,
  deleteSubjectAction,
  deleteChapterAction,
  deleteTrackerChecklistAction,
  updateTopicChapterAction,
} from "@/src/lib/actions/structure";

export function useTrackerWorkspace(examTrackerId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["workspace", examTrackerId];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchTrackerWorkspaceAction(examTrackerId),
    enabled: !!examTrackerId,
  });


  const addSubjectMutation = useMutation({
    mutationFn: (payload: { name: string; color?: string }) =>
      createSubjectAction({ exam_tracker_id: examTrackerId, ...payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const addChapterMutation = useMutation({
    mutationFn: (payload: { subjectId: string; name: string; description?: string }) =>
      createChapterAction({
        exam_tracker_id: examTrackerId,
        subject_id: payload.subjectId,
        name: payload.name,
        description: payload.description,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const addTopicMutation = useMutation({
    mutationFn: (payload: { subjectId: string; chapterId?: string | null; name: string }) =>
      createTopicAction({
        exam_tracker_id: examTrackerId,
        subject_id: payload.subjectId,
        chapter_id: payload.chapterId,
        name: payload.name,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const addSectionMutation = useMutation({
    mutationFn: (payload: { name: string; color?: string }) =>
      createTrackerChecklistAction({ exam_tracker_id: examTrackerId, ...payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeTopicMutation = useMutation({
    mutationFn: deleteTopicAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeSubjectMutation = useMutation({
    mutationFn: deleteSubjectAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeSectionMutation = useMutation({
    mutationFn: deleteTrackerChecklistAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeChapterMutation = useMutation({
    mutationFn: deleteChapterAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const moveTopicChapterMutation = useMutation({
    mutationFn: updateTopicChapterAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    data: query.data,
    tracker: query.data?.tracker || null,
    checklists: query.data?.checklists || [],
    sections: query.data?.checklists || [],
    subjects: query.data?.subjects || [],
    chapters: query.data?.chapters || [],
    topics: query.data?.topics || [],
    progress: query.data?.progress || [],
    subjectTree: query.data?.subjectTree || [],
    stats: query.data?.stats || {
      totalTopics: 0,
      completedCheckboxes: 0,
      totalCheckboxes: 0,
      overallPercentage: 0,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    addSubject: addSubjectMutation.mutateAsync,
    addChapter: addChapterMutation.mutateAsync,
    addTopic: addTopicMutation.mutateAsync,
    addSectionColumn: addSectionMutation.mutateAsync,
    deleteTopic: removeTopicMutation.mutateAsync,
    deleteSubject: removeSubjectMutation.mutateAsync,
    deleteChapter: removeChapterMutation.mutateAsync,
    deleteSectionColumn: removeSectionMutation.mutateAsync,
    updateTopicChapter: moveTopicChapterMutation.mutateAsync,
  };
}
