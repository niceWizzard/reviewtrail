import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ForgotPasswordPage from "./page";
import { mockResetPasswordForEmail } from "@/src/test/mocks/supabase";

vi.mock("@/src/lib/supabase/client", () => import("@/src/test/mocks/supabase"));

describe("ForgotPasswordPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders forgot password header and email input", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText("Forgot Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  it("handles successful password reset request", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    });

    const form = emailInput.closest("form")!;
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Check your email" })).toBeInTheDocument();
    });
  });

  it("displays error message when password reset request fails", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      data: null,
      error: { message: "User not found" },
    });

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "notfound@example.com" } });
    });

    const form = emailInput.closest("form")!;
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(screen.getByText("User not found")).toBeInTheDocument();
    });
  });
});
