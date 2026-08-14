"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { format } from "date-fns";
import { Globe, Lock, Users, Layers, BookOpen, Clock } from "lucide-react";
import type { TrackerTemplate } from "@/src/lib/types/template";
import { cn } from "@/src/lib/utils";

interface TemplatePreviewModalProps {
  template: TrackerTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: TrackerTemplate) => void;
}

export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  if (!template) return null;

  const structure = template.structure || { checklists: [], subjects: [] };
  const checklists = structure.checklists || [];
  const subjects = structure.subjects || [];

  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState<string>("0");

  const totalTopics = subjects.reduce((acc, sub) => {
    const directTopics = sub.topics?.length || 0;
    const chTopics = (sub.chapters || []).reduce((cAcc, ch) => cAcc + (ch.topics?.length || 0), 0);
    return acc + directTopics + chTopics;
  }, 0);

  const formattedUpdatedAt = template.updated_at
    ? format(new Date(template.updated_at), "MMM d, yyyy")
    : null;

  const currentSubject = subjects[parseInt(selectedSubjectIdx, 10)] || subjects[0];
  const currentChapters = currentSubject?.chapters || [];
  const currentTopics = currentSubject?.topics || [];

  const selectItems = subjects.map((sub, idx) => {
    const count =
      (sub.topics?.length || 0) +
      (sub.chapters || []).reduce((acc, c) => acc + (c.topics?.length || 0), 0);
    return {
      value: String(idx),
      label: `${sub.name} (${count} topics)`,
    };
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 border-b border-border pr-8 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-medium">
              {template.category || "Custom"}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {template.is_public ? (
                <><Globe className="size-3 text-primary" /> Public</>
              ) : (
                <><Lock className="size-3 text-muted-foreground" /> Private</>
              )}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3" />
              {template.use_count || 0} {template.use_count === 1 ? "use" : "uses"}
            </span>
            {formattedUpdatedAt && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                Updated {formattedUpdatedAt}
              </span>
            )}
          </div>

          <DialogTitle className="text-lg font-semibold leading-tight">
            {template.title}
          </DialogTitle>

          {template.description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {template.description}
            </DialogDescription>
          )}

          <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-primary font-medium">
              <BookOpen className="size-3.5" /> {subjects.length} {subjects.length === 1 ? "Subject" : "Subjects"}
            </span>
            <span>{totalTopics} Topics</span>
            <span>{checklists.length} Checklist Stages</span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Mobile: Shadcn Select Subject Dropdown */}
          {subjects.length > 0 && (
            <div className="sm:hidden flex flex-col gap-1.5 bg-muted/40 p-2.5 rounded-lg border border-border">
              <span className="text-xs font-semibold text-muted-foreground">
                Preview Subject
              </span>
              <Select
                items={selectItems}
                value={selectedSubjectIdx}
                onValueChange={(val) => val && setSelectedSubjectIdx(val)}
              >
                <SelectTrigger className="w-full bg-background border-border">
                  <SelectValue placeholder="Choose subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((sub, idx) => {
                    const count =
                      (sub.topics?.length || 0) +
                      (sub.chapters || []).reduce((acc, c) => acc + (c.topics?.length || 0), 0);
                    return (
                      <SelectItem
                        key={idx}
                        value={String(idx)}
                        label={`${sub.name} (${count} topics)`}
                      >
                        {sub.name} ({count} topics)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Desktop / Tablet: Subject Tabs Bar */}
          {subjects.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-full border-b border-border pb-px" role="tablist">
              {subjects.map((sub, idx) => {
                const isActive = String(idx) === selectedSubjectIdx;
                const count =
                  (sub.topics?.length || 0) +
                  (sub.chapters || []).reduce((acc, c) => acc + (c.topics?.length || 0), 0);
                return (
                  <button
                    key={idx}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedSubjectIdx(String(idx))}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-t border-x cursor-pointer shrink-0",
                      isActive
                        ? "bg-card text-foreground border-border shadow-xs z-10 font-bold -mb-[1px] bg-clip-padding border-b-transparent"
                        : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground border-b border-b-border"
                    )}
                  >
                    <span>{sub.name}</span>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-normal",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Table Preview for Active Subject */}
          <div className="w-full overflow-x-auto rounded-lg border border-border">
            <Table className="w-full text-sm border-collapse">
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead className="px-4 py-2.5 font-semibold text-xs text-muted-foreground min-w-[220px]">
                    CHAPTER / TOPIC
                  </TableHead>
                  {checklists.map((col, cIdx) => (
                    <TableHead
                      key={cIdx}
                      className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground min-w-[100px]"
                    >
                      {col.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border/60">
                {subjects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={checklists.length + 1}
                      className="p-8 text-center text-muted-foreground text-xs italic"
                    >
                      No subjects defined in this template.
                    </TableCell>
                  </TableRow>
                ) : currentChapters.length === 0 && currentTopics.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={checklists.length + 1}
                      className="p-6 text-center text-muted-foreground text-xs italic"
                    >
                      No chapters or topics in this subject.
                    </TableCell>
                  </TableRow>
                ) : (
                  <React.Fragment>
                    {/* Chapter Divider Rows and Topics */}
                    {currentChapters.map((ch, chIdx) => (
                      <React.Fragment key={chIdx}>
                        <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/40">
                          <TableCell
                            colSpan={checklists.length + 1}
                            className="px-4 py-2 text-xs font-semibold text-foreground flex items-center gap-1.5"
                          >
                            <Layers className="size-3.5 text-primary shrink-0" />
                            <span>{ch.name}</span>
                          </TableCell>
                        </TableRow>

                        {ch.topics.map((t, tIdx) => (
                          <TableRow key={tIdx} className="hover:bg-muted/20 text-xs">
                            <TableCell className="px-6 py-2 font-medium text-foreground">
                              <span className="pl-2">{t.name}</span>
                            </TableCell>
                            {checklists.map((_, cIdx) => (
                              <TableCell key={cIdx} className="px-3 py-2 text-center">
                                <div className="mx-auto size-4 rounded border border-border/60 bg-muted/20" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}

                    {/* Ungrouped Topics under Subject */}
                    {currentTopics.map((t, tIdx) => (
                      <TableRow key={tIdx} className="hover:bg-muted/20 text-xs">
                        <TableCell className="px-4 py-2 font-medium text-foreground">
                          {t.name}
                        </TableCell>
                        {checklists.map((_, cIdx) => (
                          <TableCell key={cIdx} className="px-3 py-2 text-center">
                            <div className="mx-auto size-4 rounded border border-border/60 bg-muted/20" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </React.Fragment>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border flex flex-row items-center justify-between sm:justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <Button
            size="sm"
            onClick={() => {
              onClose();
              onUseTemplate(template);
            }}
            className="gap-1 font-medium"
          >
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
