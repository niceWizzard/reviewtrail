"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Layers,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
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
import { cn } from "@/src/lib/utils";

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
  onRenameSectionColumn?: (id: string, newName: string) => boolean | void | Promise<boolean | void>;
  onRenameSubject?: (id: string, newName: string) => boolean | void | Promise<boolean | void>;
  onRenameChapter?: (id: string, newName: string) => boolean | void | Promise<boolean | void>;
  onRenameTopic?: (id: string, newName: string) => boolean | void | Promise<boolean | void>;
  onOpenAdderForm: (form: ActiveAdderForm, subjectId?: string) => void;
  onNavBack?: () => void;
  onFinish?: () => void;
  finishLabel?: string;
  backLabel?: string;
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
  finishLabel = "Launch Tracker Workspace",
  backLabel = "Back to Exam Info",
}: ReviewMatrixTableProps) {
  const isMinColumnsReached = checklists.length <= 1;

  const getItemId = (item: { tempId?: string; id?: string }) => item.tempId || item.id || "";
  const getSubId = (item: { subjectTempId?: string; subject_id?: string }) =>
    item.subjectTempId || item.subject_id || "";
  const getChId = (item: { chapterTempId?: string | null; chapter_id?: string | null }) =>
    item.chapterTempId !== undefined ? item.chapterTempId : item.chapter_id ?? null;

  const [activeSubjectId, setActiveSubjectId] = useState<string>(
    subjects[0] ? getItemId(subjects[0]) : ""
  );

  // Sync active subject ID if subject list changes
  React.useEffect(() => {
    if (subjects.length > 0) {
      if (!activeSubjectId || !subjects.some((s) => getItemId(s) === activeSubjectId)) {
        setActiveSubjectId(getItemId(subjects[0]));
      }
    }
  }, [subjects, activeSubjectId]);

  const currentSubject = subjects.find((s) => getItemId(s) === activeSubjectId) || subjects[0];
  const currentSubjectId = currentSubject ? getItemId(currentSubject) : "";

  const subChapters = currentSubjectId
    ? chapters.filter((ch) => getSubId(ch) === currentSubjectId)
    : [];
  const subTopics = currentSubjectId
    ? topics.filter((t) => getSubId(t) === currentSubjectId)
    : [];
  const ungroupedTopics = subTopics.filter((t) => !getChId(t));

  const selectItems = subjects.map((sub) => {
    const sId = getItemId(sub);
    const count = topics.filter((t) => getSubId(t) === sId).length;
    return {
      value: sId,
      label: `${sub.name} (${count} topics)`,
    };
  });

  return (
    <div className="space-y-4">
      {/* Mobile: Shadcn Select Subject Dropdown + Actions */}
      <div className="sm:hidden flex flex-col gap-2.5 bg-card p-3 rounded-xl border border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">
            Active Subject
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onOpenAdderForm("subject")}
            className="h-7 text-xs text-primary gap-1 p-0"
          >
            <Plus className="size-3" /> New Subject
          </Button>
        </div>

        {subjects.length > 0 ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <Select
                items={selectItems}
                value={activeSubjectId}
                onValueChange={(val) => val && setActiveSubjectId(val)}
              >
                <SelectTrigger className="w-full bg-background border-border">
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((sub) => {
                    const sId = getItemId(sub);
                    const count = topics.filter((t) => getSubId(t) === sId).length;
                    return (
                      <SelectItem
                        key={sId}
                        value={sId}
                        label={`${sub.name} (${count} topics)`}
                      >
                        {sub.name} ({count} topics)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {currentSubject && (
              <button
                type="button"
                title={`Delete ${currentSubject.name}`}
                onClick={() => onDeleteSubject(currentSubjectId)}
                className="text-muted-foreground hover:text-destructive p-2 rounded-md border border-border bg-background"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenAdderForm("subject")}
            className="w-full text-xs gap-1"
          >
            <Plus className="size-3" /> Add First Subject
          </Button>
        )}
      </div>

      {/* Desktop / Tablet: Subject Tabs Navigation Bar with In-Tab Rename & Delete */}
      <div className="hidden sm:flex sm:flex-row sm:items-end justify-between gap-3 border-b border-border">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full -mb-px pt-1" role="tablist">
          {subjects.map((sub) => {
            const sId = getItemId(sub);
            const isActive = sId === activeSubjectId;
            const count = topics.filter((t) => getSubId(t) === sId).length;

            return (
              <div
                key={sId}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSubjectId(sId)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-all border-t border-x cursor-pointer shrink-0 select-none group",
                  isActive
                    ? "bg-card text-foreground border-border font-bold z-10 -mb-[1px] bg-clip-padding border-b-transparent shadow-xs"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground border-b border-b-border"
                )}
              >
                {/* Editable Subject Name inside the tab */}
                <DoubleClickInlineInput
                  value={sub.name}
                  onSave={(val) => onRenameSubject?.(sId, val)}
                  className="truncate max-w-[140px]"
                />

                {/* Topic Count Badge */}
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-normal transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>

                {/* Delete Subject Button directly in the tab */}
                <button
                  type="button"
                  title={`Delete ${sub.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSubject(sId);
                  }}
                  className="text-muted-foreground/60 hover:text-destructive p-0.5 rounded-xs transition-colors cursor-pointer opacity-60 hover:opacity-100 shrink-0 ml-0.5"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            );
          })}

          {/* Add Subject Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenAdderForm("subject")}
            className="h-8 gap-1 text-xs shrink-0 text-primary hover:text-primary ml-1 pb-1"
          >
            <Plus className="size-3.5" />
            Add Subject
          </Button>
        </div>
      </div>

      {/* Interactive Table Area */}
      <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <Table className="w-full text-left text-sm border-collapse min-w-[650px]">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider font-semibold hover:bg-muted/60">
              <TableHead className="px-4 py-3 min-w-[260px] sticky left-0 z-10 bg-muted/90 backdrop-blur-xs border-r border-border">
                CHAPTER / TOPIC
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
                  No subjects added yet. Click &ldquo;Add Subject&rdquo; above to start.
                </TableCell>
              </TableRow>
            ) : subTopics.length === 0 && subChapters.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={checklists.length + 2}
                  className="p-8 text-center text-muted-foreground text-xs italic"
                >
                  No chapters or topics in <strong>{currentSubject?.name}</strong> yet. Use the Add Chapter or Add Topic toolbar above to add items.
                </TableCell>
              </TableRow>
            ) : (
              <React.Fragment>
                {/* Chapters with Topics */}
                {subChapters.map((chapter) => {
                  const chapterId = getItemId(chapter);
                  const chapterTopics = subTopics.filter((t) => getChId(t) === chapterId);
                  return (
                    <React.Fragment key={chapterId}>
                      {/* Chapter Divider Row */}
                      <TableRow className="bg-muted/30 text-xs font-semibold text-foreground hover:bg-muted/30 border-b border-border/40">
                        <TableCell
                          colSpan={checklists.length + 2}
                          className="px-4 py-2 sticky left-0 z-10 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Layers className="size-3.5 text-primary shrink-0" />
                            <DoubleClickInlineInput
                              value={chapter.name}
                              onSave={(val) => onRenameChapter?.(chapterId, val)}
                              className="text-xs font-semibold text-foreground"
                            />
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                              {chapterTopics.length} Topics
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              title={`Delete ${chapter.name}`}
                              onClick={() => onDeleteChapter(chapterId)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded-xs transition-colors cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {chapterTopics.length === 0 && (
                        <TableRow className="bg-muted/5 text-xs italic text-muted-foreground">
                          <TableCell colSpan={checklists.length + 2} className="px-8 py-2">
                            No topics in this chapter.
                          </TableCell>
                        </TableRow>
                      )}

                      {chapterTopics.map((topic) => {
                        const topicId = getItemId(topic);
                        return (
                          <TableRow key={topicId} className="hover:bg-muted/30 text-xs">
                            <TableCell className="px-6 py-2.5 font-medium text-foreground sticky left-0 z-10 bg-card border-r border-border/60">
                              <div className="flex items-center justify-between gap-2 pl-2">
                                <DoubleClickInlineInput
                                  value={topic.name}
                                  onSave={(val) => onRenameTopic?.(topicId, val)}
                                  className="truncate"
                                />
                                <button
                                  type="button"
                                  title={`Delete ${topic.name}`}
                                  onClick={() => onDeleteTopic(topicId)}
                                  className="text-muted-foreground hover:text-destructive p-1 rounded-xs transition-colors cursor-pointer opacity-60 hover:opacity-100 shrink-0"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </TableCell>

                            {checklists.map((section) => (
                              <TableCell
                                key={getItemId(section)}
                                className="px-2 py-2.5 text-center border-r border-border/30"
                              >
                                <div className="mx-auto size-5 rounded border border-border/60 bg-muted/20" />
                              </TableCell>
                            ))}

                            <TableCell className="px-3 py-2.5 text-center text-[10px] text-muted-foreground bg-muted/10">
                              —
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* Ungrouped Topics directly under Subject */}
                {ungroupedTopics.length > 0 && (
                  <React.Fragment>
                    {subChapters.length > 0 && (
                      <TableRow className="bg-muted/20 text-xs font-semibold text-muted-foreground hover:bg-muted/20 border-b border-border/40">
                        <TableCell colSpan={checklists.length + 2} className="px-4 py-1.5 sticky left-0 z-10">
                          General Topics
                        </TableCell>
                      </TableRow>
                    )}
                    {ungroupedTopics.map((topic) => {
                      const topicId = getItemId(topic);
                      return (
                        <TableRow key={topicId} className="hover:bg-muted/30 text-xs">
                          <TableCell className="px-6 py-2.5 font-medium text-foreground sticky left-0 z-10 bg-card border-r border-border/60">
                            <div className="flex items-center justify-between gap-2">
                              <DoubleClickInlineInput
                                value={topic.name}
                                onSave={(val) => onRenameTopic?.(topicId, val)}
                                className="truncate"
                              />
                              <button
                                type="button"
                                title={`Delete ${topic.name}`}
                                onClick={() => onDeleteTopic(topicId)}
                                className="text-muted-foreground hover:text-destructive p-1 rounded-xs transition-colors cursor-pointer opacity-60 hover:opacity-100 shrink-0"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </TableCell>

                          {checklists.map((section) => (
                            <TableCell
                              key={getItemId(section)}
                              className="px-2 py-2.5 text-center border-r border-border/30"
                            >
                              <div className="mx-auto size-5 rounded border border-border/60 bg-muted/20" />
                            </TableCell>
                          ))}

                          <TableCell className="px-3 py-2.5 text-center text-[10px] text-muted-foreground bg-muted/10">
                            —
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Actions Bar (optional) */}
      {showBottomBar && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
          {onNavBack && (
            <Button
              variant="outline"
              size="sm"
              disabled={isCommitting}
              onClick={onNavBack}
              className="w-full sm:w-auto"
            >
              {backLabel}
            </Button>
          )}

          {onFinish && (
            <Button
              size="sm"
              disabled={isCommitting}
              onClick={onFinish}
              className="w-full sm:w-auto gap-2"
            >
              {isCommitting && <Loader2 className="size-4 animate-spin" />}
              {finishLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
