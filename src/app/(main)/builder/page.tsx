"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { useTrackerBuilder } from "@/src/hooks/use-tracker-builder";
import { useTrackerWorkspace } from "@/src/hooks/use-tracker-workspace";

import { ActiveAdderForm, LeaveTarget, Step1Values } from "./types";
import { BuilderHeader } from "./components/builder-header";
import { ErrorAlert } from "./components/error-alert";
import { ExamInfoForm } from "./components/exam-info-form";
import { MatrixToolbar } from "./components/matrix-toolbar";
import { MatrixAdderForms } from "./components/matrix-adder-forms";
import { ReviewMatrixTable } from "./components/review-matrix-table";
import { LeaveConfirmDialog } from "./components/leave-confirm-dialog";

export default function BuilderPage() {
  const router = useRouter();
  const {
    step,
    setStep,
    trackerId,
    resetBuilder,
    saveExamInfo,
    isSavingExamInfo,
    addSectionColumn,
    isAddingSection,
    addSubject,
    isAddingSubject,
    addChapter,
    addTopic,
    isAddingTopic,
  } = useTrackerBuilder();

  const workspaceData = useTrackerWorkspace(trackerId || "");

  // Reset builder state on component unmount to ensure fresh session on return
  useEffect(() => {
    return () => {
      resetBuilder();
    };
  }, [resetBuilder]);

  // Error Alert State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 2 Inline Adder States
  const [activeAdderForm, setActiveAdderForm] = useState<ActiveAdderForm>(null);
  const [targetSubjectId, setTargetSubjectId] = useState("");

  // Accidental Navigation Target & Ref
  const [pendingLeaveTarget, setPendingLeaveTarget] = useState<LeaveTarget | null>(null);
  const stayBtnRef = useRef<HTMLButtonElement>(null);

  const isLeaveConfirmOpen = pendingLeaveTarget !== null;
  const isMaxColumnsReached = workspaceData.checklists.length >= 10;

  // Navigation Protection Effects
  useEffect(() => {
    if (step !== 2) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");

      if (anchor && anchor.href) {
        const targetUrl = new URL(anchor.href, window.location.origin);
        if (targetUrl.pathname !== window.location.pathname) {
          e.preventDefault();
          e.stopPropagation();
          setPendingLeaveTarget({ type: "href", href: anchor.href });
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.history.pushState({ inBuilderStep2: true }, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState({ inBuilderStep2: true }, "", window.location.href);
      setPendingLeaveTarget({ type: "dashboard" });
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [step]);

  const handleNavAttempt = (target: "dashboard" | "step1") => {
    if (step === 2) {
      setPendingLeaveTarget({ type: target });
    } else {
      if (target === "dashboard") {
        resetBuilder();
        router.push("/dashboard");
      } else {
        setStep(1);
      }
    }
  };

  const confirmLeave = () => {
    if (!pendingLeaveTarget) return;
    const target = pendingLeaveTarget;
    setPendingLeaveTarget(null);

    resetBuilder();

    if (target.type === "href") {
      router.push(target.href);
    } else if (target.type === "dashboard") {
      router.push("/dashboard");
    } else if (target.type === "step1") {
      setStep(1);
    }
  };

  // Step 1 Submission
  const handleSaveExamInfo = async (value: Step1Values) => {
    setErrorMessage(null);
    try {
      await saveExamInfo({
        exam_name: value.examName.trim(),
        exam_date: value.examDate || undefined,
        description: value.description.trim() || undefined,
        prepopulateColumns: value.prepopulateColumns,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create exam tracker");
    }
  };

  const handleFinish = () => {
    const targetTrackerId = trackerId;
    resetBuilder();
    if (targetTrackerId) {
      router.push(`/dashboard/tracker/${targetTrackerId}`);
    } else {
      router.push("/dashboard");
    }
  };

  const handleOpenAdderForm = (form: ActiveAdderForm, subjectId?: string) => {
    if (subjectId) setTargetSubjectId(subjectId);
    setActiveAdderForm((prev) => (prev === form ? null : form));
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative">
      <BuilderHeader step={step as 1 | 2} onNavAttempt={handleNavAttempt} />

      <ErrorAlert errorMessage={errorMessage} onClear={() => setErrorMessage(null)} />

      {/* STEP 1: EXAM INFO FORM */}
      {step === 1 && (
        <ExamInfoForm
          isSavingExamInfo={isSavingExamInfo}
          onSubmit={handleSaveExamInfo}
        />
      )}

      {/* STEP 2: SPREADSHEET-STYLE REVIEW MATRIX BUILDER */}
      {step === 2 && (
        <Card className="shadow-xs border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    2
                  </span>
                  Interactive Review Matrix Builder
                </CardTitle>
                <CardDescription className="mt-1">
                  Add columns and rows (subjects & topics) directly in this Google Sheets-style preview table.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={isMaxColumnsReached ? "destructive" : "secondary"} className="px-3 py-1 text-xs">
                  {workspaceData.checklists.length}/10 Columns
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <MatrixToolbar
              activeAdderForm={activeAdderForm}
              setActiveAdderForm={setActiveAdderForm}
              isMaxColumnsReached={isMaxColumnsReached}
              subjectCount={workspaceData.subjects.length}
              topicCount={workspaceData.topics.length}
            />

            <MatrixAdderForms
              activeAdderForm={activeAdderForm}
              setActiveAdderForm={setActiveAdderForm}
              subjects={workspaceData.subjects}
              chapters={workspaceData.chapters}
              checklistsLength={workspaceData.checklists.length}
              targetSubjectId={targetSubjectId}
              setTargetSubjectId={setTargetSubjectId}
              onAddSectionColumn={async (name) => {
                await addSectionColumn({ name });
              }}
              isAddingSection={isAddingSection}
              onAddSubject={async (name) => {
                await addSubject({ name });
              }}
              isAddingSubject={isAddingSubject}
              onAddChapter={async (subjectId, name) => {
                await addChapter({ subjectId, name });
              }}
              onAddTopic={async (subjectId, chapterId, name) => {
                await addTopic({ subjectId, chapterId, name });
              }}
              isAddingTopic={isAddingTopic}
              setErrorMessage={setErrorMessage}
            />

            <ReviewMatrixTable
              checklists={workspaceData.checklists}
              subjects={workspaceData.subjects}
              chapters={workspaceData.chapters}
              topics={workspaceData.topics}
              isMaxColumnsReached={isMaxColumnsReached}
              onDeleteSectionColumn={workspaceData.deleteSectionColumn}
              onDeleteSubject={workspaceData.deleteSubject}
              onDeleteChapter={workspaceData.deleteChapter}
              onDeleteTopic={workspaceData.deleteTopic}
              onOpenAdderForm={handleOpenAdderForm}
              onNavBack={() => handleNavAttempt("step1")}
              onFinish={handleFinish}
            />
          </CardContent>
        </Card>
      )}

      {/* Accidental Navigation Confirmation Modal */}
      <LeaveConfirmDialog
        isOpen={isLeaveConfirmOpen}
        onClose={() => setPendingLeaveTarget(null)}
        onConfirm={confirmLeave}
        stayBtnRef={stayBtnRef}
      />
    </div>
  );
}
