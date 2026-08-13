"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

interface LeaveConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  stayBtnRef: React.RefObject<HTMLButtonElement | null>;
}

export function LeaveConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  stayBtnRef,
}: LeaveConfirmDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent initialFocus={stayBtnRef} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <AlertTriangle className="size-5 text-amber-500 shrink-0" />
            Leave Table Builder?
          </DialogTitle>
          <DialogDescription className="text-xs pt-2 text-muted-foreground leading-relaxed">
            Your exam tracker table is autosaved to your account database. You can launch your tracker workspace now or continue building your review table anytime from your dashboard.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-2">
          <Button
            ref={stayBtnRef}
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="focus:ring-3 focus:ring-primary/40 focus:border-primary focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:border-primary outline-none"
          >
            Stay in Builder
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
          >
            Leave Builder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
