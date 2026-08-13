"use client";

import React from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { format, parseISO, isValid, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
} from "@/src/components/ui/field";

export const isDateNotInPast = (val: string | null | undefined) => {
  if (!val || !val.trim()) return true;
  const parsed = parseISO(val);
  if (!isValid(parsed)) return false;
  const today = startOfDay(new Date());
  const target = startOfDay(parsed);
  return target >= today;
};

export const step1Schema = z.object({
  examName: z.string().min(1, "Exam name is required").max(32, "Exam name must be 32 characters or less"),
  examDate: z.string().refine(isDateNotInPast, "Target exam date cannot be in the past"),
  description: z.string().max(255, "Description must be 255 characters or less"),
  prepopulateColumns: z.boolean(),
});

export interface TrackerInfoValues {
  examName: string;
  examDate: string;
  description: string;
  prepopulateColumns: boolean;
}

export interface TrackerInfoFormProps {
  initialValues?: Partial<TrackerInfoValues>;
  showPrepopulateOption?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  onCancel?: () => void;
  onSubmit: (values: TrackerInfoValues) => Promise<void> | void;
  errorMessage?: string | null;
  useCardWrapper?: boolean;
  cardTitle?: React.ReactNode;
  cardDescription?: React.ReactNode;
}

export function TrackerInfoForm({
  initialValues,
  showPrepopulateOption = true,
  isSubmitting = false,
  submitLabel = "Save Changes",
  submitIcon,
  onCancel,
  onSubmit,
  errorMessage,
  useCardWrapper = false,
  cardTitle,
  cardDescription,
}: TrackerInfoFormProps) {
  const trackerForm = useForm({
    defaultValues: {
      examName: initialValues?.examName ?? "",
      examDate: initialValues?.examDate ?? "",
      description: initialValues?.description ?? "",
      prepopulateColumns: initialValues?.prepopulateColumns ?? true,
    },
    validators: {
      onChange: step1Schema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const formBody = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        trackerForm.handleSubmit();
      }}
      className="space-y-6"
    >
      {errorMessage && (
        <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          {errorMessage}
        </div>
      )}

      <FieldGroup>
        {/* Field 1: Exam Name */}
        <trackerForm.Field
          name="examName"
          validators={{
            onChange: step1Schema.shape.examName,
          }}
          children={(field) => {
            const hasError = field.state.meta.errors.length > 0;
            return (
              <Field data-invalid={hasError}>
                <FieldLabel htmlFor="examName">Exam Name *</FieldLabel>
                <Input
                  id="examName"
                  required
                  placeholder="e.g. USMLE Step 1, CPA Board Exam 2026, NCLEX-RN"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={hasError}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        />

        {/* Field 2: Target Exam Date */}
        <trackerForm.Field
          name="examDate"
          validators={{
            onChange: step1Schema.shape.examDate,
          }}
          children={(field) => {
            const dateVal = field.state.value
              ? parseISO(field.state.value)
              : undefined;
            const validDate = dateVal && isValid(dateVal) ? dateVal : undefined;
            const hasError = field.state.meta.errors.length > 0;

            return (
              <Field data-invalid={hasError}>
                <FieldLabel htmlFor="examDate">Target Exam Date</FieldLabel>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        id="examDate"
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
                      disabled={(date) => date < startOfDay(new Date())}
                      onSelect={(date) => {
                        field.handleChange(date ? format(date, "yyyy-MM-dd") : "");
                      }}
                      endMonth={new Date( new Date().getFullYear()+2, 11)}
                      startMonth={new Date()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        />

        {/* Field 3: Description */}
        <trackerForm.Field
          name="description"
          validators={{
            onChange: step1Schema.shape.description,
          }}
          children={(field) => {
            const hasError = field.state.meta.errors.length > 0;
            return (
              <Field data-invalid={hasError}>
                <FieldLabel htmlFor="description">Description / Goal</FieldLabel>
                <Input
                  id="description"
                  placeholder="e.g. Target score 250+, 3 review passes before scheduled exam"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={hasError}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        />

        {/* Field 4: Pre-populate Columns Checkbox (Hidden in Edit mode) */}
        {showPrepopulateOption && (
          <trackerForm.Field
            name="prepopulateColumns"
            children={(field) => (
              <Field orientation="horizontal" className="p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors items-start">
                <Checkbox
                  id="prepopulateColumns"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                  className="mt-0.5"
                />
                <FieldContent>
                  <FieldLabel htmlFor="prepopulateColumns" className="font-semibold cursor-pointer text-foreground block">
                    Pre-populate default checklist columns
                  </FieldLabel>
                  <FieldDescription className="text-xs text-muted-foreground">
                    Starts your tracker table with standard review columns: <strong>1st Read</strong>, <strong>Notes</strong>, and <strong>Practice Qs</strong>. Uncheck to start with an empty table.
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}
          />
        )}
      </FieldGroup>

      <div className="pt-2 flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
          {submitIcon}
        </Button>
      </div>
    </form>
  );

  if (useCardWrapper) {
    return (
      <Card className="shadow-xs border-border max-w-2xl mx-auto">
        {(cardTitle || cardDescription) && (
          <CardHeader>
            {cardTitle && (
              <CardTitle className="text-lg flex items-center gap-2">
                {cardTitle}
              </CardTitle>
            )}
            {cardDescription && (
              <CardDescription>{cardDescription}</CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent>{formBody}</CardContent>
      </Card>
    );
  }

  return formBody;
}
