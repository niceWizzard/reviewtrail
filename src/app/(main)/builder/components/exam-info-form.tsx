"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Step1Values } from "../types";
import {
  TrackerInfoForm,
  isDateNotInPast,
  step1Schema,
} from "@/src/components/tracker/tracker-info-form";

export { isDateNotInPast, step1Schema };

export interface ExamInfoFormProps {
  isSavingExamInfo: boolean;
  onSubmit: (values: Step1Values) => Promise<void>;
}

export function ExamInfoForm({ isSavingExamInfo, onSubmit }: ExamInfoFormProps) {
  return (
    <TrackerInfoForm
      useCardWrapper
      cardTitle={
        <>
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            1
          </span>
          Exam Title & Target Date
        </>
      }
      cardDescription="Provide the details for your exam to set up your study tracking workspace."
      showPrepopulateOption={true}
      isSubmitting={isSavingExamInfo}
      submitLabel={isSavingExamInfo ? "Autosaving Exam Info..." : "Next: Build Review Table"}
      submitIcon={isSavingExamInfo ? undefined : <ArrowRight className="size-4" />}
      onSubmit={onSubmit}
    />
  );
}

