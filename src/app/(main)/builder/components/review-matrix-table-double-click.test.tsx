import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReviewMatrixTable } from "./review-matrix-table";

describe("ReviewMatrixTable Double-Click Renaming", () => {
  const defaultProps = {
    checklists: [
      { tempId: "col-1", name: "1st Read" },
      { tempId: "col-2", name: "Notes" },
    ],
    subjects: [{ tempId: "sub-1", name: "Pharmacology" }],
    chapters: [{ tempId: "ch-1", subjectTempId: "sub-1", name: "Autonomic Drugs" }],
    topics: [
      { tempId: "top-1", subjectTempId: "sub-1", chapterTempId: "ch-1", name: "Atropine" },
    ],
    isMaxColumnsReached: false,
    onDeleteSectionColumn: vi.fn(),
    onDeleteSubject: vi.fn(),
    onDeleteChapter: vi.fn(),
    onDeleteTopic: vi.fn(),
    onRenameSectionColumn: vi.fn(),
    onRenameSubject: vi.fn(),
    onRenameChapter: vi.fn(),
    onRenameTopic: vi.fn(),
    onOpenAdderForm: vi.fn(),
    onNavBack: vi.fn(),
    onFinish: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("triggers onRenameSectionColumn on double-clicking a checklist column header", async () => {
    const user = userEvent.setup();
    render(<ReviewMatrixTable {...defaultProps} />);

    const colHeader = screen.getByText("1st Read");
    fireEvent.doubleClick(colHeader);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Initial Reading{Enter}");

    expect(defaultProps.onRenameSectionColumn).toHaveBeenCalledWith("col-1", "Initial Reading");
  });

  it("triggers onRenameSubject on double-clicking a subject row title", async () => {
    const user = userEvent.setup();
    render(<ReviewMatrixTable {...defaultProps} />);

    const subTitle = screen.getByText("Pharmacology");
    fireEvent.doubleClick(subTitle);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Clinical Pharmacology{Enter}");

    expect(defaultProps.onRenameSubject).toHaveBeenCalledWith("sub-1", "Clinical Pharmacology");
  });

  it("triggers onRenameChapter on double-clicking a chapter group title", async () => {
    const user = userEvent.setup();
    render(<ReviewMatrixTable {...defaultProps} />);

    const chTitle = screen.getByText("Autonomic Drugs");
    fireEvent.doubleClick(chTitle);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "ANS Medications{Enter}");

    expect(defaultProps.onRenameChapter).toHaveBeenCalledWith("ch-1", "ANS Medications");
  });

  it("triggers onRenameTopic on double-clicking a topic name", async () => {
    const user = userEvent.setup();
    render(<ReviewMatrixTable {...defaultProps} />);

    const topicTitle = screen.getByText("Atropine");
    fireEvent.doubleClick(topicTitle);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Atropine Sulfate{Enter}");

    expect(defaultProps.onRenameTopic).toHaveBeenCalledWith("top-1", "Atropine Sulfate");
  });

  it("reverts input field to original name when onRename handler returns false due to duplicate error", async () => {
    const user = userEvent.setup();
    const mockOnRenameSubject = vi.fn().mockReturnValue(false);

    render(
      <ReviewMatrixTable
        {...defaultProps}
        onRenameSubject={mockOnRenameSubject}
      />
    );

    const subTitle = screen.getByText("Pharmacology");
    fireEvent.doubleClick(subTitle);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Anatomy{Enter}");

    expect(mockOnRenameSubject).toHaveBeenCalledWith("sub-1", "Anatomy");
    // Inline input should close and display original value "Pharmacology"
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Pharmacology")).toBeInTheDocument();
  });
});
