import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MatrixAdderForms } from "./matrix-adder-forms";

describe("MatrixAdderForms Component", () => {
  const defaultProps = {
    activeAdderForm: "chapter" as const,
    setActiveAdderForm: vi.fn(),
    subjects: [
      { id: "sub-1", name: "Pharmacology" },
      { id: "sub-2", name: "Pathology" },
    ],
    chapters: [
      { id: "ch-1", subject_id: "sub-1", name: "Autonomic Drugs" },
    ],
    checklistsLength: 3,
    targetSubjectId: "sub-1",
    setTargetSubjectId: vi.fn(),
    onAddSectionColumn: vi.fn(),
    isAddingSection: false,
    onAddSubject: vi.fn(),
    isAddingSubject: false,
    onAddChapter: vi.fn(),
    onAddTopic: vi.fn(),
    isAddingTopic: false,
    setErrorMessage: vi.fn(),
  };

  it("displays subject name instead of subject ID in the target subject selector", () => {
    render(<MatrixAdderForms {...defaultProps} />);

    expect(screen.getByText("Pharmacology")).toBeInTheDocument();
    expect(screen.queryByText("sub-1")).not.toBeInTheDocument();
  });

  it("displays chapter name instead of chapter ID in topic adder form", () => {
    render(
      <MatrixAdderForms
        {...defaultProps}
        activeAdderForm="topic"
        targetSubjectId="sub-1"
      />
    );

    expect(screen.getByText("Pharmacology")).toBeInTheDocument();
    expect(screen.getByText("No Chapter (Ungrouped)")).toBeInTheDocument();
    expect(screen.queryByText("sub-1")).not.toBeInTheDocument();
  });
});
