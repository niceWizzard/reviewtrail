"use client";

import React from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { format } from "date-fns";
import { Globe, Lock, Users, Layers, ArrowUpRight, BookOpen, Clock } from "lucide-react";
import type { TrackerTemplate } from "@/src/lib/types/template";

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

  const totalTopics = subjects.reduce((acc, sub) => {
    const directTopics = sub.topics?.length || 0;
    const chTopics = (sub.chapters || []).reduce((cAcc, ch) => cAcc + (ch.topics?.length || 0), 0);
    return acc + directTopics + chTopics;
  }, 0);

  const formattedUpdatedAt = template.updated_at
    ? format(new Date(template.updated_at), "MMM d, yyyy")
    : null;

  const colCount = checklists.length + 1;

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
                <><Globe className="size-3 text-emerald-500" /> Public</>
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

        <div className="flex-1 overflow-y-auto py-4">
          <div className="w-full overflow-x-auto rounded-lg border border-border">
            <Table className="w-full text-sm border-collapse">
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead className="px-4 py-3 min-w-64 text-xs uppercase tracking-wide font-semibold sticky left-0 bg-muted/90 border-r border-border">
                    Topic
                  </TableHead>
                  {checklists.map((col, i) => (
                    <TableHead
                      key={i}
                      className="px-3 py-3 text-center min-w-32 text-xs uppercase tracking-wide font-semibold border-r border-border/60"
                    >
                      {col.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border/60">
                {subjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colCount} className="p-8 text-center text-muted-foreground text-xs">
                      No subjects defined in this template.
                    </TableCell>
                  </TableRow>
                ) : (
                  subjects.map((sub, sIdx) => {
                    const subTopicsCount =
                      (sub.topics?.length || 0) +
                      (sub.chapters || []).reduce((acc, ch) => acc + (ch.topics?.length || 0), 0);

                    return (
                      <React.Fragment key={sIdx}>
                        {/* Subject header row */}
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableCell
                            colSpan={colCount}
                            className="px-4 py-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-primary shrink-0" />
                              <span className="text-sm font-semibold text-foreground">{sub.name}</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                                {subTopicsCount} topics
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Chapter groups */}
                        {(sub.chapters || []).map((ch, cIdx) => (
                          <React.Fragment key={cIdx}>
                            <TableRow className="bg-muted/10 hover:bg-muted/10">
                              <TableCell colSpan={colCount} className="px-6 py-2">
                                <div className="flex items-center gap-1.5">
                                  <Layers className="size-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-xs font-medium text-foreground">{ch.name}</span>
                                  {ch.description && (
                                    <span className="text-xs text-muted-foreground truncate max-w-xs">
                                      &mdash; {ch.description}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                            {(ch.topics || []).map((top, tIdx) => (
                              <TopicRow key={tIdx} name={top.name} indent="pl-10" colCount={checklists.length} />
                            ))}
                          </React.Fragment>
                        ))}

                        {/* Ungrouped direct topics */}
                        {(sub.topics || []).map((top, tIdx) => (
                          <TopicRow key={tIdx} name={top.name} indent="pl-7" colCount={checklists.length} />
                        ))}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose} size="sm">
            Close
          </Button>
          <Button
            onClick={() => {
              onClose();
              onUseTemplate(template);
            }}
            size="sm"
            className="gap-1.5"
          >
            Use This Template <ArrowUpRight className="size-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TopicRow({ name, indent, colCount }: { name: string; indent: string; colCount: number }) {
  return (
    <TableRow className="hover:bg-accent/30 transition-colors group">
      <TableCell
        className={`${indent} py-2 text-xs text-foreground sticky left-0 bg-background group-hover:bg-accent/30 border-r border-border/60`}
      >
        {name}
      </TableCell>
      {Array.from({ length: colCount }).map((_, i) => (
        <TableCell key={i} className="px-3 py-2 text-center border-r border-border/40">
          <div className="mx-auto size-5 rounded border border-input bg-background/50 opacity-30" />
        </TableCell>
      ))}
    </TableRow>
  );
}
