"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle, AlertAction } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";

interface ErrorAlertProps {
  errorMessage: string | null;
  onClear: () => void;
}

export function ErrorAlert({ errorMessage, onClear }: ErrorAlertProps) {
  if (!errorMessage) return null;

  return (
    <Alert variant="destructive" className="relative">
      <AlertCircle className="size-4" />
      <div className="flex-1">
        <AlertTitle className="text-sm font-semibold">Error</AlertTitle>
        <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
      </div>
      <AlertAction>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onClear}
          className="h-6 w-6 p-0 hover:bg-destructive/20 text-destructive cursor-pointer"
        >
          <X className="size-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </AlertAction>
    </Alert>
  );
}
