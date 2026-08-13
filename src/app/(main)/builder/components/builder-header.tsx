"use client";

import React from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

interface BuilderHeaderProps {
  step: 1 | 2;
  onNavAttempt: (target: "dashboard" | "step1") => void;
}

export function BuilderHeader({ step, onNavAttempt }: BuilderHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onNavAttempt("dashboard")}
          className="gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Button>
      </div>

      {/* Stepper Progress Header (2 Steps) */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Custom Exam Tracker</h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {step === 1
            ? "Enter your exam details to initialize your review tracker."
            : "Add subjects, chapters, and topics to build your review table."}
        </p>

        <div className="flex items-center justify-center gap-2 pt-4 max-w-xs mx-auto">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground max-w-xs mx-auto font-medium px-1">
          <span className={step === 1 ? "text-primary font-semibold" : ""}>1. Exam Details</span>
          <span className={step === 2 ? "text-primary font-semibold" : ""}>2. Table Builder</span>
        </div>
      </div>
    </div>
  );
}
