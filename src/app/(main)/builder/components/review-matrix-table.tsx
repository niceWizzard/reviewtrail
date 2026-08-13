"use client";

import React from "react";
import {
  Plus,
  Trash2,
  Layers,
  CheckSquare,
  CheckCircle2,
  X,
  Loader2,
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
import { DoubleClickInlineInput } from "@/src/components/ui/double-click-inline-input";
import { ActiveAdderForm } from "../types";

export interface MatrixChecklist {
  tempId?: string;
  id?: string;
  name: string;
}

export interface MatrixSubject {
  tempId?: string;
  id?: string;
  name: string;
}

export interface MatrixChapter {
  tempId?: string;
  id?: string;
  subjectTempId?: string;
  subject_id?: string;
  name: string;
}

export interface MatrixTopic {
  tempId?: string;
  id?: string;
  subjectTempId?: string;
  subject_id?: string;
  chapterTempId?: string | null;
  chapter_id?: string | null;
  name: string;
}

interface ReviewMatrixTableProps {
  checklists: MatrixChecklist[];
  subjects: MatrixSubject[];
  chapters: MatrixChapter[];
  topics: MatrixTopic[];
  isMaxColumnsReached: boolean;
  isCommitting?: boolean;
  showBottomBar?: boolean;
  onDeleteSectionColumn: (id: string) => void;
  onDeleteSubject: (id: string) => void;
  onDeleteChapter: (id: string) => void;
  onDeleteTopic: (id: string) => void;
  onRenameSectionColumn?: (id: string, newName: string) => void;
  onRenameSubject?: (id: string, newName: string) => void;
  onRenameChapter?: (id: string, newName: string) => void;
  onRenameTopic?: (id: string, newName: string) => void;
  onOpenAdderForm: (form: ActiveAdderForm, subjectId?: string) => void;
  onNavBack?: () => void;
  onFinish?: () => void;
}

export function ReviewMatrixTable({
  checklists,
  subjects,
  chapters,
  topics,
  isMaxColumnsReached,
  isCommitting = false,
  showBottomBar = true,
  onDeleteSectionColumn,
  onDeleteSubject,
  onDeleteChapter,
  onDeleteTopic,
  onRenameSectionColumn,
  onRenameSubject,
  onRenameChapter,
  onRenameTopic,
  onOpenAdderForm,
  onNavBack,
  onFinish,
}: ReviewMatrixTableProps) {
  const isMinColumnsReached = checklists.length <= 1;

  const getItemId = (item: { tempId?: string; id?: string }) => item.tempId || item.id || "";
  const getSubId = (item: { subjectTempId?: string; subject_id?: string }) => item.subjectTempId || item.subject_id || "";
  const getChId = (item: { chapterTempId?: string | null; chapter_id?: string | null }) =>
    item.chapterTempId !== undefined ? item.chapterTempId : item.chapter_id ?? null;

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
              {checklists.map((section) => {
                const sectionId = getItemId(section);
                return (
                  <TableHead
                    key={sectionId}
                    className="px-3 py-2.5 text-center min-w-[140px] font-semibold border-r border-border/40 group relative"
                  >
                    <div className="flex items-center justify-center gap-1 min-w-0">
                      <DoubleClickInlineInput
                        value={section.name}
                        onSave={(val) => onRenameSectionColumn?.(sectionId, val)}
                        className="truncate max-w-[110px]"
                      />
                      <button
                        type="button"
                        disabled={isMinColumnsReached}
                        title={
                          isMinColumnsReached
                            ? "Trackers must have at least 1 section column"
                            : `Delete ${section.name} column`
                        }
                        onClick={() => onDeleteSectionColumn(sectionId)}
                        className="text-muted-foreground/60 hover:text-destructive disabled:opacity-30 disabled:hover:text-muted-foreground/60 p-0.5 rounded-xs transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  </TableHead>
                );
              })}

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
                  No subjects added yet. Click <strong>+ Add Subject</strong> above to build your review table!
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => {
                const subjectId = getItemId(subject);
                const subChapters = chapters.filter((ch) => getSubId(ch) === subjectId);
                const subTopics = topics.filter((t) => getSubId(t) === subjectId);
                const ungroupedTopics = subTopics.filter((t) => !getChId(t));

                return (
                  <React.Fragment key={subjectId}>
                    {/* Subject Row Header */}
                    <TableRow className="bg-muted/50 font-bold text-foreground border-t border-border hover:bg-muted/50">
                      <TableCell
                        colSpan={checklists.length + 2}
                        className="px-4 py-2 bg-muted/60 sticky left-0 z-10"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="size-2 rounded-full bg-primary shrink-0" />
                            <DoubleClickInlineInput
                              value={subject.name}
                              onSave={(val) => onRenameSubject?.(subjectId, val)}
                              className="text-sm font-semibold"
                            />
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                              {subTopics.length} Topics
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onOpenAdderForm("chapter", subjectId)}
                              className="h-6 text-[11px] gap-1 text-primary hover:text-primary"
                            >
                              <Plus className="size-3" /> Chapter
                            </Button>

                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onOpenAdderForm("topic", subjectId)}
                              className="h-6 text-[11px] gap-1 text-primary hover:text-primary"
                            >
                              <Plus className="size-3" /> Topic
                            </Button>

                            <button
                              type="button"
                              title={`Delete ${subject.name}`}
                              onClick={() => onDeleteSubject(subjectId)}
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
                      const chapterId = getItemId(chapter);
                      const chapterTopics = subTopics.filter((t) => getChId(t) === chapterId);
                      return (
                        <React.Fragment key={chapterId}>
                          <TableRow className="bg-muted/20 text-xs font-semibold text-muted-foreground hover:bg-muted/20">
                            <TableCell
                              colSpan={checklists.length + 2}
                              className="px-6 py-1.5 sticky left-0 z-10 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Layers className="size-3.5 text-primary shrink-0" />
                                <DoubleClickInlineInput
                                  value={chapter.name}
                                  onSave={(val) => onRenameChapter?.(chapterId, val)}
                                />
                              </div>
                              <button
                                type="button"
                                title={`Delete ${chapter.name}`}
                                onClick={() => onDeleteChapter(chapterId)}
                                className="text-muted-foreground/60 hover:text-destructive p-0.5 rounded-xs transition-colors cursor-pointer shrink-0"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </TableCell>
                          </TableRow>

                          {chapterTopics.map((topic) => {
                            const topicId = getItemId(topic);
                            return (
                              <TableRow key={topicId} className="hover:bg-accent/40 transition-colors group">
                                <TableCell className="px-8 py-2 font-medium text-foreground sticky left-0 z-10 bg-card group-hover:bg-accent/40 border-r border-border/60">
                                  <div className="flex items-center justify-between gap-2 min-w-0">
                                    <DoubleClickInlineInput
                                      value={topic.name}
                                      onSave={(val) => onRenameTopic?.(topicId, val)}
                                      className="text-xs min-w-0 flex-1"
                                    />
                                    <button
                                      type="button"
                                      title={`Delete ${topic.name}`}
                                      onClick={() => onDeleteTopic(topicId)}
                                      className="text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer shrink-0"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  </div>
                                </TableCell>

                                {checklists.map((section) => {
                                  const sectionId = getItemId(section);
                                  return (
                                    <TableCell key={sectionId} className="px-2 py-2 text-center border-r border-border/40">
                                      <div
                                        className="mx-auto size-6 rounded-md border border-input bg-background/50 flex items-center justify-center opacity-40"
                                        title="Preview status checkbox cell"
                                      >
                                        <CheckSquare className="size-3 text-muted-foreground" />
                                      </div>
                                    </TableCell>
                                  );
                                })}

                                <TableCell className="px-2 py-2 bg-muted/10" />
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}

                    {/* Ungrouped Topics */}
                    {ungroupedTopics.map((topic) => {
                      const topicId = getItemId(topic);
                      return (
                        <TableRow key={topicId} className="hover:bg-accent/40 transition-colors group">
                          <TableCell className="px-6 py-2 font-medium text-foreground sticky left-0 z-10 bg-card group-hover:bg-accent/40 border-r border-border/60">
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <DoubleClickInlineInput
                                value={topic.name}
                                onSave={(val) => onRenameTopic?.(topicId, val)}
                                className="text-xs min-w-0 flex-1"
                              />
                              <button
                                type="button"
                                title={`Delete ${topic.name}`}
                                onClick={() => onDeleteTopic(topicId)}
                                className="text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer shrink-0"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </TableCell>

                          {checklists.map((section) => {
                            const sectionId = getItemId(section);
                            return (
                              <TableCell key={sectionId} className="px-2 py-2 text-center border-r border-border/40">
                                <div
                                  className="mx-auto size-6 rounded-md border border-input bg-background/50 flex items-center justify-center opacity-40"
                                  title="Preview status checkbox cell"
                                >
                                  <CheckSquare className="size-3 text-muted-foreground" />
                                </div>
                              </TableCell>
                            );
                          })}

                          <TableCell className="px-2 py-2 bg-muted/10" />
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Form Actions */}
      {showBottomBar && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="outline" onClick={onNavBack} disabled={isCommitting}>
            Back to Exam Info
          </Button>
          <Button onClick={onFinish} disabled={isCommitting} className="gap-2 shadow-sm">
            {isCommitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving Tracker...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Launch Tracker Workspace
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
