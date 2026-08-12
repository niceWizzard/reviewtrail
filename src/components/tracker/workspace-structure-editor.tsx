"use client";

import React, { useState } from "react";
import { Plus, Trash2, Layers, BookOpen, CheckSquare, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useTrackerWorkspace } from "@/src/hooks/use-tracker-workspace";

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
  } = useTrackerWorkspace(examTrackerId);

  // Form states
  const [subjectName, setSubjectName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [topicName, setTopicName] = useState("");
  const [sectionName, setSectionName] = useState("");

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    await addSubject({ name: subjectName.trim() });
    setSubjectName("");
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !chapterName.trim()) return;
    await addChapter({ subjectId: selectedSubjectId, name: chapterName.trim() });
    setChapterName("");
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !topicName.trim()) return;
    await addTopic({
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId || null,
      name: topicName.trim(),
    });
    setTopicName("");
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim()) return;
    await addSectionColumn({ name: sectionName.trim() });
    setSectionName("");
  };

  return (
    <Sheet>
      <SheetTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button variant="outline" size="sm" className="gap-1.5">
              <Sparkles className="size-4" />
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
            <form onSubmit={handleAddSubject} className="space-y-2 p-3 bg-muted/30 rounded-xl border border-border">
              <span className="text-xs font-semibold text-foreground block">1. Add New Subject</span>
              <div className="flex gap-2">
                <Input
                  placeholder="Subject Name (e.g. Pathology)"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="text-sm h-9"
                />
                <Button type="submit" size="sm" className="shrink-0">
                  <Plus className="size-4" /> Add
                </Button>
              </div>
            </form>

            {/* Add Chapter Form */}
            {subjects.length > 0 && (
              <form onSubmit={handleAddChapter} className="space-y-3 p-3 bg-muted/30 rounded-xl border border-border">
                <span className="text-xs font-semibold text-foreground block">2. Add Chapter under Subject (Optional)</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedChapterId("");
                  }}
                  className="w-full h-9 px-3 py-1 text-xs rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">Select Target Subject...</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
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
              </form>
            )}

            {/* Add Topic Form */}
            {subjects.length > 0 && (
              <form onSubmit={handleAddTopic} className="space-y-3 p-3 bg-muted/30 rounded-xl border border-border">
                <span className="text-xs font-semibold text-foreground block">3. Add Topic</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setSelectedChapterId("");
                    }}
                    className="w-full h-9 px-3 py-1 text-xs rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="">Select Subject...</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    disabled={!selectedSubjectId}
                    className="w-full h-9 px-3 py-1 text-xs rounded-md border border-input bg-background text-foreground disabled:opacity-50"
                  >
                    <option value="">No Chapter (Directly under Subject)</option>
                    {chapters
                      .filter((ch) => ch.subject_id === selectedSubjectId)
                      .map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.name}
                        </option>
                      ))}
                  </select>
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
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{subject.name}</span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => deleteSubject(subject.id)}
                        className="text-destructive hover:bg-destructive/10"
                        title={`Delete ${subject.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    {/* Chapter Groups */}
                    {subChapters.map((chapter) => {
                      const chapterTopics = topics.filter((t) => t.chapter_id === chapter.id);
                      return (
                        <div key={chapter.id} className="pl-2 border-l-2 border-primary/50 space-y-1">
                          <div className="flex items-center justify-between py-1 bg-muted/30 px-2 rounded-md">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <Layers className="size-3.5 text-primary" />
                              {chapter.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => deleteChapter(chapter.id)}
                              className="text-muted-foreground hover:text-destructive"
                              title={`Delete chapter ${chapter.name}`}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>

                          <div className="pl-3 space-y-1 text-xs">
                            {chapterTopics.map((topic) => (
                              <div key={topic.id} className="flex items-center justify-between py-0.5 group">
                                <span>{topic.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => deleteTopic(topic.id)}
                                  className="text-muted-foreground hover:text-destructive opacity-80 group-hover:opacity-100"
                                >
                                  <Trash2 className="size-3" />
                                </Button>
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
                          <div key={topic.id} className="flex items-center justify-between py-0.5 group">
                            <span>{topic.name}</span>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => deleteTopic(topic.id)}
                              className="text-muted-foreground hover:text-destructive opacity-80 group-hover:opacity-100"
                            >
                              <Trash2 className="size-3" />
                            </Button>
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
            <form onSubmit={handleAddSection} className="space-y-2 p-3 bg-muted/30 rounded-xl border border-border">
              <span className="text-xs font-semibold text-foreground block">Add Custom Section Column</span>
              <div className="flex gap-2">
                <Input
                  placeholder="Column Name (e.g. Flashcards)"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="text-sm h-9"
                />
                <Button type="submit" size="sm" className="shrink-0">
                  <Plus className="size-4" /> Add Column
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
                Active Columns ({checklists.length})
              </span>

              {checklists.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-sm"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="size-4 text-primary" />
                    <span className="font-medium">{section.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => deleteSectionColumn(section.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
