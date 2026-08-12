"use client";

import React from "react";
import { Check, BookOpen, Layers } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import type { TrackerWorkspaceData, Topic } from "@/src/lib/types/database";
import { useTopicProgress } from "@/src/hooks/use-topic-progress";

interface MobileAccordionProps {
  workspaceData: TrackerWorkspaceData;
  onOpenStructureEditor?: () => void;
}

export function TrackerAccordionMobile({ workspaceData }: MobileAccordionProps) {
  const { tracker, checklists, subjectTree, progress } = workspaceData;
  const sections = checklists;
  const { toggleProgress } = useTopicProgress(tracker.id);

  const isChecked = (topicId: string, sectionId: string): boolean => {
    const item = progress.find((p) => p.topic_id === topicId && p.section_id === sectionId);
    return !!item?.is_completed;
  };

  if (subjectTree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl bg-card text-card-foreground">
        <BookOpen className="size-8 text-primary mb-2" />
        <h3 className="text-base font-semibold mb-1">No Subjects Added</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Add your exam subjects and topics to start checking progress on mobile.
        </p>
      </div>
    );
  }

  return (
    <Accordion defaultValue={[subjectTree[0]?.id || ""]} className="space-y-4">
      {subjectTree.map((subject) => {
        const allSubTopics: Topic[] = [
          ...subject.ungroupedTopics,
          ...subject.chapters.flatMap((c) => c.topics),
        ];

        const subTotalCheckboxes = allSubTopics.length * (sections.length || 1);
        const subCompletedCheckboxes = allSubTopics.reduce((acc, t) => {
          return acc + sections.filter((s) => isChecked(t.id, s.id)).length;
        }, 0);

        const subPct =
          subTotalCheckboxes > 0
            ? Math.round((subCompletedCheckboxes / subTotalCheckboxes) * 100)
            : 0;

        return (
          <AccordionItem
            key={subject.id}
            value={subject.id}
            className="border border-border rounded-xl bg-card px-4 py-1 shadow-xs overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center justify-between w-full pr-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-primary" />
                  <span className="font-bold text-sm sm:text-base">{subject.name}</span>
                </div>
                <Badge variant="outline" className="text-xs font-semibold gap-1 border-primary/40 text-primary">
                  {subPct}% Done
                </Badge>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4 pt-1 space-y-4">
              {/* Chapter Groups */}
              {subject.chapters.map((chapter) => (
                <div key={chapter.id} className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground pt-1 border-b border-border/40 pb-1">
                    <Layers className="size-3.5 text-primary" />
                    <span>{chapter.name}</span>
                  </div>

                  <div className="space-y-2.5">
                    {chapter.topics.map((topic) => {
                      const completedCount = sections.filter((s) => isChecked(topic.id, s.id)).length;
                      return (
                        <Card key={topic.id} className="p-3 shadow-2xs border-border/80">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-semibold text-sm leading-tight text-foreground">
                              {topic.name}
                            </span>
                            <Badge variant="secondary" className="text-[10px] shrink-0 font-mono">
                              {completedCount}/{sections.length} Done
                            </Badge>
                          </div>

                          {/* Touch Pill Checklist Bar (Scrollable) */}
                          <div className="flex items-center gap-2 overflow-x-auto pb-1 touch-pan-x no-scrollbar">
                            {sections.map((section) => {
                              const checked = isChecked(topic.id, section.id);
                              return (
                                <button
                                  key={section.id}
                                  type="button"
                                  onClick={() => toggleProgress(topic.id, section.id, !checked)}
                                  className={`min-h-[44px] min-w-[90px] px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                                    checked
                                      ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                                  }`}
                                >
                                  {checked && <Check className="size-3.5 stroke-[3]" />}
                                  <span className="truncate max-w-[80px]">{section.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Ungrouped Topics */}
              {subject.ungroupedTopics.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  {subject.ungroupedTopics.map((topic) => {
                    const completedCount = sections.filter((s) => isChecked(topic.id, s.id)).length;
                    return (
                      <Card key={topic.id} className="p-3 shadow-2xs border-border/80">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-semibold text-sm leading-tight text-foreground">
                            {topic.name}
                          </span>
                          <Badge variant="secondary" className="text-[10px] shrink-0 font-mono">
                            {completedCount}/{sections.length} Done
                          </Badge>
                        </div>

                        {/* Touch Pill Checklist Bar */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 touch-pan-x no-scrollbar">
                          {sections.map((section) => {
                            const checked = isChecked(topic.id, section.id);
                            return (
                              <button
                                key={section.id}
                                type="button"
                                onClick={() => toggleProgress(topic.id, section.id, !checked)}
                                className={`min-h-[44px] min-w-[90px] px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                                  checked
                                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                                }`}
                              >
                                {checked && <Check className="size-3.5 stroke-[3]" />}
                                <span className="truncate max-w-[80px]">{section.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
