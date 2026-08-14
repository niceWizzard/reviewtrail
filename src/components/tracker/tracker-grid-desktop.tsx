"use client";

import React, { useState } from "react";
import { Check, Plus, BookOpen, Layers } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import type { TrackerWorkspaceData } from "@/src/lib/types/database";
import { useTopicProgress } from "@/src/hooks/use-topic-progress";
import { cn } from "@/src/lib/utils";

interface DesktopGridProps {
  workspaceData: TrackerWorkspaceData;
  onOpenStructureEditor?: () => void;
  readOnly?: boolean;
}

export function TrackerGridDesktop({
  workspaceData,
  onOpenStructureEditor,
  readOnly = false,
}: DesktopGridProps) {
  const { tracker, checklists, subjectTree, progress } = workspaceData;
  const sections = checklists;
  const { toggleProgress } = useTopicProgress(tracker.id);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjectTree[0]?.id || ""
  );

  // Keep selectedSubjectId in sync if subjects change and active subject is removed
  React.useEffect(() => {
    if (subjectTree.length > 0) {
      if (!selectedSubjectId || !subjectTree.some((s) => s.id === selectedSubjectId)) {
        setSelectedSubjectId(subjectTree[0].id);
      }
    }
  }, [subjectTree, selectedSubjectId]);

  // Helper function to check if (topicId, sectionId) is completed
  const isChecked = (topicId: string, sectionId: string): boolean => {
    const item = progress.find((p) => p.topic_id === topicId && p.section_id === sectionId);
    return !!item?.is_completed;
  };

  if (subjectTree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-card text-card-foreground">
        <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <BookOpen className="size-6" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Subjects Added Yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Get started by adding your exam subjects, chapters, and topics to populate the review table.
        </p>
        {onOpenStructureEditor && (
          <Button onClick={onOpenStructureEditor} size="sm" className="gap-2">
            <Plus className="size-4" />
            Add Subjects & Topics
          </Button>
        )}
      </div>
    );
  }

  const currentSubject =
    subjectTree.find((s) => s.id === selectedSubjectId) || subjectTree[0];

  const allCurrentTopics = currentSubject
    ? [
        ...currentSubject.ungroupedTopics,
        ...currentSubject.chapters.flatMap((c) => c.topics),
      ]
    : [];

  const subTotalCheckboxes = allCurrentTopics.length * (sections.length || 1);
  const subCompletedCheckboxes = allCurrentTopics.reduce((acc, t) => {
    return acc + sections.filter((s) => isChecked(t.id, s.id)).length;
  }, 0);

  const subPct =
    subTotalCheckboxes > 0
      ? Math.round((subCompletedCheckboxes / subTotalCheckboxes) * 100)
      : 0;

  const selectItems = subjectTree.map((subject) => {
    const subTopics = [
      ...subject.ungroupedTopics,
      ...subject.chapters.flatMap((c) => c.topics),
    ];
    return {
      value: subject.id,
      label: `${subject.name} (${subTopics.length} topics)`,
    };
  });

  return (
    <div className="w-full space-y-3">
      {/* Mobile: Shadcn Select Dropdown View */}
      <div className="sm:hidden flex flex-col gap-2 bg-card p-3 rounded-xl border border-border">
        <span className="text-xs font-semibold text-muted-foreground">
          Select Subject
        </span>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <Select
              items={selectItems}
              value={selectedSubjectId}
              onValueChange={(val) => val && setSelectedSubjectId(val)}
            >
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="Choose subject..." />
              </SelectTrigger>
              <SelectContent>
                {subjectTree.map((subject) => {
                  const subTopics = [
                    ...subject.ungroupedTopics,
                    ...subject.chapters.flatMap((c) => c.topics),
                  ];
                  return (
                    <SelectItem
                      key={subject.id}
                      value={subject.id}
                      label={`${subject.name} (${subTopics.length} topics)`}
                    >
                      {subject.name} ({subTopics.length} topics)
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary" className="text-xs font-semibold shrink-0">
            {subPct}% Done
          </Badge>
        </div>
      </div>

      {/* Desktop / Tablet: Browser Tab Switcher */}
      <div className="hidden sm:flex sm:flex-row sm:items-end justify-between gap-3 border-b border-border">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full -mb-px pt-1" role="tablist">
          {subjectTree.map((subject) => {
            const isActive = subject.id === selectedSubjectId;
            const subTopics = [
              ...subject.ungroupedTopics,
              ...subject.chapters.flatMap((c) => c.topics),
            ];
            return (
              <button
                key={subject.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all border-t border-x cursor-pointer shrink-0",
                  isActive
                    ? "bg-card text-foreground border-border font-bold z-10 -mb-[1px] bg-clip-padding border-b-transparent shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground border-b border-b-border"
                )}
              >
                <span className="truncate max-w-[200px]">{subject.name}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-normal transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {subTopics.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subject Progress */}
        <div className="flex items-center gap-2 px-1 pb-2 shrink-0 text-xs">
          <span className="text-muted-foreground">Subject:</span>
          <Badge variant="secondary" className="font-semibold text-xs">
            {subPct}% Done ({subCompletedCheckboxes}/{subTotalCheckboxes})
          </Badge>
        </div>
      </div>

      {/* Interactive Subject Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full text-left text-sm border-collapse min-w-[650px]">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
              <th className="px-4 py-3 min-w-[260px] sticky left-0 z-10 bg-muted/90 backdrop-blur-xs border-r border-border">
                CHAPTER / TOPIC
              </th>
              {sections.map((section) => (
                <th
                  key={section.id}
                  className="px-3 py-2.5 text-center min-w-[120px] font-semibold border-r border-border/40"
                >
                  <span>{section.name}</span>
                </th>
              ))}
              <th className="px-4 py-3 text-right min-w-[90px] font-semibold">Progress</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border/60">
            {allCurrentTopics.length === 0 && (
              <tr className="bg-muted/10 text-xs italic text-muted-foreground">
                <td colSpan={sections.length + 2} className="px-6 py-6 text-center">
                  No topics in this subject yet. Click <strong>Edit Table</strong> above to add chapters and topics.
                </td>
              </tr>
            )}

            {/* Chapters with Topics */}
            {currentSubject.chapters.map((chapter) => (
              <React.Fragment key={chapter.id}>
                {/* Chapter Subheader Divider Row */}
                <tr className="bg-muted/30 text-xs font-semibold text-foreground border-b border-border/40">
                  <td
                    colSpan={sections.length + 2}
                    className="px-4 py-2 sticky left-0 z-10 flex items-center gap-1.5"
                  >
                    <Layers className="size-3.5 text-primary shrink-0" />
                    <span>{chapter.name}</span>
                    {chapter.description && (
                      <span className="text-muted-foreground/80 font-normal">
                        — {chapter.description}
                      </span>
                    )}
                  </td>
                </tr>

                {chapter.topics.length === 0 && (
                  <tr className="bg-muted/5 text-xs italic text-muted-foreground">
                    <td colSpan={sections.length + 2} className="px-8 py-2">
                      No topics in this chapter.
                    </td>
                  </tr>
                )}

                {chapter.topics.map((topic) => {
                  const completedCount = sections.filter((s) => isChecked(topic.id, s.id)).length;
                  return (
                    <tr
                      key={topic.id}
                      className="hover:bg-muted/30 transition-colors group text-xs"
                    >
                      <td className="px-6 py-2.5 font-medium text-foreground sticky left-0 z-10 bg-card group-hover:bg-muted/30 border-r border-border/60">
                        <span className="pl-2 truncate block">{topic.name}</span>
                      </td>

                      {sections.map((section) => {
                        const checked = isChecked(topic.id, section.id);
                        return (
                          <td key={section.id} className="px-2 py-2.5 text-center border-r border-border/30">
                            <button
                              type="button"
                              disabled={readOnly}
                              onClick={() => !readOnly && toggleProgress(topic.id, section.id, !checked)}
                              className={cn(
                                "mx-auto size-5 rounded border flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                                readOnly ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                                checked
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border hover:border-foreground/40 bg-background"
                              )}
                              aria-label={`Toggle ${section.name} for ${topic.name}`}
                            >
                              {checked && <Check className="size-3.5 stroke-[2.5]" />}
                            </button>
                          </td>
                        );
                      })}

                      <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                        {completedCount}/{sections.length}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}

            {/* Ungrouped Topics directly under Subject */}
            {currentSubject.ungroupedTopics.length > 0 && (
              <React.Fragment>
                {currentSubject.chapters.length > 0 && (
                  <tr className="bg-muted/20 text-xs font-semibold text-muted-foreground border-b border-border/40">
                    <td colSpan={sections.length + 2} className="px-4 py-1.5 sticky left-0 z-10">
                      General Topics
                    </td>
                  </tr>
                )}
                {currentSubject.ungroupedTopics.map((topic) => {
                  const completedCount = sections.filter((s) => isChecked(topic.id, s.id)).length;
                  return (
                    <tr
                      key={topic.id}
                      className="hover:bg-muted/30 transition-colors group text-xs"
                    >
                      <td className="px-6 py-2.5 font-medium text-foreground sticky left-0 z-10 bg-card group-hover:bg-muted/30 border-r border-border/60">
                        <span className="truncate block">{topic.name}</span>
                      </td>

                      {sections.map((section) => {
                        const checked = isChecked(topic.id, section.id);
                        return (
                          <td key={section.id} className="px-2 py-2.5 text-center border-r border-border/30">
                            <button
                              type="button"
                              disabled={readOnly}
                              onClick={() => !readOnly && toggleProgress(topic.id, section.id, !checked)}
                              className={cn(
                                "mx-auto size-5 rounded border flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                                readOnly ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                                checked
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border hover:border-foreground/40 bg-background"
                              )}
                              aria-label={`Toggle ${section.name} for ${topic.name}`}
                            >
                              {checked && <Check className="size-3.5 stroke-[2.5]" />}
                            </button>
                          </td>
                        );
                      })}

                      <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                        {completedCount}/{sections.length}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
