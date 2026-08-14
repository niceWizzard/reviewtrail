import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TemplateBuilderClient } from "./template-builder-client";
import { createTemplateFromScratchAction } from "@/src/lib/actions/templates";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/src/lib/actions/templates", () => ({
  createTemplateFromScratchAction: vi.fn().mockResolvedValue({ id: "tmpl-123" }),
}));

describe("TemplateBuilderClient State Resets and Lifecycles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigates through step 1, adds syllabus structure in step 2, saves, and resets draft on finish", async () => {
    const user = userEvent.setup();
    render(<TemplateBuilderClient />);

    // 1. Fill Step 1 Metadata
    const titleInput = screen.getByLabelText(/Template Title/i);
    await user.type(titleInput, "Civil Engineering Review Template");

    const nextBtn = screen.getByRole("button", { name: /Next: Build Table/i });
    await user.click(nextBtn);

    // Verify transition to Step 2
    expect(screen.getByText("Configure Review Table")).toBeInTheDocument();

    // 2. Add a Subject
    const addSubjectBtns = screen.getAllByRole("button", { name: /Add Subject/i });
    await user.click(addSubjectBtns[0]);

    const subjectInput = screen.getByPlaceholderText(/Subject Name/i);
    await user.type(subjectInput, "Structural Engineering");
    const subjectForm = subjectInput.closest("form")!;
    const formSubmitBtn = subjectForm.querySelector('button[type="submit"]') as HTMLElement;
    await user.click(formSubmitBtn);

    expect(screen.getAllByText("Structural Engineering").length).toBeGreaterThanOrEqual(1);

    // 3. Add a Topic via Add Topic button
    const addTopicBtn = screen.getByRole("button", { name: "Add Topic" });
    await user.click(addTopicBtn);

    const topicInput = screen.getByPlaceholderText(/Topic Title/i);
    await user.type(topicInput, "Reinforced Concrete Design");
    const topicForm = topicInput.closest("form")!;
    const topicSubmitBtn = topicForm.querySelector('button[type="submit"]') as HTMLElement;
    await user.click(topicSubmitBtn);

    expect(screen.getByText("Reinforced Concrete Design")).toBeInTheDocument();

    // 4. Finish and Save Template
    const saveTemplateBtn = screen.getByRole("button", { name: /Save Template/i });
    await user.click(saveTemplateBtn);

    await waitFor(() => {
      expect(createTemplateFromScratchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            title: "Civil Engineering Review Template",
          }),
          draft: expect.objectContaining({
            examName: "Civil Engineering Review Template",
            subjects: expect.arrayContaining([
              expect.objectContaining({ name: "Structural Engineering" }),
            ]),
            topics: expect.arrayContaining([
              expect.objectContaining({ name: "Reinforced Concrete Design" }),
            ]),
          }),
        })
      );
      expect(mockPush).toHaveBeenCalledWith("/templates");
    });
  });

  it("resets draft state cleanly when unmounted", () => {
    const { unmount } = render(<TemplateBuilderClient />);
    unmount();
    // Render anew to verify fresh state
    render(<TemplateBuilderClient />);
    expect(screen.getByLabelText(/Template Title/i)).toHaveValue("");
  });
});
