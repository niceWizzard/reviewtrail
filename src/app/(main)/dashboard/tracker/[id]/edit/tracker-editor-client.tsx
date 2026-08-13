"use client";

import React, { useState, useReducer, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Loader2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { ErrorAlert } from "@/src/app/(main)/builder/components/error-alert";
import { MatrixToolbar } from "@/src/app/(main)/builder/components/matrix-toolbar";
import { MatrixAdderForms } from "@/src/app/(main)/builder/components/matrix-adder-forms";
import { ReviewMatrixTable } from "@/src/app/(main)/builder/components/review-matrix-table";
import { DeleteStructureConfirmDialog } from "@/src/components/tracker/delete-structure-confirm-dialog";
import { LeaveConfirmDialog } from "@/src/app/(main)/builder/components/leave-confirm-dialog";
import type { TrackerWorkspaceData } from "@/src/lib/types/database";
import type { TrackerDraft } from "@/src/lib/types/builder-draft";
import { ActiveAdderForm } from "@/src/app/(main)/builder/types";
import {
  draftReducer,
  validateDraft,
  validateAddChecklist,
  validateAddSubject,
  validateAddChapter,
  validateAddTopic,
  validateRenameChecklist,
  validateRenameSubject,
  validateRenameChapter,
  validateRenameTopic,
  validateDeleteChecklist,
} from "@/src/app/(main)/builder/builder-context";
import { saveTrackerWorkspaceEditAction } from "@/src/lib/actions/trackers";

interface TrackerEditorClientProps {
  examTrackerId: string;
  initialWorkspaceData: TrackerWorkspaceData;
}

function convertWorkspaceDataToDraft(workspaceData: TrackerWorkspaceData): TrackerDraft {
  return {
    examName: workspaceData.tracker.exam_name,
    examDate: workspaceData.tracker.exam_date || null,
    description: workspaceData.tracker.description || null,
    checklists: workspaceData.checklists.map((c) => ({
      tempId: c.id,
      id: c.id,
      name: c.name,
      position: c.position,
      color: c.color,
    })),
    subjects: workspaceData.subjects.map((s) => ({
      tempId: s.id,
      id: s.id,
      name: s.name,
      position: s.position,
      color: s.color,
    })),
    chapters: workspaceData.chapters.map((c) => ({
      tempId: c.id,
      id: c.id,
      subjectTempId: c.subject_id,
      name: c.name,
      description: c.description,
      position: c.position,
    })),
    topics: workspaceData.topics.map((t) => ({
      tempId: t.id,
      id: t.id,
      subjectTempId: t.subject_id,
      chapterTempId: t.chapter_id,
      name: t.name,
      position: t.position,
    })),
  };
}

export function TrackerEditorClient({
  examTrackerId,
  initialWorkspaceData,
}: TrackerEditorClientProps) {
  const router = useRouter();
  const initialDraft = convertWorkspaceDataToDraft(initialWorkspaceData);
  const [draft, dispatch] = useReducer(draftReducer, initialDraft);

  // Synchronize local draft with fresh initialWorkspaceData whenever initialWorkspaceData updates or page mounts
  React.useEffect(() => {
    dispatch({
      type: "SET_DRAFT",
      payload: convertWorkspaceDataToDraft(initialWorkspaceData),
    });
  }, [initialWorkspaceData]);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAdderForm, setActiveAdderForm] = useState<ActiveAdderForm>(null);
  const [targetSubjectTempId, setTargetSubjectTempId] = useState("");
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const stayBtnRef = useRef<HTMLButtonElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    tempId: string;
    type: "subject" | "chapter";
    name: string;
    topicCount: number;
  } | null>(null);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(initialDraft);
  const isMaxColumnsReached = draft.checklists.length >= 10;

  const handleOpenAdderForm = (form: ActiveAdderForm, subjectTempId?: string) => {
    if (subjectTempId) setTargetSubjectTempId(subjectTempId);
    setActiveAdderForm((prev) => (prev === form ? null : form));
  };

  const handlePromptDeleteSubject = (tempId: string) => {
    const sub = draft.subjects.find((s) => s.tempId === tempId || s.id === tempId);
    const subTopics = draft.topics.filter((t) => t.subjectTempId === tempId);
    if (sub) {
      setDeleteTarget({
        tempId: sub.tempId,
        type: "subject",
        name: sub.name,
        topicCount: subTopics.length,
      });
    }
  };

  const handlePromptDeleteChapter = (tempId: string) => {
    const ch = draft.chapters.find((c) => c.tempId === tempId || c.id === tempId);
    const chTopics = draft.topics.filter((t) => t.chapterTempId === tempId);
    if (ch) {
      setDeleteTarget({
        tempId: ch.tempId,
        type: "chapter",
        name: ch.name,
        topicCount: chTopics.length,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "subject") {
      dispatch({ type: "DELETE_SUBJECT", payload: { tempId: deleteTarget.tempId } });
    } else {
      dispatch({ type: "DELETE_CHAPTER", payload: { tempId: deleteTarget.tempId } });
    }
    setDeleteTarget(null);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    const valErr = validateDraft(draft);
    if (valErr) {
      setErrorMessage(valErr);
      return;
    }

    setIsSaving(true);
    try {
      await saveTrackerWorkspaceEditAction({
        trackerId: examTrackerId,
        draft,
      });
      router.push(`/dashboard/tracker/${examTrackerId}`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save tracker edits");
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setIsLeaveModalOpen(true);
    } else {
      router.push(`/dashboard/tracker/${examTrackerId}`);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isSaving}
            className="gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Cancel 
          </Button>

          <span className="text-muted-foreground/40">|</span>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Edit3 className="size-5 text-primary" />
              Edit Tracker Table: {draft.examName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-amber-500 font-semibold italic">Unsaved Edits</span>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="gap-1.5 shadow-xs shrink-0 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <ErrorAlert errorMessage={errorMessage} onClear={() => setErrorMessage(null)} />

      {/* Interactive Full-Page Matrix Editor Card */}
      <Card className="shadow-xs border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Syllabus & Column Editor
              </CardTitle>
              <CardDescription className="mt-1">
                Add columns, subjects, chapters, and topics.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">
                {draft.checklists.length}/10 Columns
              </span>
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
            targetSubjectId={targetSubjectTempId}
            setTargetSubjectId={setTargetSubjectTempId}
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
            onAddChapter={(subTempId, name) => {
              const err = validateAddChapter(draft, subTempId, name);
              if (err) throw new Error(err);
              setErrorMessage(null);
              dispatch({ type: "ADD_CHAPTER", payload: { subjectTempId: subTempId, name } });
            }}
            onAddTopic={(subTempId, chTempId, name) => {
              const err = validateAddTopic(draft, subTempId, chTempId, name);
              if (err) throw new Error(err);
              setErrorMessage(null);
              dispatch({
                type: "ADD_TOPIC",
                payload: { subjectTempId: subTempId, chapterTempId: chTempId, name },
              });
            }}
            setErrorMessage={setErrorMessage}
          />

          <ReviewMatrixTable
            checklists={draft.checklists}
            subjects={draft.subjects}
            chapters={draft.chapters}
            topics={draft.topics}
            isMaxColumnsReached={isMaxColumnsReached}
            isCommitting={isSaving}
            showBottomBar={false}
            onDeleteSectionColumn={(tempId) => {
              const err = validateDeleteChecklist(draft);
              if (err) {
                setErrorMessage(err);
                return;
              }
              setErrorMessage(null);
              dispatch({ type: "DELETE_CHECKLIST", payload: { tempId } });
            }}
            onDeleteSubject={handlePromptDeleteSubject}
            onDeleteChapter={handlePromptDeleteChapter}
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
            onNavBack={handleCancel}
            onFinish={handleSave}
          />
        </CardContent>
      </Card>

      {/* Cascade Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteStructureConfirmDialog
          isOpen={true}
          itemType={deleteTarget.type}
          itemName={deleteTarget.name}
          topicCount={deleteTarget.topicCount}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Leave Confirmation Dialog */}
      <LeaveConfirmDialog
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={() => {
          setIsLeaveModalOpen(false);
          router.push(`/dashboard/tracker/${examTrackerId}`);
        }}
        stayBtnRef={stayBtnRef}
      />
    </div>
  );
}
