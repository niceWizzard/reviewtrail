import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUpdatePassword } = vi.hoisted(() => ({
  mockUpdatePassword: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/src/lib/auth", () => ({
  updatePassword: mockUpdatePassword,
}));

import ResetPasswordPage from "./page";

describe("ResetPasswordPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders reset password header and password inputs", () => {
    render(<ResetPasswordPage />);
    expect(screen.getByText("Set New Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm new password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  });

  it("handles successful password reset", async () => {
    mockUpdatePassword.mockResolvedValue({ user: { id: "user-123" } } as any);

    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmInput = screen.getByLabelText(/^confirm new password$/i);

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "newsecret123" } });
      fireEvent.change(confirmInput, { target: { value: "newsecret123" } });
    });

    const submitButton = screen.getByRole("button", { name: /reset password/i });
    await waitFor(() => expect(submitButton).not.toBeDisabled());

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith("newsecret123");
      expect(screen.getByText(/password reset successful/i)).toBeInTheDocument();
    });
  });

  it("displays error message when password reset fails", async () => {
    mockUpdatePassword.mockRejectedValue(new Error("Token expired"));

    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmInput = screen.getByLabelText(/^confirm new password$/i);

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "newsecret123" } });
      fireEvent.change(confirmInput, { target: { value: "newsecret123" } });
    });

    const submitButton = screen.getByRole("button", { name: /reset password/i });
    await waitFor(() => expect(submitButton).not.toBeDisabled());

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText("Token expired")).toBeInTheDocument();
    });
  });
});
