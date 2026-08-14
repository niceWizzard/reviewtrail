"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Globe, Lock, ArrowLeft, Layers } from "lucide-react";
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
} from "@/src/app/(main)/builder/builder-context";
import { ActiveAdderForm } from "@/src/app/(main)/builder/types";
import { MatrixToolbar } from "@/src/app/(main)/builder/components/matrix-toolbar";
import { MatrixAdderForms } from "@/src/app/(main)/builder/components/matrix-adder-forms";
import { ReviewMatrixTable } from "@/src/app/(main)/builder/components/review-matrix-table";
import { ErrorAlert } from "@/src/app/(main)/builder/components/error-alert";
import { updateTemplateAction } from "@/src/lib/actions/templates";
import {
  validateTemplateDraft,
  convertTemplateStructureToDraft,
  type TrackerTemplate,
} from "@/src/lib/types/template";
import { TemplateMetaForm } from "./template-meta-form";

interface TemplateEditorContentProps {
  initialTemplate: TrackerTemplate;
}

function TemplateEditorContent({ initialTemplate }: TemplateEditorContentProps) {
  const router = useRouter();
  const { draft, dispatch, resetDraft } = useBuilderContext();

  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState(initialTemplate.title || "");
  const [description, setDescription] = useState(initialTemplate.description || "");
  const [category, setCategory] = useState(initialTemplate.category || "Custom");
  const [isPublic, setIsPublic] = useState(initialTemplate.is_public ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  useEffect(() => {
    const loadedDraft = convertTemplateStructureToDraft(
      initialTemplate.structure,
      initialTemplate.title,
      initialTemplate.description
    );
    // SET_DRAFT replaces the entire state atomically with the pre-computed draft.
    // Using individual ADD_* dispatches broke hydration because each reducer case
    // generates a new random tempId, so chapter/topic cross-references to subject
    // tempIds would never match — chapters and topics were silently dropped.
    dispatch({ type: "SET_DRAFT", payload: loadedDraft });
    return () => { resetDraft(); };
  }, [initialTemplate, dispatch, resetDraft]);

  const [activeAdderForm, setActiveAdderForm] = useState<ActiveAdderForm>(null);
  const [targetSubjectTempId, setTargetSubjectTempId] = useState("");

  const isMaxColumnsReached = draft.checklists.length >= 10;

  const handleNextToMatrix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Please enter a Template Title.");
      return;
    }
    setErrorMessage(null);
    dispatch({
      type: "SET_EXAM_INFO",
      payload: { examName: title.trim(), description: description.trim() || null, prepopulateColumns: false },
    });
    setStep(2);
  };

  const handleSaveChanges = async () => {
    setErrorMessage(null);
    const draftValidationErr = validateTemplateDraft({ ...draft, examName: title });
    if (draftValidationErr) {
      setErrorMessage(draftValidationErr);
      return;
    }

    setIsSaving(true);
    try {
      await updateTemplateAction({
        templateId: initialTemplate.id,
        metadata: { title: title.trim(), description: description.trim() || null, category, is_public: isPublic },
        draft: { ...draft, examName: title.trim() },
      });
      resetDraft();
      router.push("/templates");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAdderForm = (form: ActiveAdderForm, subjectTempId?: string) => {
    if (subjectTempId) setTargetSubjectTempId(subjectTempId);
    setActiveAdderForm((prev) => (prev === form ? null : form));
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/templates")}
          className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2 mb-2"
        >
          <ArrowLeft className="size-4" /> Back to Templates
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              Edit Template
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-sm">
              {initialTemplate.title}
            </p>
          </div>
          <StepIndicator currentStep={step} />
        </div>
      </div>

      <ErrorAlert errorMessage={errorMessage} onClear={() => setErrorMessage(null)} />

      {step === 1 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Template Details</CardTitle>
            <CardDescription>Update the title, category, and visibility.</CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateMetaForm
              title={title}
              description={description}
              category={category}
              isPublic={isPublic}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onCategoryChange={setCategory}
              onIsPublicChange={setIsPublic}
              onSubmit={handleNextToMatrix}
              submitLabel="Next: Edit Table"
            />
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Edit Review Table</CardTitle>
                <CardDescription className="mt-1">
                  Modify checklist columns, subjects, chapters, and topics.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1 text-xs">
                  {isPublic ? <Globe className="size-3" /> : <Lock className="size-3" />}
                  {isPublic ? "Public" : "Private"}
                </Badge>
                <Badge variant={isMaxColumnsReached ? "destructive" : "secondary"} className="text-xs">
                  {draft.checklists.length}/10 Columns
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
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
              isCommitting={isSaving}
              onDeleteSectionColumn={(tempId) => {
                const err = validateDeleteChecklist(draft);
                if (err) { setErrorMessage(err); return; }
                setErrorMessage(null);
                dispatch({ type: "DELETE_CHECKLIST", payload: { tempId } });
              }}
              onDeleteSubject={(tempId) => dispatch({ type: "DELETE_SUBJECT", payload: { tempId } })}
              onDeleteChapter={(tempId) => dispatch({ type: "DELETE_CHAPTER", payload: { tempId } })}
              onDeleteTopic={(tempId) => dispatch({ type: "DELETE_TOPIC", payload: { tempId } })}
              onRenameSectionColumn={(tempId, name) => {
                const err = validateRenameChecklist(draft, tempId, name);
                if (err) { setErrorMessage(err); return false; }
                setErrorMessage(null);
                dispatch({ type: "RENAME_CHECKLIST", payload: { tempId, name } });
                return true;
              }}
              onRenameSubject={(tempId, name) => {
                const err = validateRenameSubject(draft, tempId, name);
                if (err) { setErrorMessage(err); return false; }
                setErrorMessage(null);
                dispatch({ type: "RENAME_SUBJECT", payload: { tempId, name } });
                return true;
              }}
              onRenameChapter={(tempId, name) => {
                const err = validateRenameChapter(draft, tempId, name);
                if (err) { setErrorMessage(err); return false; }
                setErrorMessage(null);
                dispatch({ type: "RENAME_CHAPTER", payload: { tempId, name } });
                return true;
              }}
              onRenameTopic={(tempId, name) => {
                const err = validateRenameTopic(draft, tempId, name);
                if (err) { setErrorMessage(err); return false; }
                setErrorMessage(null);
                dispatch({ type: "RENAME_TOPIC", payload: { tempId, name } });
                return true;
              }}
              onOpenAdderForm={handleOpenAdderForm}
              onNavBack={() => setStep(1)}
              onFinish={handleSaveChanges}
              finishLabel="Save Changes"
              backLabel="Back to Details"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <ol className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
      {(["Details", "Table"] as const).map((label, i) => {
        const stepNum = (i + 1) as 1 | 2;
        const isActive = currentStep === stepNum;
        const isDone = currentStep > stepNum;
        return (
          <React.Fragment key={label}>
            {i > 0 && <span className="mx-1 text-border">›</span>}
            <li className={isActive ? "font-medium text-foreground" : isDone ? "text-muted-foreground line-through" : ""}>
              {stepNum}. {label}
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
}

export function TemplateEditorClient({ initialTemplate }: TemplateEditorContentProps) {
  return (
    <BuilderProvider>
      <TemplateEditorContent initialTemplate={initialTemplate} />
    </BuilderProvider>
  );
}
