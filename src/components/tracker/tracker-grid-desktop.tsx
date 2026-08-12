"use client";

import React from "react";
import { Check, Plus, Trash2, BookOpen, Layers } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import type { TrackerWorkspaceData } from "@/src/lib/types/database";
import { useTopicProgress } from "@/src/hooks/use-topic-progress";

interface DesktopGridProps {
  workspaceData: TrackerWorkspaceData;
  onOpenStructureEditor?: () => void;
}

export function TrackerGridDesktop({ workspaceData, onOpenStructureEditor }: DesktopGridProps) {
  const { tracker, checklists, subjectTree, progress } = workspaceData;
  const sections = checklists;
  const { toggleProgress } = useTopicProgress(tracker.id);

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
          Get started by adding your exam subjects, chapters, and topics to populate the review matrix.
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

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
      <table className="w-full text-left text-sm border-collapse min-w-[700px]">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            <th className="px-4 py-3 min-w-[280px] sticky left-0 z-10 bg-muted/90 backdrop-blur-xs border-r border-border">
              Syllabus Topic / Chapter
            </th>
            {sections.map((section) => (
              <th key={section.id} className="px-4 py-3 text-center min-w-[120px] font-semibold">
                <div className="flex items-center justify-center gap-1.5">
                  <span>{section.name}</span>
                </div>
              </th>
            ))}
            <th className="px-4 py-3 text-right min-w-[90px] font-semibold">Progress</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-border/60">
          {subjectTree.map((subject) => {
            const allSubTopics = [
              ...subject.ungroupedTopics,
              ...subject.chapters.flatMap((c) => c.topics),
            ];

            const subTotalCheckboxes = allSubTopics.length * (sections.length || 1);
            const subCompletedCheckboxes = allSubTopics.reduce((acc, t) => {
              return (
                acc +
                sections.filter((s) => isChecked(t.id, s.id)).length
              );
            }, 0);

            const subPct =
              subTotalCheckboxes > 0
                ? Math.round((subCompletedCheckboxes / subTotalCheckboxes) * 100)
                : 0;

            return (
              <React.Fragment key={subject.id}>
                {/* Subject Header Row */}
                <tr className="bg-muted/60 font-bold text-foreground border-t border-border/80">
                  <td
                    colSpan={sections.length + 2}
                    className="px-4 py-2.5 bg-muted/70 sticky left-0 z-10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary" />
                        <span className="text-base">{subject.name}</span>
                        <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
                          {allSubTopics.length} Topics
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <span>{subPct}% Completed</span>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Chapter Rows & Topics */}
                {subject.chapters.map((chapter) => (
                  <React.Fragment key={chapter.id}>
                    <tr className="bg-muted/20 text-xs font-semibold text-muted-foreground">
                      <td
                        colSpan={sections.length + 2}
                        className="px-6 py-1.5 sticky left-0 z-10 flex items-center gap-1.5"
                      >
                        <Layers className="size-3.5 text-primary/70" />
                        <span>{chapter.name}</span>
                        {chapter.description && (
                          <span className="text-[11px] text-muted-foreground/80 font-normal">
                            — {chapter.description}
                          </span>
                        )}
                      </td>
                    </tr>

                    {chapter.topics.map((topic) => {
                      const completedCount = sections.filter((s) => isChecked(topic.id, s.id)).length;
                      return (
                        <tr
                          key={topic.id}
                          className="hover:bg-accent/40 transition-colors group"
                        >
                          <td className="px-8 py-3 font-medium text-foreground sticky left-0 z-10 bg-card group-hover:bg-accent/40 border-r border-border/60">
                            {topic.name}
                          </td>

                          {sections.map((section) => {
                            const checked = isChecked(topic.id, section.id);
                            return (
                              <td key={section.id} className="px-2 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleProgress(topic.id, section.id, !checked)}
                                  className={`mx-auto size-7 rounded-md border flex items-center justify-center transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ${
                                    checked
                                      ? "bg-primary border-primary text-primary-foreground shadow-xs scale-105"
                                      : "border-input bg-background hover:bg-muted text-transparent"
                                  }`}
                                  aria-label={`Toggle ${section.name} for ${topic.name}`}
                                >
                                  <Check className="size-4 stroke-[3]" />
                                </button>
                              </td>
                            );
                          })}

                          <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                            {completedCount}/{sections.length}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}

                {/* Ungrouped Topics directly under Subject */}
                {subject.ungroupedTopics.map((topic) => {
                  const completedCount = sections.filter((s) => isChecked(topic.id, s.id)).length;
                  return (
                    <tr
                      key={topic.id}
                      className="hover:bg-accent/40 transition-colors group"
                    >
                      <td className="px-6 py-3 font-medium text-foreground sticky left-0 z-10 bg-card group-hover:bg-accent/40 border-r border-border/60">
                        {topic.name}
                      </td>

                      {sections.map((section) => {
                        const checked = isChecked(topic.id, section.id);
                        return (
                          <td key={section.id} className="px-2 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleProgress(topic.id, section.id, !checked)}
                              className={`mx-auto size-7 rounded-md border flex items-center justify-center transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ${
                                checked
                                  ? "bg-primary border-primary text-primary-foreground shadow-xs scale-105"
                                  : "border-input bg-background hover:bg-muted text-transparent"
                              }`}
                              aria-label={`Toggle ${section.name} for ${topic.name}`}
                            >
                              <Check className="size-4 stroke-[3]" />
                            </button>
                          </td>
                        );
                      })}

                      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                        {completedCount}/{sections.length}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
