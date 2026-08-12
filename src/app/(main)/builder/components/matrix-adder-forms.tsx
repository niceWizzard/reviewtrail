"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Field, FieldLabel } from "@/src/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ActiveAdderForm } from "../types";

export interface MatrixAdderSubject {
  tempId?: string;
  id?: string;
  name: string;
}

export interface MatrixAdderChapter {
  tempId?: string;
  id?: string;
  subjectTempId?: string;
  subject_id?: string;
  name: string;
}

interface MatrixAdderFormsProps {
  activeAdderForm: ActiveAdderForm;
  setActiveAdderForm: (form: ActiveAdderForm) => void;
  subjects: MatrixAdderSubject[];
  chapters: MatrixAdderChapter[];
  checklistsLength: number;
  targetSubjectTempId?: string;
  targetSubjectId?: string;
  setTargetSubjectTempId?: (id: string) => void;
  setTargetSubjectId?: (id: string) => void;
  onAddSectionColumn: (name: string) => void | Promise<void>;
  isAddingSection?: boolean;
  onAddSubject: (name: string) => void | Promise<void>;
  isAddingSubject?: boolean;
  onAddChapter: (subjectId: string, name: string) => void | Promise<void>;
  onAddTopic: (subjectId: string, chapterId: string | null, name: string) => void | Promise<void>;
  isAddingTopic?: boolean;
  setErrorMessage: (msg: string | null) => void;
}

export function MatrixAdderForms({
  activeAdderForm,
  setActiveAdderForm,
  subjects,
  chapters,
  checklistsLength,
  targetSubjectTempId,
  targetSubjectId,
  setTargetSubjectTempId,
  setTargetSubjectId,
  onAddSectionColumn,
  isAddingSection = false,
  onAddSubject,
  isAddingSubject = false,
  onAddChapter,
  onAddTopic,
  isAddingTopic = false,
  setErrorMessage,
}: MatrixAdderFormsProps) {
  const [newSectionName, setNewSectionName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newChapterName, setNewChapterName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [targetChapterIdState, setTargetChapterIdState] = useState("");

  const getItemId = (item: { tempId?: string; id?: string }) => item.tempId || item.id || "";
  const getSubId = (item: { subjectTempId?: string; subject_id?: string }) => item.subjectTempId || item.subject_id || "";

  const activeTargetSubjectId = targetSubjectTempId ?? targetSubjectId ?? "";
  const updateTargetSubjectId = (val: string) => {
    if (setTargetSubjectTempId) setTargetSubjectTempId(val);
    if (setTargetSubjectId) setTargetSubjectId(val);
  };

  useEffect(() => {
    setNewSectionName("");
    setNewSubjectName("");
    setNewChapterName("");
    setNewTopicName("");
    setTargetChapterIdState("");
  }, [activeAdderForm]);

  if (!activeAdderForm) return null;

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    if (checklistsLength >= 10) {
      setErrorMessage("Maximum limit of 10 checklist columns reached.");
      return;
    }
    setErrorMessage(null);
    try {
      await onAddSectionColumn(newSectionName.trim());
      setNewSectionName("");
      setActiveAdderForm(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to add column");
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    setErrorMessage(null);
    try {
      await onAddSubject(newSubjectName.trim());
      setNewSubjectName("");
      setActiveAdderForm(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to add subject");
    }
  };

  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTargetSubjectId || !newChapterName.trim()) return;
    setErrorMessage(null);
    try {
      await onAddChapter(activeTargetSubjectId, newChapterName.trim());
      setNewChapterName("");
      setActiveAdderForm(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to add chapter");
    }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTargetSubjectId || !newTopicName.trim()) return;
    setErrorMessage(null);
    try {
      await onAddTopic(activeTargetSubjectId, targetChapterIdState || null, newTopicName.trim());
      setNewTopicName("");
      setActiveAdderForm(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to add topic");
    }
  };

  const availableChapters = chapters.filter((ch) => getSubId(ch) === activeTargetSubjectId);

  return (
    <>
      {/* Inline Add Column Form */}
      {activeAdderForm === "section" && (
        <form onSubmit={handleSectionSubmit} className="p-3.5 bg-accent/30 rounded-xl border border-primary/30 space-y-2">
          <Field className="space-y-1">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="sectionName">Add New Checklist Column</FieldLabel>
              <span className="text-[11px] text-muted-foreground">{checklistsLength}/10 max</span>
            </div>
            <div className="flex gap-2">
              <Input
                id="sectionName"
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
          </Field>
        </form>
      )}

      {/* Inline Add Subject Form */}
      {activeAdderForm === "subject" && (
        <form onSubmit={handleSubjectSubmit} className="p-3.5 bg-accent/30 rounded-xl border border-primary/30 space-y-2">
          <Field className="space-y-1">
            <FieldLabel htmlFor="subjectName">Add New Subject Row</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="subjectName"
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
          </Field>
        </form>
      )}

      {/* Inline Add Chapter Form */}
      {activeAdderForm === "chapter" && (
        <form onSubmit={handleChapterSubmit} className="p-3.5 bg-accent/30 rounded-xl border border-primary/30 space-y-3">
          <Field className="space-y-1">
            <FieldLabel>Add Chapter Row under Subject</FieldLabel>
            <div className="grid sm:grid-cols-2 gap-2">
              <Select
                items={subjects.map((sub) => {
                  const subId = getItemId(sub);
                  return { value: subId, label: sub.name };
                })}
                value={activeTargetSubjectId}
                onValueChange={(val) => updateTargetSubjectId(val ?? "")}
              >
                <SelectTrigger className="h-9 text-xs sm:text-sm w-full">
                  <SelectValue placeholder="Select Target Subject..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {subjects.map((sub) => {
                      const subId = getItemId(sub);
                      return (
                        <SelectItem key={subId} value={subId}>
                          {sub.name}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Input
                autoFocus
                placeholder="Chapter Name (e.g. Cardiovascular)"
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" disabled={!activeTargetSubjectId || !newChapterName.trim()}>
                Add Chapter
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
          </Field>
        </form>
      )}

      {/* Inline Add Topic Form */}
      {activeAdderForm === "topic" && (
        <form onSubmit={handleTopicSubmit} className="p-3.5 bg-accent/30 rounded-xl border border-primary/30 space-y-3">
          <Field className="space-y-1">
            <FieldLabel>Add Topic Row under Subject</FieldLabel>
            <div className="grid sm:grid-cols-3 gap-2">
              <Select
                items={subjects.map((sub) => {
                  const subId = getItemId(sub);
                  return { value: subId, label: sub.name };
                })}
                value={activeTargetSubjectId}
                onValueChange={(val) => {
                  updateTargetSubjectId(val ?? "");
                  setTargetChapterIdState("");
                }}
              >
                <SelectTrigger className="h-9 text-xs sm:text-sm w-full">
                  <SelectValue placeholder="Select Target Subject..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {subjects.map((sub) => {
                      const subId = getItemId(sub);
                      return (
                        <SelectItem key={subId} value={subId}>
                          {sub.name}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                items={[
                  { value: "none", label: "No Chapter (Ungrouped)" },
                  ...availableChapters.map((ch) => {
                    const chId = getItemId(ch);
                    return { value: chId, label: ch.name };
                  }),
                ]}
                value={targetChapterIdState || "none"}
                onValueChange={(val) => setTargetChapterIdState(!val || val === "none" ? "" : val)}
                disabled={!activeTargetSubjectId}
              >
                <SelectTrigger className="h-9 text-xs sm:text-sm w-full disabled:opacity-50">
                  <SelectValue placeholder="No Chapter (Ungrouped)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none" label="No Chapter (Ungrouped)">
                      No Chapter (Ungrouped)
                    </SelectItem>
                    {availableChapters.map((ch) => {
                      const chId = getItemId(ch);
                      return (
                        <SelectItem key={chId} value={chId} label={ch.name}>
                          {ch.name}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Input
                autoFocus
                placeholder="Topic Title (e.g. Heart Failure)"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" disabled={isAddingTopic || !activeTargetSubjectId || !newTopicName.trim()}>
                Add Topic
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
          </Field>
        </form>
      )}
    </>
  );
}
