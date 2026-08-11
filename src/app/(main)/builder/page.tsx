"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Plus,
  CheckCircle2,
  BookOpen,
  Calendar,
  Layers,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { useTrackerBuilder } from "@/src/hooks/use-tracker-builder";
import { useTrackerWorkspace } from "@/src/hooks/use-tracker-workspace";

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

  // Form states
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [description, setDescription] = useState("");

  const [customSectionName, setCustomSectionName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [topicName, setTopicName] = useState("");

  // Step 1 Handler: Save Exam Info to Supabase DB
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;
    await saveExamInfo({
      exam_name: examName.trim(),
      exam_date: examDate || undefined,
      description: description.trim() || undefined,
    });
  };

  // Step 2 Handler: Add Custom Section Column to DB
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSectionName.trim()) return;
    await addSectionColumn({ name: customSectionName.trim() });
    setCustomSectionName("");
  };

  // Step 3 Handler: Add Subject to DB
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    await addSubject({ name: subjectName.trim() });
    setSubjectName("");
  };

  // Step 3 Handler: Add Topic to DB
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !topicName.trim()) return;
    await addTopic({ subjectId: selectedSubjectId, name: topicName.trim() });
    setTopicName("");
  };

  // Finish Builder
  const handleFinish = () => {
    if (trackerId) {
      router.push(`/dashboard/tracker/${trackerId}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Button
          render={<Link href="/dashboard" />}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          nativeButton={false}
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Button>

        <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary py-1 px-3">
          <Sparkles className="size-3.5" />
          Database Autosave Active
        </Badge>
      </div>

      {/* Stepper Progress Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Custom Exam Tracker</h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Define your board exam schedule, customizable checklist columns, and syllabus topics step-by-step.
        </p>

        <div className="flex items-center justify-center gap-2 pt-4 max-w-xs mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: EXAM INFO FORM */}
      {step === 1 && (
        <Card className="shadow-xs border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                1
              </span>
              Exam Title & Target Date
            </CardTitle>
            <CardDescription>
              Enter the official name of the board exam and your scheduled exam date.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Exam Name *</label>
                <Input
                  required
                  placeholder="e.g. USMLE Step 1, CPA Board Exam 2026, NCLEX-RN"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Target Exam Date</label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description / Goal</label>
                <Input
                  placeholder="e.g. Target score 250+, 3 review passes before Oct 15"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isSavingExamInfo || !examName.trim()} className="gap-2">
                  {isSavingExamInfo ? "Autosaving to DB..." : "Next: Checklist Columns"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: CHECKLIST SECTION COLUMNS */}
      {step === 2 && (
        <Card className="shadow-xs border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                2
              </span>
              Customize Progress Section Columns
            </CardTitle>
            <CardDescription>
              Default checklist columns (1st Read, Notes, Practice Qs) are automatically populated. Add any custom columns below!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Active Columns List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
                Current Columns ({workspaceData.sections.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {workspaceData.sections.map((sec) => (
                  <Badge key={sec.id} variant="secondary" className="px-3 py-1.5 text-sm gap-1.5">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    <span>{sec.name}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Add Custom Column Form */}
            <form onSubmit={handleAddSection} className="p-4 bg-muted/30 rounded-xl border border-border space-y-3">
              <span className="text-xs font-semibold text-foreground block">Add Additional Column</span>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Flashcards, Video Lecture, Mock Exam"
                  value={customSectionName}
                  onChange={(e) => setCustomSectionName(e.target.value)}
                />
                <Button type="submit" disabled={isAddingSection || !customSectionName.trim()} className="shrink-0 gap-1.5">
                  <Plus className="size-4" /> Add
                </Button>
              </div>
            </form>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="gap-2">
                Next: Add Syllabus Topics
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: INTERACTIVE SYLLABUS EDITOR */}
      {step === 3 && (
        <Card className="shadow-xs border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                3
              </span>
              Add Subjects & Syllabus Topics
            </CardTitle>
            <CardDescription>
              Interactively add your exam subjects and study topics. Every addition is saved to Supabase in real-time!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Form 1: Add Subject */}
            <form onSubmit={handleAddSubject} className="p-4 bg-muted/30 rounded-xl border border-border space-y-3">
              <span className="text-xs font-semibold text-foreground block">1. Add Subject</span>
              <div className="flex gap-2">
                <Input
                  placeholder="Subject Name (e.g. Biochemistry, Criminal Law)"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
                <Button type="submit" disabled={isAddingSubject || !subjectName.trim()} className="shrink-0 gap-1.5">
                  <Plus className="size-4" /> Add Subject
                </Button>
              </div>
            </form>

            {/* Form 2: Add Topic */}
            {workspaceData.subjects.length > 0 && (
              <form onSubmit={handleAddTopic} className="p-4 bg-muted/30 rounded-xl border border-border space-y-3">
                <span className="text-xs font-semibold text-foreground block">2. Add Topic under Subject</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-xs sm:text-sm rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">Select Target Subject...</option>
                  {workspaceData.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <Input
                    placeholder="Topic Name (e.g. Enzyme Kinetics, Contractual Breach)"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                  />
                  <Button
                    type="submit"
                    disabled={isAddingTopic || !selectedSubjectId || !topicName.trim()}
                    className="shrink-0 gap-1.5"
                  >
                    <Plus className="size-4" /> Add Topic
                  </Button>
                </div>
              </form>
            )}

            {/* Current Syllabus Preview List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
                Added Syllabus Items ({workspaceData.topics.length} Topics)
              </span>

              {workspaceData.subjects.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No subjects added yet. Add a subject above!</p>
              ) : (
                workspaceData.subjects.map((subject) => {
                  const subTopics = workspaceData.topics.filter((t) => t.subject_id === subject.id);
                  return (
                    <div key={subject.id} className="p-3 rounded-lg border border-border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{subject.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {subTopics.length} Topics
                        </Badge>
                      </div>

                      <div className="space-y-1 pl-2 border-l-2 border-primary/40 text-xs">
                        {subTopics.map((topic) => (
                          <div key={topic.id} className="py-1 text-foreground">
                            • {topic.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} className="gap-2">
                Next: Finalize & Launch
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: PREVIEW & LAUNCH */}
      {step === 4 && (
        <Card className="shadow-xs border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                4
              </span>
              Review & Launch Tracker
            </CardTitle>
            <CardDescription>
              Your exam tracker is saved and ready for daily study review!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{examName}</span>
                {examDate && <Badge variant="outline">{examDate}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                {workspaceData.subjects.length} Subjects • {workspaceData.topics.length} Topics • {workspaceData.sections.length} Checklist Columns
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={handleFinish} className="gap-2 shadow-sm">
                <CheckCircle2 className="size-4" />
                Launch Tracker Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
