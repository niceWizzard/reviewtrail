"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Plus,
  CheckCircle2,
  BookOpen,
  Trash2,
  CheckSquare,
  AlertCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { useTrackerBuilder } from "@/src/hooks/use-tracker-builder";
import { useTrackerWorkspace } from "@/src/hooks/use-tracker-workspace";

// Step 1 Zod Schema
const step1Schema = z.object({
  examName: z.string().min(1, "Exam name is required").max(32, "Exam name must be 32 characters or less"),
  examDate: z.string(),
  description: z.string(),
  prepopulateColumns: z.boolean(),
});

// Discriminated Unions for Step 2 UI
type ActiveAdderForm = "section" | "subject" | "topic" | null;
type LeaveTarget =
  | { type: "dashboard" }
  | { type: "step1" }
  | { type: "href"; href: string };

export default function BuilderPage() {
  const router = useRouter();
  const {
    step,
    setStep,
    trackerId,
    saveExamInfo,
    isSavingExamInfo,
    addSectionColumn,
    isAddingSection,
    addSubject,
    isAddingSubject,
    addTopic,
    isAddingTopic,
  } = useTrackerBuilder();

  const workspaceData = useTrackerWorkspace(trackerId || "");

  // Error Alert State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 2 Inline Adder States
  const [activeAdderForm, setActiveAdderForm] = useState<ActiveAdderForm>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [targetSubjectId, setTargetSubjectId] = useState("");

  // Accidental Navigation Target & Ref
  const [pendingLeaveTarget, setPendingLeaveTarget] = useState<LeaveTarget | null>(null);
  const stayBtnRef = useRef<HTMLButtonElement>(null);

  // Derived Modal Visibility
  const isLeaveConfirmOpen = pendingLeaveTarget !== null;

  // Step 1 TanStack Form
  const step1Form = useForm({
    defaultValues: {
      examName: "",
      examDate: "",
      description: "",
      prepopulateColumns: true,
    },
    validators: {
      onChange: step1Schema,
    },
    onSubmit: async ({ value }) => {
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
    },
  });

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

    if (target.type === "href") {
      router.push(target.href);
    } else if (target.type === "dashboard") {
      router.push("/dashboard");
    } else if (target.type === "step1") {
      setStep(1);
    }
  };

  // Step 2 Handlers
  const handleAddSectionColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    if (workspaceData.checklists.length >= 10) {
      setErrorMessage("Maximum limit of 10 checklist columns reached.");
      return;
    }
    setErrorMessage(null);
    try {
      await addSectionColumn({ name: newSectionName.trim() });
      setNewSectionName("");
      setActiveAdderForm(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to add column");
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    setErrorMessage(null);
    try {
      await addSubject({ name: newSubjectName.trim() });
      setNewSubjectName("");
      setActiveAdderForm(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to add subject");
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSubjectId || !newTopicName.trim()) return;
    setErrorMessage(null);
    try {
      await addTopic({ subjectId: targetSubjectId, name: newTopicName.trim() });
      setNewTopicName("");
      setActiveAdderForm(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to add topic");
    }
  };

  const handleFinish = () => {
    if (trackerId) {
      router.push(`/dashboard/tracker/${trackerId}`);
    } else {
      router.push("/dashboard");
    }
  };

  const isMaxColumnsReached = workspaceData.checklists.length >= 10;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleNavAttempt("dashboard")}
          className="gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Button>

        <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary py-1 px-3">
          <Sparkles className="size-3.5" />
          Database Autosave Active
        </Badge>
      </div>

      {/* Stepper Progress Header (2 Steps) */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Custom Exam Tracker</h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {step === 1
            ? "Enter your exam details to initialize your review tracker."
            : "Customize your review matrix columns and syllabus topics live like a spreadsheet."}
        </p>

        <div className="flex items-center justify-center gap-2 pt-4 max-w-xs mx-auto">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground max-w-xs mx-auto font-medium px-1">
          <span className={step === 1 ? "text-primary font-semibold" : ""}>1. Exam Details</span>
          <span className={step === 2 ? "text-primary font-semibold" : ""}>2. Matrix Builder</span>
        </div>
      </div>

      {/* Error Alert Display */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* STEP 1: EXAM INFO FORM WITH TANSTACK FORM */}
      {step === 1 && (
        <Card className="shadow-xs border-border max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </span>
              Exam Title & Target Date
            </CardTitle>
            <CardDescription>
              Provide the details for your exam to set up your study tracking workspace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                step1Form.handleSubmit();
              }}
              className="space-y-4"
            >
              {/* Field 1: Exam Name */}
              <step1Form.Field
                name="examName"
                validators={{
                  onChange: step1Schema.shape.examName,
                }}
                children={(field) => (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Exam Name *</label>
                    <Input
                      required
                      placeholder="e.g. USMLE Step 1, CPA Board Exam 2026, NCLEX-RN"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[11px] text-destructive font-medium">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Field 2: Target Exam Date */}
              <step1Form.Field
                name="examDate"
                children={(field) => (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Target Exam Date</label>
                    <Input
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              />

              {/* Field 3: Description */}
              <step1Form.Field
                name="description"
                children={(field) => (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Description / Goal</label>
                    <Input
                      placeholder="e.g. Target score 250+, 3 review passes before scheduled exam"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              />

              {/* Field 4: Pre-populate Columns Checkbox */}
              <step1Form.Field
                name="prepopulateColumns"
                children={(field) => (
                  <div className="pt-2">
                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                        className="mt-0.5 size-4 rounded-xs text-primary focus:ring-primary accent-primary"
                      />
                      <div className="space-y-0.5 text-xs">
                        <span className="font-semibold text-foreground block">
                          Pre-populate default checklist columns
                        </span>
                        <span className="text-muted-foreground block">
                          Starts your table matrix with standard review columns: <strong>1st Read</strong>, <strong>Notes</strong>, and <strong>Practice Qs</strong>. Uncheck to start with an empty matrix.
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              />

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isSavingExamInfo} className="gap-2">
                  {isSavingExamInfo ? "Autosaving Exam Info..." : "Next: Build Review Matrix"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
            {/* Quick Toolbar for Matrix Editing */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Add Column Button */}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isMaxColumnsReached}
                  onClick={() => setActiveAdderForm(activeAdderForm === "section" ? null : "section")}
                  className="gap-1.5"
                >
                  <Plus className="size-3.5" />
                  Add Column
                </Button>

                {/* Add Subject Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveAdderForm(activeAdderForm === "subject" ? null : "subject")}
                  className="gap-1.5"
                >
                  <Plus className="size-3.5" />
                  Add Subject
                </Button>

                {/* Add Topic Button */}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={workspaceData.subjects.length === 0}
                  onClick={() => setActiveAdderForm(activeAdderForm === "topic" ? null : "topic")}
                  className="gap-1.5"
                >
                  <Plus className="size-3.5" />
                  Add Topic
                </Button>
              </div>

              <span className="text-xs text-muted-foreground">
                {workspaceData.subjects.length} Subjects • {workspaceData.topics.length} Topics
              </span>
            </div>

            {/* Inline Add Column Form */}
            {activeAdderForm === "section" && (
              <form onSubmit={handleAddSectionColumn} className="p-3.5 bg-accent/30 rounded-xl border border-primary/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Add New Checklist Column</span>
                  <span className="text-[11px] text-muted-foreground">{workspaceData.checklists.length}/10 max</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    placeholder="Column Name (e.g. Flashcards, Lecture Video)"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Button type="submit" size="sm" disabled={isAddingSection || !newSectionName.trim()}>
                    Add Column
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveAdderForm(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Inline Add Subject Form */}
            {activeAdderForm === "subject" && (
              <form onSubmit={handleAddSubject} className="p-3.5 bg-accent/30 rounded-xl border border-primary/30 space-y-2">
                <span className="text-xs font-semibold text-foreground block">Add New Subject Row</span>
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    placeholder="Subject Name (e.g. Pharmacology, Civil Law)"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Button type="submit" size="sm" disabled={isAddingSubject || !newSubjectName.trim()}>
                    Add Subject
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveAdderForm(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Inline Add Topic Form */}
            {activeAdderForm === "topic" && (
              <form onSubmit={handleAddTopic} className="p-3.5 bg-accent/30 rounded-xl border border-primary/30 space-y-3">
                <span className="text-xs font-semibold text-foreground block">Add Topic Row under Subject</span>
                <div className="grid sm:grid-cols-2 gap-2">
                  <select
                    value={targetSubjectId}
                    onChange={(e) => setTargetSubjectId(e.target.value)}
                    className="h-9 px-3 py-1 text-xs sm:text-sm rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="">Select Target Subject...</option>
                    {workspaceData.subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>

                  <Input
                    autoFocus
                    placeholder="Topic Name (e.g. Beta Blockers, Torts)"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveAdderForm(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isAddingTopic || !targetSubjectId || !newTopicName.trim()}
                  >
                    Add Topic
                  </Button>
                </div>
              </form>
            )}

            {/* Google Sheets-Style Interactive Matrix Table */}
            <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
              <table className="w-full text-left text-sm border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-border bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                    <th className="px-4 py-3 min-w-[260px] sticky left-0 z-10 bg-muted/90 backdrop-blur-xs border-r border-border">
                      Syllabus Topic / Row
                    </th>

                    {/* Dynamic Section Columns (Positioned Order) */}
                    {workspaceData.checklists.map((section) => (
                      <th
                        key={section.id}
                        className="px-3 py-2.5 text-center min-w-[120px] font-semibold border-r border-border/40 group relative"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="truncate max-w-[90px]">{section.name}</span>
                          <button
                            type="button"
                            title={`Delete ${section.name} column`}
                            onClick={() => workspaceData.deleteSectionColumn(section.id)}
                            className="text-muted-foreground/60 hover:text-destructive p-0.5 rounded-xs transition-colors cursor-pointer"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </th>
                    ))}

                    {/* Rightmost Cell to Add Column directly in Header (Google Sheets style) */}
                    <th className="px-3 py-2.5 text-center min-w-[110px] bg-muted/30">
                      <Button
                        variant="ghost"
                        size="xs"
                        disabled={isMaxColumnsReached}
                        onClick={() => setActiveAdderForm(activeAdderForm === "section" ? null : "section")}
                        className="text-xs gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="size-3" />
                        {isMaxColumnsReached ? "Limit (10)" : "Column"}
                      </Button>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/60">
                  {workspaceData.subjects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={workspaceData.checklists.length + 2}
                        className="p-8 text-center text-muted-foreground text-xs italic"
                      >
                        No subjects added yet. Click <strong>+ Add Subject</strong> above to build your review matrix!
                      </td>
                    </tr>
                  ) : (
                    workspaceData.subjects.map((subject) => {
                      const subTopics = workspaceData.topics.filter(
                        (t) => t.subject_id === subject.id
                      );

                      return (
                        <React.Fragment key={subject.id}>
                          {/* Subject Row Header */}
                          <tr className="bg-muted/50 font-bold text-foreground border-t border-border">
                            <td
                              colSpan={workspaceData.checklists.length + 2}
                              className="px-4 py-2 bg-muted/60 sticky left-0 z-10"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="size-2 rounded-full bg-primary" />
                                  <span className="text-sm font-semibold">{subject.name}</span>
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {subTopics.length} Topics
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => {
                                      setTargetSubjectId(subject.id);
                                      setActiveAdderForm("topic");
                                    }}
                                    className="h-6 text-[11px] gap-1 text-primary hover:text-primary"
                                  >
                                    <Plus className="size-3" /> Topic
                                  </Button>

                                  <button
                                    type="button"
                                    title={`Delete ${subject.name}`}
                                    onClick={() => workspaceData.deleteSubject(subject.id)}
                                    className="text-muted-foreground hover:text-destructive p-1 rounded-xs transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* Topic Rows */}
                          {subTopics.length === 0 ? (
                            <tr>
                              <td
                                colSpan={workspaceData.checklists.length + 2}
                                className="px-8 py-2 text-xs text-muted-foreground/70 italic"
                              >
                                No topics under {subject.name}. Click "+ Topic" to add one!
                              </td>
                            </tr>
                          ) : (
                            subTopics.map((topic) => (
                              <tr
                                key={topic.id}
                                className="hover:bg-accent/40 transition-colors group"
                              >
                                {/* Left Cell: Topic Name + Actions */}
                                <td className="px-6 py-2.5 font-medium text-foreground sticky left-0 z-10 bg-card group-hover:bg-accent/40 border-r border-border/60">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs">{topic.name}</span>
                                    <button
                                      type="button"
                                      title={`Delete ${topic.name}`}
                                      onClick={() => workspaceData.deleteTopic(topic.id)}
                                      className="text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  </div>
                                </td>

                                {/* Checklist Cells (Spreadsheet Matrix Preview) */}
                                {workspaceData.checklists.map((section) => (
                                  <td
                                    key={section.id}
                                    className="px-2 py-2 text-center border-r border-border/40"
                                  >
                                    <div
                                      className="mx-auto size-6 rounded-md border border-input bg-background/50 flex items-center justify-center opacity-40"
                                      title="Preview status checkbox cell"
                                    >
                                      <CheckSquare className="size-3 text-muted-foreground" />
                                    </div>
                                  </td>
                                ))}

                                {/* Rightmost Empty Cell */}
                                <td className="px-2 py-2 bg-muted/10" />
                              </tr>
                            ))
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => handleNavAttempt("step1")}>
                Back to Exam Info
              </Button>
              <Button onClick={handleFinish} className="gap-2 shadow-sm">
                <CheckCircle2 className="size-4" />
                Launch Tracker Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accessible Dialog with Base UI Focus Trap & Initial Focus */}
      <Dialog
        open={isLeaveConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setPendingLeaveTarget(null);
        }}
      >
        <DialogContent initialFocus={stayBtnRef} showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <AlertTriangle className="size-5 text-amber-500 shrink-0" />
              Leave Matrix Builder?
            </DialogTitle>
            <DialogDescription className="text-xs pt-2 text-muted-foreground leading-relaxed">
              Your exam tracker matrix is autosaved to your account database. You can launch your tracker workspace now or continue building your review matrix anytime from your dashboard.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2">
            <Button
              ref={stayBtnRef}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPendingLeaveTarget(null)}
              className="focus:ring-3 focus:ring-primary/40 focus:border-primary focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:border-primary outline-none"
            >
              Stay in Builder
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmLeave}
            >
              Leave Builder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
