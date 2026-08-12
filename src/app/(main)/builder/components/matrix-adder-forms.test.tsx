import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MatrixAdderForms } from "./matrix-adder-forms";

describe("MatrixAdderForms Component", () => {
  const defaultProps = {
    activeAdderForm: null as any,
    setActiveAdderForm: vi.fn(),
    subjects: [
      { id: "sub-1", name: "Pharmacology" },
      { id: "sub-2", name: "Pathology" },
    ],
    chapters: [
      { id: "ch-1", subject_id: "sub-1", name: "Autonomic Drugs" },
    ],
    checklistsLength: 3,
    targetSubjectId: "",
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders null when activeAdderForm is null", () => {
    const { container } = render(<MatrixAdderForms {...defaultProps} activeAdderForm={null} />);
    expect(container.firstChild).toBeNull();
  });

  describe("Section (Column) Adder Form", () => {
    it("renders column adder form and submits new column name", async () => {
      const user = userEvent.setup();
      render(<MatrixAdderForms {...defaultProps} activeAdderForm="section" />);

      const input = screen.getByPlaceholderText(/Column Name/i);
      await user.type(input, "Lecture Videos");

      const submitBtn = screen.getByRole("button", { name: /Add Column/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(defaultProps.onAddSectionColumn).toHaveBeenCalledWith("Lecture Videos");
        expect(defaultProps.setActiveAdderForm).toHaveBeenCalledWith(null);
      });
    });

    it("prevents submission and displays error when max columns limit (10) is reached", async () => {
      const user = userEvent.setup();
      render(
        <MatrixAdderForms
          {...defaultProps}
          activeAdderForm="section"
          checklistsLength={10}
        />
      );

      const input = screen.getByPlaceholderText(/Column Name/i);
      await user.type(input, "Extra Column");

      const submitBtn = screen.getByRole("button", { name: /Add Column/i });
      await user.click(submitBtn);

      expect(defaultProps.setErrorMessage).toHaveBeenCalledWith("Maximum limit of 10 checklist columns reached.");
      expect(defaultProps.onAddSectionColumn).not.toHaveBeenCalled();
    });

    it("resets active form on cancel button click", async () => {
      const user = userEvent.setup();
      render(<MatrixAdderForms {...defaultProps} activeAdderForm="section" />);

      const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
      await user.click(cancelBtn);

      expect(defaultProps.setActiveAdderForm).toHaveBeenCalledWith(null);
    });
  });

  describe("Subject Adder Form", () => {
    it("submits new subject name", async () => {
      const user = userEvent.setup();
      render(<MatrixAdderForms {...defaultProps} activeAdderForm="subject" />);

      const input = screen.getByPlaceholderText(/Subject Name/i);
      await user.type(input, "Biochemistry");

      const submitBtn = screen.getByRole("button", { name: /Add Subject/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(defaultProps.onAddSubject).toHaveBeenCalledWith("Biochemistry");
        expect(defaultProps.setActiveAdderForm).toHaveBeenCalledWith(null);
      });
    });
  });

  describe("Chapter Adder Form", () => {
    it("displays subject name instead of subject ID in the target subject selector", () => {
      render(
        <MatrixAdderForms
          {...defaultProps}
          activeAdderForm="chapter"
          targetSubjectId="sub-1"
        />
      );

      expect(screen.getByText("Pharmacology")).toBeInTheDocument();
      expect(screen.queryByText("sub-1")).not.toBeInTheDocument();
    });

    it("submits new chapter under selected subject", async () => {
      const user = userEvent.setup();
      render(
        <MatrixAdderForms
          {...defaultProps}
          activeAdderForm="chapter"
          targetSubjectId="sub-1"
        />
      );

      const input = screen.getByPlaceholderText(/Chapter Name/i);
      await user.type(input, "Cardiovascular System");

      const submitBtn = screen.getByRole("button", { name: /Add Chapter/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(defaultProps.onAddChapter).toHaveBeenCalledWith("sub-1", "Cardiovascular System");
        expect(defaultProps.setActiveAdderForm).toHaveBeenCalledWith(null);
      });
    });
  });

  describe("Topic Adder Form", () => {
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

    it("submits new topic under subject and chapter", async () => {
      const user = userEvent.setup();
      render(
        <MatrixAdderForms
          {...defaultProps}
          activeAdderForm="topic"
          targetSubjectId="sub-1"
        />
      );

      const input = screen.getByPlaceholderText(/Topic Title/i);
      await user.type(input, "Beta Blockers");

      const submitBtn = screen.getByRole("button", { name: /Add Topic/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(defaultProps.onAddTopic).toHaveBeenCalledWith("sub-1", null, "Beta Blockers");
        expect(defaultProps.setActiveAdderForm).toHaveBeenCalledWith(null);
      });
    });
  });
});
