"use client";

import React, { useState } from "react";
import { Plus, Trash2, Layers, BookOpen, CheckSquare, Settings2, Edit3, Check, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Field, FieldLabel } from "@/src/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useTrackerWorkspace } from "@/src/hooks/use-tracker-workspace";
import { DeleteStructureConfirmDialog } from "./delete-structure-confirm-dialog";

interface StructureEditorProps {
  examTrackerId: string;
  trigger?: React.ReactNode;
}

export function WorkspaceStructureEditor({ examTrackerId, trigger }: StructureEditorProps) {
  const {
    checklists,
    subjects,
    chapters,
    topics,
    addSubject,
    addChapter,
    addTopic,
    addSectionColumn,
    deleteTopic,
    deleteSubject,
    deleteChapter,
    deleteSectionColumn,
    updateSubject,
    updateChapter,
    updateTopic,
    updateSectionColumn,
  } = useTrackerWorkspace(examTrackerId);

  // Form states
  const [subjectName, setSubjectName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [topicName, setTopicName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Inline Rename States
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectName, setEditSubjectName] = useState("");

  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterName, setEditChapterName] = useState("");

  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editTopicName, setEditTopicName] = useState("");

  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editColumnName, setEditColumnName] = useState("");

  // Delete Confirmation Dialog State
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: "subject" | "chapter";
    name: string;
    topicCount: number;
  } | null>(null);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    setActionError(null);
    try {
      await addSubject({ name: subjectName.trim() });
      setSubjectName("");
    } catch (err: any) {
      setActionError(err?.message || "Failed to add subject");
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !chapterName.trim()) return;
    setActionError(null);
    try {
      await addChapter({ subjectId: selectedSubjectId, name: chapterName.trim() });
      setChapterName("");
    } catch (err: any) {
      setActionError(err?.message || "Failed to add chapter");
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !topicName.trim()) return;
    setActionError(null);
    try {
      await addTopic({
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId || null,
        name: topicName.trim(),
      });
      setTopicName("");
    } catch (err: any) {
      setActionError(err?.message || "Failed to add topic");
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim()) return;
    setActionError(null);
    try {
      await addSectionColumn({ name: sectionName.trim() });
      setSectionName("");
    } catch (err: any) {
      setActionError(err?.message || "Failed to add section column");
    }
  };

  const handleSaveSubjectRename = async (id: string) => {
    if (!editSubjectName.trim()) return;
    setActionError(null);
    try {
      await updateSubject({ subjectId: id, name: editSubjectName.trim() });
      setEditingSubjectId(null);
    } catch (err: any) {
      setActionError(err?.message || "Failed to rename subject");
    }
  };

  const handleSaveChapterRename = async (id: string) => {
    if (!editChapterName.trim()) return;
    setActionError(null);
    try {
      await updateChapter({ chapterId: id, name: editChapterName.trim() });
      setEditingChapterId(null);
    } catch (err: any) {
      setActionError(err?.message || "Failed to rename chapter");
    }
  };

  const handleSaveTopicRename = async (id: string) => {
    if (!editTopicName.trim()) return;
    setActionError(null);
    try {
      await updateTopic({ topicId: id, name: editTopicName.trim() });
      setEditingTopicId(null);
    } catch (err: any) {
      setActionError(err?.message || "Failed to rename topic");
    }
  };

  const handleSaveColumnRename = async (id: string) => {
    if (!editColumnName.trim()) return;
    setActionError(null);
    try {
      await updateSectionColumn({ checklistId: id, name: editColumnName.trim() });
      setEditingColumnId(null);
    } catch (err: any) {
      setActionError(err?.message || "Failed to rename section column");
    }
  };

  const handleDeleteChecklistColumn = async (id: string) => {
    if (checklists.length <= 1) {
      setActionError("Trackers must maintain at least 1 section column.");
      return;
    }
    setActionError(null);
    try {
      await deleteSectionColumn(id);
    } catch (err: any) {
      setActionError(err?.message || "Failed to delete section column");
    }
  };

  const promptDeleteSubject = (id: string, name: string) => {
    const subTopics = topics.filter((t) => t.subject_id === id);
    setDeleteTarget({
      id,
      type: "subject",
      name,
      topicCount: subTopics.length,
    });
  };

  const promptDeleteChapter = (id: string, name: string) => {
    const chapterTopics = topics.filter((t) => t.chapter_id === id);
    setDeleteTarget({
      id,
      type: "chapter",
      name,
      topicCount: chapterTopics.length,
    });
  };

  const confirmDeleteTarget = async () => {
    if (!deleteTarget) return;
    setActionError(null);
    try {
      if (deleteTarget.type === "subject") {
        await deleteSubject(deleteTarget.id);
      } else {
        await deleteChapter(deleteTarget.id);
      }
    } catch (err: any) {
      setActionError(err?.message || `Failed to delete ${deleteTarget.type}`);
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredChapters = chapters.filter((ch) => ch.subject_id === selectedSubjectId);

  return (
    <>
      <Sheet>
        <SheetTrigger
          render={
            trigger ? (
              (trigger as React.ReactElement)
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings2 className="size-4" />
                Manage Syllabus & Columns
              </Button>
            )
          }
        />
        <SheetContent side="right" className="w-[340px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader className="text-left pb-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="size-5 text-primary" />
              Manage Syllabus & Columns
            </SheetTitle>
          </SheetHeader>

          {actionError && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive text-xs rounded-lg border border-destructive/20">
              {actionError}
            </div>
          )}

          <Tabs defaultValue="topics" className="mt-6">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="topics" className="gap-1 text-xs">
                <BookOpen className="size-3.5" /> Subjects & Topics
              </TabsTrigger>
              <TabsTrigger value="columns" className="gap-1 text-xs">
                <CheckSquare className="size-3.5" /> Section Columns
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Manage Subjects & Topics */}
            <TabsContent value="topics" className="space-y-6">
              {/* Add Subject Form */}
              <form onSubmit={handleAddSubject} className="p-3 bg-muted/30 rounded-xl border border-border">
                <Field className="space-y-1.5">
                  <FieldLabel htmlFor="subjectNameInput">1. Add New Subject</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="subjectNameInput"
                      placeholder="Subject Name (e.g. Pathology)"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="text-sm h-9"
                    />
                    <Button type="submit" size="sm" className="shrink-0">
                      <Plus className="size-4" /> Add
                    </Button>
                  </div>
                </Field>
              </form>

              {/* Add Chapter Form */}
              {subjects.length > 0 && (
                <form onSubmit={handleAddChapter} className="p-3 bg-muted/30 rounded-xl border border-border">
                  <Field className="space-y-2">
                    <FieldLabel>2. Add Chapter under Subject (Optional)</FieldLabel>
                    <Select
                      items={subjects.map((sub) => ({ value: sub.id, label: sub.name }))}
                      value={selectedSubjectId}
                      onValueChange={(val) => {
                        setSelectedSubjectId(val ?? "");
                        setSelectedChapterId("");
                      }}
                    >
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Select Target Subject..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {subjects.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id} label={sub.name}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Chapter Title (e.g. Cardiovascular)"
                        value={chapterName}
                        onChange={(e) => setChapterName(e.target.value)}
                        className="text-sm h-9"
                      />
                      <Button type="submit" size="sm" disabled={!selectedSubjectId || !chapterName.trim()} className="shrink-0">
                        <Plus className="size-4" /> Add Chapter
                      </Button>
                    </div>
                  </Field>
                </form>
              )}

              {/* Add Topic Form */}
              {subjects.length > 0 && (
                <form onSubmit={handleAddTopic} className="p-3 bg-muted/30 rounded-xl border border-border">
                  <Field className="space-y-2">
                    <FieldLabel>3. Add Topic</FieldLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Select
                        items={subjects.map((sub) => ({ value: sub.id, label: sub.name }))}
                        value={selectedSubjectId}
                        onValueChange={(val) => {
                          setSelectedSubjectId(val ?? "");
                          setSelectedChapterId("");
                        }}
                      >
                        <SelectTrigger className="w-full h-9 text-xs">
                          <SelectValue placeholder="Select Subject..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {subjects.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id} label={sub.name}>
                                {sub.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      <Select
                        items={[
                          { value: "none", label: "No Chapter (Directly under Subject)" },
                          ...filteredChapters.map((ch) => ({ value: ch.id, label: ch.name })),
                        ]}
                        value={selectedChapterId || "none"}
                        onValueChange={(val) => setSelectedChapterId(!val || val === "none" ? "" : val)}
                        disabled={!selectedSubjectId}
                      >
                        <SelectTrigger className="w-full h-9 text-xs disabled:opacity-50">
                          <SelectValue placeholder="No Chapter (Directly under Subject)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="none" label="No Chapter (Directly under Subject)">
                              No Chapter (Directly under Subject)
                            </SelectItem>
                            {filteredChapters.map((ch) => (
                              <SelectItem key={ch.id} value={ch.id} label={ch.name}>
                                {ch.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Topic Title (e.g. Action Potential)"
                        value={topicName}
                        onChange={(e) => setTopicName(e.target.value)}
                        className="text-sm h-9"
                      />
                      <Button type="submit" size="sm" disabled={!selectedSubjectId || !topicName.trim()} className="shrink-0">
                        <Plus className="size-4" /> Add Topic
                      </Button>
                    </div>
                  </Field>
                </form>
              )}

              {/* Existing Subjects, Chapters & Topics List */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
                  Current Syllabus Items ({topics.length} Topics, {chapters.length} Chapters)
                </span>

                {subjects.map((subject) => {
                  const subChapters = chapters.filter((ch) => ch.subject_id === subject.id);
                  const ungroupedTopics = topics.filter(
                    (t) => t.subject_id === subject.id && (!t.chapter_id || t.chapter_id === null)
                  );

                  return (
                    <div key={subject.id} className="p-3 rounded-lg border border-border bg-card space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        {editingSubjectId === subject.id ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <Input
                              autoFocus
                              value={editSubjectName}
                              onChange={(e) => setEditSubjectName(e.target.value)}
                              className="h-7 text-xs font-bold"
                            />
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleSaveSubjectRename(subject.id)}
                              className="text-primary hover:bg-primary/10"
                            >
                              <Check className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setEditingSubjectId(null)}
                              className="text-muted-foreground"
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="font-bold text-sm truncate">{subject.name}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => {
                                  setEditingSubjectId(subject.id);
                                  setEditSubjectName(subject.name);
                                }}
                                className="text-muted-foreground hover:text-foreground"
                                title={`Rename ${subject.name}`}
                              >
                                <Edit3 className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => promptDeleteSubject(subject.id, subject.name)}
                                className="text-destructive hover:bg-destructive/10"
                                title={`Delete ${subject.name}`}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Chapter Groups */}
                      {subChapters.map((chapter) => {
                        const chapterTopics = topics.filter((t) => t.chapter_id === chapter.id);
                        return (
                          <div key={chapter.id} className="pl-2 border-l-2 border-primary/50 space-y-1">
                            <div className="flex items-center justify-between py-1 bg-muted/30 px-2 rounded-md gap-2">
                              {editingChapterId === chapter.id ? (
                                <div className="flex items-center gap-1.5 flex-1">
                                  <Input
                                    autoFocus
                                    value={editChapterName}
                                    onChange={(e) => setEditChapterName(e.target.value)}
                                    className="h-6 text-xs font-semibold"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => handleSaveChapterRename(chapter.id)}
                                    className="text-primary"
                                  >
                                    <Check className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => setEditingChapterId(null)}
                                    className="text-muted-foreground"
                                  >
                                    <X className="size-3" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                                    <Layers className="size-3.5 text-primary shrink-0" />
                                    {chapter.name}
                                  </span>
                                  <div className="flex items-center gap-0.5">
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => {
                                        setEditingChapterId(chapter.id);
                                        setEditChapterName(chapter.name);
                                      }}
                                      className="text-muted-foreground hover:text-foreground"
                                      title={`Rename chapter ${chapter.name}`}
                                    >
                                      <Edit3 className="size-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => promptDeleteChapter(chapter.id, chapter.name)}
                                      className="text-muted-foreground hover:text-destructive"
                                      title={`Delete chapter ${chapter.name}`}
                                    >
                                      <Trash2 className="size-3" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="pl-3 space-y-1 text-xs">
                              {chapterTopics.map((topic) => (
                                <div key={topic.id} className="flex items-center justify-between py-0.5 group gap-2">
                                  {editingTopicId === topic.id ? (
                                    <div className="flex items-center gap-1.5 flex-1">
                                      <Input
                                        autoFocus
                                        value={editTopicName}
                                        onChange={(e) => setEditTopicName(e.target.value)}
                                        className="h-6 text-xs"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => handleSaveTopicRename(topic.id)}
                                        className="text-primary"
                                      >
                                        <Check className="size-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => setEditingTopicId(null)}
                                        className="text-muted-foreground"
                                      >
                                        <X className="size-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="truncate">{topic.name}</span>
                                      <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                                        <Button
                                          variant="ghost"
                                          size="icon-xs"
                                          onClick={() => {
                                            setEditingTopicId(topic.id);
                                            setEditTopicName(topic.name);
                                          }}
                                          className="text-muted-foreground hover:text-foreground"
                                          title={`Rename topic ${topic.name}`}
                                        >
                                          <Edit3 className="size-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon-xs"
                                          onClick={() => deleteTopic(topic.id)}
                                          className="text-muted-foreground hover:text-destructive"
                                        >
                                          <Trash2 className="size-3" />
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Ungrouped Topics directly under Subject */}
                      {ungroupedTopics.length > 0 && (
                        <div className="pl-2 border-l-2 border-muted-foreground/30 space-y-1 text-xs">
                          {subChapters.length > 0 && (
                            <span className="text-[11px] text-muted-foreground font-medium block pt-1">Ungrouped Topics:</span>
                          )}
                          {ungroupedTopics.map((topic) => (
                            <div key={topic.id} className="flex items-center justify-between py-0.5 group gap-2">
                              {editingTopicId === topic.id ? (
                                <div className="flex items-center gap-1.5 flex-1">
                                  <Input
                                    autoFocus
                                    value={editTopicName}
                                    onChange={(e) => setEditTopicName(e.target.value)}
                                    className="h-6 text-xs"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => handleSaveTopicRename(topic.id)}
                                    className="text-primary"
                                  >
                                    <Check className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => setEditingTopicId(null)}
                                    className="text-muted-foreground"
                                  >
                                    <X className="size-3" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="truncate">{topic.name}</span>
                                  <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => {
                                        setEditingTopicId(topic.id);
                                        setEditTopicName(topic.name);
                                      }}
                                      className="text-muted-foreground hover:text-foreground"
                                      title={`Rename topic ${topic.name}`}
                                    >
                                      <Edit3 className="size-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => deleteTopic(topic.id)}
                                      className="text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="size-3" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Tab 2: Manage Section Columns */}
            <TabsContent value="columns" className="space-y-6">
              <form onSubmit={handleAddSection} className="p-3 bg-muted/30 rounded-xl border border-border">
                <Field className="space-y-1.5">
                  <FieldLabel htmlFor="sectionColumnInput">Add Custom Section Column</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="sectionColumnInput"
                      placeholder="Column Name (e.g. Flashcards)"
                      value={sectionName}
                      onChange={(e) => setSectionName(e.target.value)}
                      className="text-sm h-9"
                    />
                    <Button type="submit" size="sm" className="shrink-0">
                      <Plus className="size-4" /> Add Column
                    </Button>
                  </div>
                </Field>
              </form>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
                  Active Columns ({checklists.length})
                </span>

                {checklists.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-sm gap-2"
                  >
                    {editingColumnId === section.id ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <Input
                          autoFocus
                          value={editColumnName}
                          onChange={(e) => setEditColumnName(e.target.value)}
                          className="h-7 text-xs font-medium"
                        />
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleSaveColumnRename(section.id)}
                          className="text-primary hover:bg-primary/10"
                        >
                          <Check className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setEditingColumnId(null)}
                          className="text-muted-foreground"
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 truncate">
                          <CheckSquare className="size-4 text-primary shrink-0" />
                          <span className="font-medium truncate">{section.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              setEditingColumnId(section.id);
                              setEditColumnName(section.name);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                            title={`Rename ${section.name}`}
                          >
                            <Edit3 className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled={checklists.length <= 1}
                            onClick={() => handleDeleteChecklistColumn(section.id)}
                            className="text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:hover:bg-transparent"
                            title={
                              checklists.length <= 1
                                ? "Trackers must have at least 1 section column"
                                : `Delete ${section.name}`
                            }
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteStructureConfirmDialog
          isOpen={true}
          itemType={deleteTarget.type}
          itemName={deleteTarget.name}
          topicCount={deleteTarget.topicCount}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteTarget}
        />
      )}
    </>
  );
}
