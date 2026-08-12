"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ActiveAdderForm } from "../types";

interface MatrixToolbarProps {
  activeAdderForm: ActiveAdderForm;
  setActiveAdderForm: (form: ActiveAdderForm) => void;
  isMaxColumnsReached: boolean;
  subjectCount: number;
  topicCount: number;
}

export function MatrixToolbar({
  activeAdderForm,
  setActiveAdderForm,
  isMaxColumnsReached,
  subjectCount,
  topicCount,
}: MatrixToolbarProps) {
  const toggleForm = (form: ActiveAdderForm) => {
    setActiveAdderForm(activeAdderForm === form ? null : form);
  };

  return (
    <div className="p-3 bg-muted/40 rounded-xl border border-border flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Add Column Button */}
        <Button
          size="sm"
          variant="outline"
          disabled={isMaxColumnsReached}
          onClick={() => toggleForm("section")}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          Add Column
        </Button>

        {/* Add Subject Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => toggleForm("subject")}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          Add Subject
        </Button>

        {/* Add Chapter Button */}
        <Button
          size="sm"
          variant="outline"
          disabled={subjectCount === 0}
          onClick={() => toggleForm("chapter")}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          Add Chapter
        </Button>

        {/* Add Topic Button */}
        <Button
          size="sm"
          variant="outline"
          disabled={subjectCount === 0}
          onClick={() => toggleForm("topic")}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          Add Topic
        </Button>
      </div>

      <span className="text-xs text-muted-foreground">
        {subjectCount} Subjects • {topicCount} Topics
      </span>
    </div>
  );
}
