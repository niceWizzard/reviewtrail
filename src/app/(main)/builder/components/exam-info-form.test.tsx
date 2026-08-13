import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExamInfoForm } from "./exam-info-form";

describe("ExamInfoForm Component", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all input fields and submit button", () => {
    render(<ExamInfoForm isSavingExamInfo={false} onSubmit={mockOnSubmit} />);

    expect(screen.getByText("Exam Title & Target Date")).toBeInTheDocument();
    expect(screen.getByLabelText(/Exam Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Pre-populate default checklist columns/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next: Build Review Table/i })).toBeInTheDocument();
  });

  it("submits form data correctly when valid inputs are provided", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(<ExamInfoForm isSavingExamInfo={false} onSubmit={mockOnSubmit} />);

    const examNameInput = screen.getByLabelText(/Exam Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);

    await user.type(examNameInput, "USMLE Step 1");
    await user.type(descriptionInput, "Pass on first attempt");

    const submitBtn = screen.getByRole("button", { name: /Next: Build Review Table/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        examName: "USMLE Step 1",
        examDate: "",
        description: "Pass on first attempt",
        prepopulateColumns: true,
      });
    });
  });

  it("disables submit button and shows loading text when isSavingExamInfo is true", () => {
    render(<ExamInfoForm isSavingExamInfo={true} onSubmit={mockOnSubmit} />);

    const submitBtn = screen.getByRole("button", { name: /Autosaving Exam Info.../i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  it("validates description character limit of 255 characters", async () => {
    render(<ExamInfoForm isSavingExamInfo={false} onSubmit={mockOnSubmit} />);

    const descriptionInput = screen.getByLabelText(/Description/i);
    const longDescription = "a".repeat(256);

    fireEvent.change(descriptionInput, { target: { value: longDescription } });

    await waitFor(() => {
      expect(screen.getByText("Description must be 255 characters or less")).toBeInTheDocument();
    });
  });
});
