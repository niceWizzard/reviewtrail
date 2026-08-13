import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DoubleClickInlineInput } from "./double-click-inline-input";

describe("DoubleClickInlineInput Component", () => {
  const defaultProps = {
    value: "Pharmacology",
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders text value initially in display mode with tabIndex 0", () => {
    render(<DoubleClickInlineInput {...defaultProps} />);
    const button = screen.getByRole("button", { name: "Rename Pharmacology" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("tabindex", "0");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("switches to editing mode on double click", () => {
    render(<DoubleClickInlineInput {...defaultProps} />);

    const button = screen.getByRole("button", { name: "Rename Pharmacology" });
    fireEvent.doubleClick(button);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Pharmacology");
  });

  it("switches to editing mode when Enter is pressed on focused element", async () => {
    const user = userEvent.setup();
    render(<DoubleClickInlineInput {...defaultProps} />);

    const button = screen.getByRole("button", { name: "Rename Pharmacology" });
    button.focus();
    await user.keyboard("{Enter}");

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Pharmacology");
  });

  it("switches to editing mode when Space is pressed on focused element", async () => {
    const user = userEvent.setup();
    render(<DoubleClickInlineInput {...defaultProps} />);

    const button = screen.getByRole("button", { name: "Rename Pharmacology" });
    button.focus();
    await user.keyboard(" ");

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Pharmacology");
  });

  it("submits updated name on Enter key press", async () => {
    const user = userEvent.setup();
    render(<DoubleClickInlineInput {...defaultProps} />);

    fireEvent.doubleClick(screen.getByRole("button", { name: "Rename Pharmacology" }));
    const input = screen.getByRole("textbox");

    await user.clear(input);
    await user.type(input, "Clinical Pharmacology{Enter}");

    expect(defaultProps.onSave).toHaveBeenCalledWith("Clinical Pharmacology");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("submits updated name on Blur event", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <DoubleClickInlineInput {...defaultProps} />
        <button type="button">Outside Button</button>
      </div>
    );

    fireEvent.doubleClick(screen.getByRole("button", { name: "Rename Pharmacology" }));
    const input = screen.getByRole("textbox");

    await user.clear(input);
    await user.type(input, "Neuropharmacology");
    await user.click(screen.getByText("Outside Button"));

    expect(defaultProps.onSave).toHaveBeenCalledWith("Neuropharmacology");
  });

  it("cancels editing without saving on Escape key press", async () => {
    const user = userEvent.setup();
    render(<DoubleClickInlineInput {...defaultProps} />);

    fireEvent.doubleClick(screen.getByRole("button", { name: "Rename Pharmacology" }));
    const input = screen.getByRole("textbox");

    await user.clear(input);
    await user.type(input, "Different Name{Escape}");

    expect(defaultProps.onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Rename Pharmacology" })).toBeInTheDocument();
  });

  it("reverts to original value without calling onSave if input is empty or whitespace", async () => {
    const user = userEvent.setup();
    render(<DoubleClickInlineInput {...defaultProps} />);

    fireEvent.doubleClick(screen.getByRole("button", { name: "Rename Pharmacology" }));
    const input = screen.getByRole("textbox");

    await user.clear(input);
    await user.type(input, "   {Enter}");

    expect(defaultProps.onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Rename Pharmacology" })).toBeInTheDocument();
  });
});
