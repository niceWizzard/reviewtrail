"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";

interface DeleteStructureConfirmDialogProps {
  isOpen: boolean;
  itemType: "subject" | "chapter";
  itemName: string;
  topicCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteStructureConfirmDialog({
  isOpen,
  itemType,
  itemName,
  topicCount,
  onClose,
  onConfirm,
}: DeleteStructureConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold">
            Delete {itemType === "subject" ? "Subject" : "Chapter"} "{itemName}"?
          </DialogTitle>
          <DialogDescription className="text-sm">
            {topicCount > 0 ? (
              <>
                This {itemType} contains{" "}
                <strong className="text-foreground font-semibold">
                  {topicCount} {topicCount === 1 ? "topic" : "topics"}
                </strong>
                . Deleting it will permanently remove all associated topics and checkmark history.
              </>
            ) : (
              `Are you sure you want to delete this empty ${itemType}?`
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete {itemType === "subject" ? "Subject" : "Chapter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
