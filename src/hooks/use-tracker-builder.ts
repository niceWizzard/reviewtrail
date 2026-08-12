import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commitExamTrackerDraftAction } from "@/src/lib/actions/trackers";
import type { TrackerDraft } from "@/src/lib/types/builder-draft";

export function useTrackerBuilder() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<number>(1);

  const commitDraftMutation = useMutation({
    mutationFn: (draft: TrackerDraft) => commitExamTrackerDraftAction(draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam_trackers"] });
    },
  });

  const commitMutationRef = useRef(commitDraftMutation);
  useEffect(() => {
    commitMutationRef.current = commitDraftMutation;
  });

  const resetBuilder = useCallback(() => {
    setStep(1);
    commitMutationRef.current.reset();
  }, []);

  return {
    step,
    setStep,
    resetBuilder,
    commitDraft: commitDraftMutation.mutateAsync,
    isCommitting: commitDraftMutation.isPending,
  };
}
