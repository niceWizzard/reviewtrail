"use client";

import React, { useState, useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface DoubleClickInlineInputProps {
  value: string;
  onSave: (newValue: string) => void | Promise<unknown>;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  title?: string;
}

export function DoubleClickInlineInput({
  value,
  onSave,
  className,
  inputClassName,
  placeholder,
  disabled = false,
  title = "Double-click, press Enter, or click pencil to rename",
}: DoubleClickInlineInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsEditing(true);
  };

  const handlePencilClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsEditing(true);
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleCommit = async () => {
    const trimmed = tempValue.trim();
    if (!trimmed || trimmed === value) {
      setTempValue(value);
      setIsEditing(false);
      return;
    }

    try {
      await onSave(trimmed);
      setIsEditing(false);
    } catch {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTempValue(value);
      setIsEditing(false);
    } else if (e.key === "Tab") {
      handleCommit();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        onBlur={handleCommit}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-6 px-1 py-0.5 text-xs font-semibold rounded-md border border-primary bg-background text-foreground outline-hidden focus:ring-1 focus:ring-primary w-full min-w-[60px]",
          inputClassName
        )}
      />
    );
  }

  return (
    <span
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Rename ${value}`}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleContainerKeyDown}
      title={disabled ? undefined : title}
      className={cn(
        "inline-flex items-center gap-1.5 max-w-full min-w-0 group/editable cursor-pointer select-none rounded-xs px-1 py-0.5 transition-all hover:bg-muted/80 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        disabled && "cursor-default hover:bg-transparent hover:text-inherit focus-visible:ring-0",
        className
      )}
    >
      <span className="truncate flex-1 min-w-0">{value}</span>
      {!disabled && (
        <Pencil
          onClick={handlePencilClick}
          tabIndex={-1}
          className="size-3 shrink-0 text-muted-foreground/50 opacity-0 group-hover/editable:opacity-100 group-focus-visible/editable:opacity-100 transition-opacity hover:text-primary cursor-pointer"
        />
      )}
    </span>
  );
}
