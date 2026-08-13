import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TrackerInfoForm, isDateNotInPast } from "./tracker-info-form";

describe("TrackerInfoForm Component", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields when showPrepopulateOption is true", () => {
    render(<TrackerInfoForm onSubmit={mockOnSubmit} showPrepopulateOption={true} />);

    expect(screen.getByLabelText(/Exam Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /Pre-populate default checklist columns/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save Changes/i })).toBeInTheDocument();
  });

  it("hides prepopulate columns checkbox when showPrepopulateOption is false", () => {
    render(<TrackerInfoForm onSubmit={mockOnSubmit} showPrepopulateOption={false} />);

    expect(screen.getByLabelText(/Exam Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: /Pre-populate default checklist columns/i })
    ).not.toBeInTheDocument();
  });

  it("populates initial values correctly", () => {
    render(
      <TrackerInfoForm
        onSubmit={mockOnSubmit}
        showPrepopulateOption={false}
        initialValues={{
          examName: "CPA Board Exam 2026",
          description: "Target pass on 1st attempt",
        }}
      />
    );

    expect(screen.getByLabelText(/Exam Name/i)).toHaveValue("CPA Board Exam 2026");
    expect(screen.getByLabelText(/Description/i)).toHaveValue("Target pass on 1st attempt");
  });

  it("submits form data correctly when valid inputs are provided", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(
      <TrackerInfoForm
        onSubmit={mockOnSubmit}
        showPrepopulateOption={true}
        submitLabel="Submit Exam Info"
      />
    );

    const examNameInput = screen.getByLabelText(/Exam Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);

    await user.type(examNameInput, "USMLE Step 1");
    await user.type(descriptionInput, "Pass on first attempt");

    const submitBtn = screen.getByRole("button", { name: /Submit Exam Info/i });
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

  it("renders cancel button and triggers onCancel when provided", async () => {
    const mockOnCancel = vi.fn();
    const user = userEvent.setup();

    render(<TrackerInfoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    expect(cancelBtn).toBeInTheDocument();

    await user.click(cancelBtn);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("validates description character limit of 255 characters", async () => {
    render(<TrackerInfoForm onSubmit={mockOnSubmit} />);

    const descriptionInput = screen.getByLabelText(/Description/i);
    const longDescription = "a".repeat(256);

    fireEvent.change(descriptionInput, { target: { value: longDescription } });

    await waitFor(() => {
      expect(screen.getByText("Description must be 255 characters or less")).toBeInTheDocument();
    });
  });

  it("validates target exam date non-past constraint", () => {
    expect(isDateNotInPast("2020-01-01")).toBe(false);
    expect(isDateNotInPast("2099-12-31")).toBe(true);
    expect(isDateNotInPast("")).toBe(true);
  });
});
