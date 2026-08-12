"use client";

import React from "react";
import {
  Plus,
  Trash2,
  Layers,
  CheckSquare,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { ActiveAdderForm } from "../types";

interface ChecklistColumn {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  subject_id: string;
  name: string;
}

interface Topic {
  id: string;
  subject_id: string;
  chapter_id: string | null;
  name: string;
}

interface ReviewMatrixTableProps {
  checklists: ChecklistColumn[];
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  isMaxColumnsReached: boolean;
  onDeleteSectionColumn: (id: string) => void;
  onDeleteSubject: (id: string) => void;
  onDeleteChapter: (id: string) => void;
  onDeleteTopic: (id: string) => void;
  onOpenAdderForm: (form: ActiveAdderForm, subjectId?: string) => void;
  onNavBack: () => void;
  onFinish: () => void;
}

export function ReviewMatrixTable({
  checklists,
  subjects,
  chapters,
  topics,
  isMaxColumnsReached,
  onDeleteSectionColumn,
  onDeleteSubject,
  onDeleteChapter,
  onDeleteTopic,
  onOpenAdderForm,
  onNavBack,
  onFinish,
}: ReviewMatrixTableProps) {
  return (
    <div className="space-y-6">
      {/* Spreadsheet-Style Interactive Matrix Table (shadcn Table) */}
      <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <Table className="w-full text-left text-sm border-collapse min-w-[650px]">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider font-semibold hover:bg-muted/60">
              <TableHead className="px-4 py-3 min-w-[260px] sticky left-0 z-10 bg-muted/90 backdrop-blur-xs border-r border-border">
                Syllabus Topic / Row
              </TableHead>

              {/* Dynamic Section Columns */}
              {checklists.map((section) => (
                <TableHead
                  key={section.id}
                  className="px-3 py-2.5 text-center min-w-[120px] font-semibold border-r border-border/40 group relative"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="truncate max-w-[90px]">{section.name}</span>
                    <button
                      type="button"
                      title={`Delete ${section.name} column`}
                      onClick={() => onDeleteSectionColumn(section.id)}
                      className="text-muted-foreground/60 hover:text-destructive p-0.5 rounded-xs transition-colors cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </TableHead>
              ))}

              {/* Rightmost Cell to Add Column directly in Header */}
              <TableHead className="px-3 py-2.5 text-center min-w-[110px] bg-muted/30">
                <Button
                  variant="ghost"
                  size="xs"
                  disabled={isMaxColumnsReached}
                  onClick={() => onOpenAdderForm("section")}
                  className="text-xs gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="size-3" />
                  {isMaxColumnsReached ? "Limit (10)" : "Column"}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border/60">
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={checklists.length + 2}
                  className="p-8 text-center text-muted-foreground text-xs italic"
                >
                  No subjects added yet. Click <strong>+ Add Subject</strong> above to build your review matrix!
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => {
                const subChapters = chapters.filter((ch) => ch.subject_id === subject.id);
                const subTopics = topics.filter((t) => t.subject_id === subject.id);
                const ungroupedTopics = subTopics.filter((t) => !t.chapter_id);

                return (
                  <React.Fragment key={subject.id}>
                    {/* Subject Row Header */}
                    <TableRow className="bg-muted/50 font-bold text-foreground border-t border-border hover:bg-muted/50">
                      <TableCell
                        colSpan={checklists.length + 2}
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
                              onClick={() => onOpenAdderForm("chapter", subject.id)}
                              className="h-6 text-[11px] gap-1 text-primary hover:text-primary"
                            >
                              <Plus className="size-3" /> Chapter
                            </Button>

                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onOpenAdderForm("topic", subject.id)}
                              className="h-6 text-[11px] gap-1 text-primary hover:text-primary"
                            >
                              <Plus className="size-3" /> Topic
                            </Button>

                            <button
                              type="button"
                              title={`Delete ${subject.name}`}
                              onClick={() => onDeleteSubject(subject.id)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded-xs transition-colors cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Chapter Groups */}
                    {subChapters.map((chapter) => {
                      const chapterTopics = subTopics.filter((t) => t.chapter_id === chapter.id);
                      return (
                        <React.Fragment key={chapter.id}>
                          <TableRow className="bg-muted/20 text-xs font-semibold text-muted-foreground hover:bg-muted/20">
                            <TableCell
                              colSpan={checklists.length + 2}
                              className="px-6 py-1.5 sticky left-0 z-10 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-1.5">
                                <Layers className="size-3.5 text-primary" />
                                <span>{chapter.name}</span>
                              </div>
                              <button
                                type="button"
                                title={`Delete ${chapter.name}`}
                                onClick={() => onDeleteChapter(chapter.id)}
                                className="text-muted-foreground/60 hover:text-destructive p-0.5 rounded-xs transition-colors cursor-pointer"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </TableCell>
                          </TableRow>

                          {chapterTopics.map((topic) => (
                            <TableRow key={topic.id} className="hover:bg-accent/40 transition-colors group">
                              <TableCell className="px-8 py-2 font-medium text-foreground sticky left-0 z-10 bg-card group-hover:bg-accent/40 border-r border-border/60">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs">{topic.name}</span>
                                  <button
                                    type="button"
                                    title={`Delete ${topic.name}`}
                                    onClick={() => onDeleteTopic(topic.id)}
                                    className="text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                </div>
                              </TableCell>

                              {checklists.map((section) => (
                                <TableCell key={section.id} className="px-2 py-2 text-center border-r border-border/40">
                                  <div
                                    className="mx-auto size-6 rounded-md border border-input bg-background/50 flex items-center justify-center opacity-40"
                                    title="Preview status checkbox cell"
                                  >
                                    <CheckSquare className="size-3 text-muted-foreground" />
                                  </div>
                                </TableCell>
                              ))}

                              <TableCell className="px-2 py-2 bg-muted/10" />
                            </TableRow>
                          ))}
                        </React.Fragment>
                      );
                    })}

                    {/* Ungrouped Topics */}
                    {ungroupedTopics.map((topic) => (
                      <TableRow key={topic.id} className="hover:bg-accent/40 transition-colors group">
                        <TableCell className="px-6 py-2 font-medium text-foreground sticky left-0 z-10 bg-card group-hover:bg-accent/40 border-r border-border/60">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs">{topic.name}</span>
                            <button
                              type="button"
                              title={`Delete ${topic.name}`}
                              onClick={() => onDeleteTopic(topic.id)}
                              className="text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </TableCell>

                        {checklists.map((section) => (
                          <TableCell key={section.id} className="px-2 py-2 text-center border-r border-border/40">
                            <div
                              className="mx-auto size-6 rounded-md border border-input bg-background/50 flex items-center justify-center opacity-40"
                              title="Preview status checkbox cell"
                            >
                              <CheckSquare className="size-3 text-muted-foreground" />
                            </div>
                          </TableCell>
                        ))}

                        <TableCell className="px-2 py-2 bg-muted/10" />
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Form Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={onNavBack}>
          Back to Exam Info
        </Button>
        <Button onClick={onFinish} className="gap-2 shadow-sm">
          <CheckCircle2 className="size-4" />
          Launch Tracker Workspace
        </Button>
      </div>
    </div>
  );
}
