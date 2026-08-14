import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReviewMatrixTable } from "./review-matrix-table";

describe("ReviewMatrixTable Component", () => {
  const defaultProps = {
    checklists: [
      { id: "col-1", name: "1st Read" },
      { id: "col-2", name: "Notes" },
    ],
    subjects: [
      { id: "sub-1", name: "Pharmacology" },
    ],
    chapters: [
      { id: "ch-1", subject_id: "sub-1", name: "Autonomic Drugs" },
    ],
    topics: [
      { id: "top-1", subject_id: "sub-1", chapter_id: "ch-1", name: "Atropine" },
      { id: "top-2", subject_id: "sub-1", chapter_id: null, name: "Aspirin" },
    ],
    isMaxColumnsReached: false,
    onDeleteSectionColumn: vi.fn(),
    onDeleteSubject: vi.fn(),
    onDeleteChapter: vi.fn(),
    onDeleteTopic: vi.fn(),
    onOpenAdderForm: vi.fn(),
    onNavBack: vi.fn(),
    onFinish: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state message when no subjects are added", () => {
    render(<ReviewMatrixTable {...defaultProps} subjects={[]} />);

    expect(screen.getByText(/No subjects added yet/i)).toBeInTheDocument();
  });

  it("renders checklist column headers and handles column deletion", async () => {
    const user = userEvent.setup();
    render(<ReviewMatrixTable {...defaultProps} />);

    expect(screen.getByText("1st Read")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();

    const deleteColBtn = screen.getByTitle("Delete 1st Read column");
    await user.click(deleteColBtn);

    expect(defaultProps.onDeleteSectionColumn).toHaveBeenCalledWith("col-1");
  });

  it("disables column add header button when isMaxColumnsReached is true", () => {
    render(<ReviewMatrixTable {...defaultProps} isMaxColumnsReached={true} />);

    const addColBtn = screen.getByRole("button", { name: /Limit \(10\)/i });
    expect(addColBtn).toBeDisabled();
  });

  it("renders subject tab, chapter header, and topic rows", () => {
    render(<ReviewMatrixTable {...defaultProps} />);

    expect(screen.getAllByText("Pharmacology").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Autonomic Drugs")).toBeInTheDocument();
    expect(screen.getByText("Atropine")).toBeInTheDocument();
    expect(screen.getByText("Aspirin")).toBeInTheDocument();
  });

  it("invokes delete callbacks for subjects, chapters, and topics", async () => {
    const user = userEvent.setup();
    render(<ReviewMatrixTable {...defaultProps} />);

    // Delete Subject
    const deleteSubBtns = screen.getAllByTitle("Delete Pharmacology");
    await user.click(deleteSubBtns[0]);
    expect(defaultProps.onDeleteSubject).toHaveBeenCalledWith("sub-1");

    // Delete Chapter
    const deleteChBtn = screen.getByTitle("Delete Autonomic Drugs");
    await user.click(deleteChBtn);
    expect(defaultProps.onDeleteChapter).toHaveBeenCalledWith("ch-1");

    // Delete Topic
    const deleteTopicBtn = screen.getByTitle("Delete Atropine");
    await user.click(deleteTopicBtn);
    expect(defaultProps.onDeleteTopic).toHaveBeenCalledWith("top-1");
  });

  it("triggers onOpenAdderForm callbacks when clicking add actions", async () => {
    const user = userEvent.setup();
    render(<ReviewMatrixTable {...defaultProps} />);

    const addSubjectBtns = screen.getAllByRole("button", { name: /Subject/i });
    await user.click(addSubjectBtns[0]);
    expect(defaultProps.onOpenAdderForm).toHaveBeenCalledWith("subject");

    const addColumnBtn = screen.getByRole("button", { name: /^Column$/i });
    await user.click(addColumnBtn);
    expect(defaultProps.onOpenAdderForm).toHaveBeenCalledWith("section");
  });

  it("triggers bottom action callbacks onNavBack and onFinish", async () => {
    const user = userEvent.setup();
    render(<ReviewMatrixTable {...defaultProps} />);

    const backBtn = screen.getByRole("button", { name: /Back to Exam Info/i });
    await user.click(backBtn);
    expect(defaultProps.onNavBack).toHaveBeenCalled();

    const finishBtn = screen.getByRole("button", { name: /Launch Tracker Workspace/i });
    await user.click(finishBtn);
    expect(defaultProps.onFinish).toHaveBeenCalled();
  });
});
