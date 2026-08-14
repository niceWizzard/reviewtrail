import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TemplateEditorClient } from "./template-editor-client";
import { updateTemplateAction } from "@/src/lib/actions/templates";
import type { TrackerTemplate } from "@/src/lib/types/template";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/src/lib/actions/templates", () => ({
  updateTemplateAction: vi.fn().mockResolvedValue({ id: "tmpl-existing" }),
}));

describe("TemplateEditorClient State Resets and Lifecycles", () => {
  const mockTemplate: TrackerTemplate = {
    id: "tmpl-existing",
    user_id: "user-1",
    title: "Nursing Board Review",
    description: "Full review matrix",
    category: "Nursing",
    is_public: true,
    use_count: 5,
    structure: {
      checklists: [
        { name: "1st Read", position: 1 },
        { name: "Practice Questions", position: 2 },
      ],
      subjects: [
        {
          name: "Medical Surgical",
          position: 1,
          chapters: [
            {
              name: "Cardiovascular",
              position: 1,
              topics: [
                { name: "Hypertension", position: 1 },
              ],
            },
          ],
          topics: [],
        },
      ],
    },
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads initial template into draft, preserves columns across steps, and saves cleanly", async () => {
    const user = userEvent.setup();
    render(<TemplateEditorClient initialTemplate={mockTemplate} />);

    // Check step 1 pre-filled values
    const titleInput = screen.getByLabelText(/Template Title/i);
    expect(titleInput).toHaveValue("Nursing Board Review");

    // Advance to Step 2
    const nextBtn = screen.getByRole("button", { name: /Next: Edit Table/i });
    await user.click(nextBtn);

    // Verify existing columns and syllabus rows are present and NOT wiped
    expect(screen.getByText("1st Read")).toBeInTheDocument();
    expect(screen.getByText("Practice Questions")).toBeInTheDocument();
    expect(screen.getByText("Medical Surgical")).toBeInTheDocument();
    expect(screen.getByText("Cardiovascular")).toBeInTheDocument();
    expect(screen.getByText("Hypertension")).toBeInTheDocument();

    // Save Changes
    const saveBtn = screen.getByRole("button", { name: /Save Changes/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(updateTemplateAction).toHaveBeenCalledWith({
        templateId: "tmpl-existing",
        metadata: expect.objectContaining({
          title: "Nursing Board Review",
          category: "Nursing",
          is_public: true,
        }),
        draft: expect.objectContaining({
          examName: "Nursing Board Review",
          checklists: expect.arrayContaining([
            expect.objectContaining({ name: "1st Read" }),
            expect.objectContaining({ name: "Practice Questions" }),
          ]),
          subjects: expect.arrayContaining([
            expect.objectContaining({ name: "Medical Surgical" }),
          ]),
        }),
      });
      expect(mockPush).toHaveBeenCalledWith("/templates");
    });
  });

  it("allows navigating back to details and updating metadata without losing review table structure", async () => {
    const user = userEvent.setup();
    render(<TemplateEditorClient initialTemplate={mockTemplate} />);

    // Go to step 2
    await user.click(screen.getByRole("button", { name: /Next: Edit Table/i }));
    expect(screen.getByText("Hypertension")).toBeInTheDocument();

    // Go back to step 1
    await user.click(screen.getByRole("button", { name: /Back to Details/i }));

    // Modify Title
    const titleInput = screen.getByLabelText(/Template Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Nursing Master Template");

    // Go back to step 2 again
    await user.click(screen.getByRole("button", { name: /Next: Edit Table/i }));
    expect(screen.getByText("Hypertension")).toBeInTheDocument();
    expect(screen.getByText("1st Read")).toBeInTheDocument();
    expect(screen.getByText("Practice Questions")).toBeInTheDocument();

    // Save Changes with updated title
    await user.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(updateTemplateAction).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: "tmpl-existing",
          metadata: expect.objectContaining({
            title: "Updated Nursing Master Template",
          }),
        })
      );
    });
  });
});
