"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { useTrackerBuilder } from "@/src/hooks/use-tracker-builder";
import {
  BuilderProvider,
  useBuilderContext,
  validateAddChecklist,
  validateAddSubject,
  validateAddChapter,
  validateAddTopic,
  validateRenameChecklist,
  validateRenameSubject,
  validateRenameChapter,
  validateRenameTopic,
  validateDeleteChecklist,
} from "./builder-context";

import { ActiveAdderForm, LeaveTarget, Step1Values } from "./types";
import { BuilderHeader } from "./components/builder-header";
import { ErrorAlert } from "./components/error-alert";
import { ExamInfoForm } from "./components/exam-info-form";
import { MatrixToolbar } from "./components/matrix-toolbar";
import { MatrixAdderForms } from "./components/matrix-adder-forms";
import { ReviewMatrixTable } from "./components/review-matrix-table";
import { LeaveConfirmDialog } from "./components/leave-confirm-dialog";

function BuilderContent() {
  const router = useRouter();
  const { step, setStep, resetBuilder, commitDraft, isCommitting } = useTrackerBuilder();
  const { draft, dispatch, validateDraft, resetDraft } = useBuilderContext();

  const resetBuilderRef = useRef(resetBuilder);
  const resetDraftRef = useRef(resetDraft);

  useEffect(() => {
    resetBuilderRef.current = resetBuilder;
    resetDraftRef.current = resetDraft;
  });

  // Reset builder state on component unmount to ensure fresh session on return
  useEffect(() => {
    return () => {
      resetBuilderRef.current();
      resetDraftRef.current();
    };
  }, []);

  // Error Alert State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 2 Inline Adder States
  const [activeAdderForm, setActiveAdderForm] = useState<ActiveAdderForm>(null);
  const [targetSubjectTempId, setTargetSubjectTempId] = useState("");

  // Accidental Navigation Target & Ref
  const [pendingLeaveTarget, setPendingLeaveTarget] = useState<LeaveTarget | null>(null);
  const stayBtnRef = useRef<HTMLButtonElement>(null);

  const isLeaveConfirmOpen = pendingLeaveTarget !== null;
  const isMaxColumnsReached = draft.checklists.length >= 10;

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
        resetDraft();
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
    resetDraft();

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
      dispatch({
        type: "SET_EXAM_INFO",
        payload: {
          examName: value.examName,
          examDate: value.examDate || null,
          description: value.description || null,
          prepopulateColumns: value.prepopulateColumns,
        },
      });
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save exam info");
    }
  };

  // Step 2 Submission (Atomic Commit to Supabase)
  const handleFinish = async () => {
    setErrorMessage(null);
    const validationErr = validateDraft();
    if (validationErr) {
      setErrorMessage(validationErr);
      return;
    }

    try {
      const createdTracker = await commitDraft(draft);
      resetBuilder();
      resetDraft();
      router.push(`/dashboard/tracker/${createdTracker.id}`);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to commit tracker");
    }
  };

  const handleOpenAdderForm = (form: ActiveAdderForm, subjectTempId?: string) => {
    if (subjectTempId) setTargetSubjectTempId(subjectTempId);
    setActiveAdderForm((prev) => (prev === form ? null : form));
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative">
      <BuilderHeader step={step as 1 | 2} onNavAttempt={handleNavAttempt} />

      <ErrorAlert errorMessage={errorMessage} onClear={() => setErrorMessage(null)} />

      {/* STEP 1: EXAM INFO FORM */}
      {step === 1 && (
        <ExamInfoForm
          isSavingExamInfo={false}
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
                  {draft.checklists.length}/10 Columns
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <MatrixToolbar
              activeAdderForm={activeAdderForm}
              setActiveAdderForm={setActiveAdderForm}
              isMaxColumnsReached={isMaxColumnsReached}
              subjectCount={draft.subjects.length}
              topicCount={draft.topics.length}
            />

            <MatrixAdderForms
              activeAdderForm={activeAdderForm}
              setActiveAdderForm={setActiveAdderForm}
              subjects={draft.subjects}
              chapters={draft.chapters}
              checklistsLength={draft.checklists.length}
              targetSubjectTempId={targetSubjectTempId}
              setTargetSubjectTempId={setTargetSubjectTempId}
              onAddSectionColumn={(name) => {
                const err = validateAddChecklist(draft, name);
                if (err) throw new Error(err);
                setErrorMessage(null);
                dispatch({ type: "ADD_CHECKLIST", payload: { name } });
              }}
              onAddSubject={(name) => {
                const err = validateAddSubject(draft, name);
                if (err) throw new Error(err);
                setErrorMessage(null);
                dispatch({ type: "ADD_SUBJECT", payload: { name } });
              }}
              onAddChapter={(subjectTempId, name) => {
                const err = validateAddChapter(draft, subjectTempId, name);
                if (err) throw new Error(err);
                setErrorMessage(null);
                dispatch({ type: "ADD_CHAPTER", payload: { subjectTempId, name } });
              }}
              onAddTopic={(subjectTempId, chapterTempId, name) => {
                const err = validateAddTopic(draft, subjectTempId, chapterTempId, name);
                if (err) throw new Error(err);
                setErrorMessage(null);
                dispatch({ type: "ADD_TOPIC", payload: { subjectTempId, chapterTempId, name } });
              }}
              setErrorMessage={setErrorMessage}
            />

            <ReviewMatrixTable
              checklists={draft.checklists}
              subjects={draft.subjects}
              chapters={draft.chapters}
              topics={draft.topics}
              isMaxColumnsReached={isMaxColumnsReached}
              isCommitting={isCommitting}
              onDeleteSectionColumn={(tempId) => {
                const err = validateDeleteChecklist(draft);
                if (err) {
                  setErrorMessage(err);
                  return;
                }
                setErrorMessage(null);
                dispatch({ type: "DELETE_CHECKLIST", payload: { tempId } });
              }}
              onDeleteSubject={(tempId) => {
                dispatch({ type: "DELETE_SUBJECT", payload: { tempId } });
              }}
              onDeleteChapter={(tempId) => {
                dispatch({ type: "DELETE_CHAPTER", payload: { tempId } });
              }}
              onDeleteTopic={(tempId) => {
                dispatch({ type: "DELETE_TOPIC", payload: { tempId } });
              }}
              onRenameSectionColumn={(tempId, name) => {
                const err = validateRenameChecklist(draft, tempId, name);
                if (err) {
                  setErrorMessage(err);
                  return false;
                }
                setErrorMessage(null);
                dispatch({ type: "RENAME_CHECKLIST", payload: { tempId, name } });
                return true;
              }}
              onRenameSubject={(tempId, name) => {
                const err = validateRenameSubject(draft, tempId, name);
                if (err) {
                  setErrorMessage(err);
                  return false;
                }
                setErrorMessage(null);
                dispatch({ type: "RENAME_SUBJECT", payload: { tempId, name } });
                return true;
              }}
              onRenameChapter={(tempId, name) => {
                const err = validateRenameChapter(draft, tempId, name);
                if (err) {
                  setErrorMessage(err);
                  return false;
                }
                setErrorMessage(null);
                dispatch({ type: "RENAME_CHAPTER", payload: { tempId, name } });
                return true;
              }}
              onRenameTopic={(tempId, name) => {
                const err = validateRenameTopic(draft, tempId, name);
                if (err) {
                  setErrorMessage(err);
                  return false;
                }
                setErrorMessage(null);
                dispatch({ type: "RENAME_TOPIC", payload: { tempId, name } });
                return true;
              }}
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

export default function BuilderPage() {
  return (
    <BuilderProvider>
      <BuilderContent />
    </BuilderProvider>
  );
}
