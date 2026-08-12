"use client";

import React from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { format, parseISO, isValid } from "date-fns";
import { ArrowRight, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { Step1Values } from "../types";

export const step1Schema = z.object({
  examName: z.string().min(1, "Exam name is required").max(32, "Exam name must be 32 characters or less"),
  examDate: z.string(),
  description: z.string(),
  prepopulateColumns: z.boolean(),
});

interface ExamInfoFormProps {
  isSavingExamInfo: boolean;
  onSubmit: (values: Step1Values) => Promise<void>;
}

export function ExamInfoForm({ isSavingExamInfo, onSubmit }: ExamInfoFormProps) {
  const step1Form = useForm({
    defaultValues: {
      examName: "",
      examDate: "",
      description: "",
      prepopulateColumns: true,
    },
    validators: {
      onChange: step1Schema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <Card className="shadow-xs border-border max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            1
          </span>
          Exam Title & Target Date
        </CardTitle>
        <CardDescription>
          Provide the details for your exam to set up your study tracking workspace.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            step1Form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Field 1: Exam Name */}
          <step1Form.Field
            name="examName"
            validators={{
              onChange: step1Schema.shape.examName,
            }}
            children={(field) => (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Exam Name *</label>
                <Input
                  required
                  placeholder="e.g. USMLE Step 1, CPA Board Exam 2026, NCLEX-RN"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[11px] text-destructive font-medium">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Field 2: Target Exam Date (shadcn Popover + Calendar DatePicker) */}
          <step1Form.Field
            name="examDate"
            children={(field) => {
              const dateVal = field.state.value
                ? parseISO(field.state.value)
                : undefined;
              const validDate = dateVal && isValid(dateVal) ? dateVal : undefined;

              return (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Target Exam Date</label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-9 text-sm border-input bg-background"
                        />
                      }
                    >
                      <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
                      {validDate ? (
                        format(validDate, "PPP")
                      ) : (
                        <span className="text-muted-foreground">Pick target exam date</span>
                      )}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={validDate}
                        onSelect={(date) => {
                          field.handleChange(date ? format(date, "yyyy-MM-dd") : "");
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              );
            }}
          />

          {/* Field 3: Description */}
          <step1Form.Field
            name="description"
            children={(field) => (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description / Goal</label>
                <Input
                  placeholder="e.g. Target score 250+, 3 review passes before scheduled exam"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          />

          {/* Field 4: Pre-populate Columns Checkbox (shadcn Checkbox) */}
          <step1Form.Field
            name="prepopulateColumns"
            children={(field) => (
              <div className="pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                  <Checkbox
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-semibold text-foreground block">
                      Pre-populate default checklist columns
                    </span>
                    <span className="text-muted-foreground block">
                      Starts your table matrix with standard review columns: <strong>1st Read</strong>, <strong>Notes</strong>, and <strong>Practice Qs</strong>. Uncheck to start with an empty matrix.
                    </span>
                  </div>
                </label>
              </div>
            )}
          />

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isSavingExamInfo} className="gap-2">
              {isSavingExamInfo ? "Autosaving Exam Info..." : "Next: Build Review Matrix"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
