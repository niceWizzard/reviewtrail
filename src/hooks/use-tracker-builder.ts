"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExamTrackerAction } from "@/src/lib/actions/trackers";
import {
  createTrackerChecklistAction,
  clearTrackerChecklistsAction,
  createSubjectAction,
  createChapterAction,
  createTopicAction,
} from "@/src/lib/actions/structure";

export function useTrackerBuilder() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<number>(1);
  const [trackerId, setTrackerId] = useState<string | null>(null);

  // Step 1: Create Exam Tracker in DB via Server Action
  const saveExamInfoMutation = useMutation({
    mutationFn: async (payload: {
      exam_name: string;
      exam_date?: string;
      description?: string;
      prepopulateColumns?: boolean;
    }) => {
      const tracker = await createExamTrackerAction({
        exam_name: payload.exam_name,
        exam_date: payload.exam_date,
        description: payload.description,
      });

      if (payload.prepopulateColumns === false) {
        await clearTrackerChecklistsAction(tracker.id);
      }

      setTrackerId(tracker.id);
      return tracker;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam_trackers"] });
      setStep(2);
    },
  });

  // Step 2: Add Checklist Column via Server Action
  const addSectionMutation = useMutation({
    mutationFn: (payload: { name: string; color?: string }) => {
      if (!trackerId) throw new Error("Tracker must be created first");
      return createTrackerChecklistAction({ exam_tracker_id: trackerId, ...payload });
    },
    onSuccess: () => {
      if (trackerId) {
        queryClient.invalidateQueries({ queryKey: ["workspace", trackerId] });
      }
    },
  });

  // Step 3: Add Subject via Server Action
  const addSubjectMutation = useMutation({
    mutationFn: (payload: { name: string; color?: string }) => {
      if (!trackerId) throw new Error("Tracker must be created first");
      return createSubjectAction({ exam_tracker_id: trackerId, ...payload });
    },
    onSuccess: () => {
      if (trackerId) {
        queryClient.invalidateQueries({ queryKey: ["workspace", trackerId] });
      }
    },
  });

  // Step 3: Add Chapter via Server Action
  const addChapterMutation = useMutation({
    mutationFn: (payload: { subjectId: string; name: string; description?: string }) => {
      if (!trackerId) throw new Error("Tracker must be created first");
      return createChapterAction({
        exam_tracker_id: trackerId,
        subject_id: payload.subjectId,
        name: payload.name,
        description: payload.description,
      });
    },
    onSuccess: () => {
      if (trackerId) {
        queryClient.invalidateQueries({ queryKey: ["workspace", trackerId] });
      }
    },
  });

  // Step 3: Add Topic via Server Action
  const addTopicMutation = useMutation({
    mutationFn: (payload: { subjectId: string; chapterId?: string | null; name: string }) => {
      if (!trackerId) throw new Error("Tracker must be created first");
      return createTopicAction({
        exam_tracker_id: trackerId,
        subject_id: payload.subjectId,
        chapter_id: payload.chapterId,
        name: payload.name,
      });
    },
    onSuccess: () => {
      if (trackerId) {
        queryClient.invalidateQueries({ queryKey: ["workspace", trackerId] });
      }
    },
  });

  return {
    step,
    setStep,
    trackerId,
    saveExamInfo: saveExamInfoMutation.mutateAsync,
    isSavingExamInfo: saveExamInfoMutation.isPending,
    addSectionColumn: addSectionMutation.mutateAsync,
    isAddingSection: addSectionMutation.isPending,
    addSubject: addSubjectMutation.mutateAsync,
    isAddingSubject: addSubjectMutation.isPending,
    addChapter: addChapterMutation.mutateAsync,
    addTopic: addTopicMutation.mutateAsync,
    isAddingTopic: addTopicMutation.isPending,
  };
}
