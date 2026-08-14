import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SettingsPage from "./page";

import { useUser } from "@/src/hooks/use-user";
import { updateUsername, updateEmail, updatePassword } from "@/src/lib/auth";
import { deleteAccountAction } from "@/src/lib/actions/account";

vi.mock("@/src/hooks/use-user");
vi.mock("@/src/lib/auth");
vi.mock("@/src/lib/actions/account");

const mockedUseUser = vi.mocked(useUser);
const mockedUpdateUsername = vi.mocked(updateUsername);
const mockedUpdateEmail = vi.mocked(updateEmail);
const mockedUpdatePassword = vi.mocked(updatePassword);
const mockedDeleteAccountAction = vi.mocked(deleteAccountAction);

describe("SettingsPage Component", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    user_metadata: { username: "johndoe" },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseUser.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
    });
  });

  it("renders loading spinner when user is loading", () => {
    mockedUseUser.mockReturnValue({
      user: null,
      loading: true,
      error: null,
    });

    render(<SettingsPage />);
    expect(screen.queryByText("Account Settings")).not.toBeInTheDocument();
  });

  it("populates username and email from user metadata", () => {
    render(<SettingsPage />);

    expect(screen.getByDisplayValue("johndoe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
  });

  describe("Username Form", () => {
    it("handles successful username update", async () => {
      mockedUpdateUsername.mockResolvedValue({} as any);

      render(<SettingsPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      fireEvent.change(usernameInput, { target: { value: "newusername" } });

      const saveButton = screen.getByRole("button", { name: /save username/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockedUpdateUsername).toHaveBeenCalledWith("user-123", "newusername");
        expect(screen.getByText("Username updated successfully!")).toBeInTheDocument();
      });
    });

    it("displays error message when username update fails (e.g. taken)", async () => {
      mockedUpdateUsername.mockRejectedValue(
        new Error("Username is already taken. Please choose another one.")
      );

      render(<SettingsPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      fireEvent.change(usernameInput, { target: { value: "takenusername" } });

      const saveButton = screen.getByRole("button", { name: /save username/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText("Username is already taken. Please choose another one.")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Email Form", () => {
    it("handles successful email update request", async () => {
      mockedUpdateEmail.mockResolvedValue({} as any);

      render(<SettingsPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: "newemail@example.com" } });

      const updateButton = screen.getByRole("button", { name: /update email/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockedUpdateEmail).toHaveBeenCalledWith("user-123", "newemail@example.com");
        expect(
          screen.getByText(/email update requested! check your new email inbox/i)
        ).toBeInTheDocument();
      });
    });

    it("displays error message when email update fails (e.g. already in use)", async () => {
      mockedUpdateEmail.mockRejectedValue(
        new Error("Email address is already in use by another account.")
      );

      render(<SettingsPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: "takenemail@example.com" } });

      const updateButton = screen.getByRole("button", { name: /update email/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(
          screen.getByText("Email address is already in use by another account.")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Password Form", () => {
    it("displays error when passwords do not match without calling updatePassword", async () => {
      render(<SettingsPage />);

      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/^confirm new password$/i);

      fireEvent.change(newPasswordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "different123" } });

      const resetButton = screen.getByRole("button", { name: /reset password/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
        expect(mockedUpdatePassword).not.toHaveBeenCalled();
      });
    });

    it("handles successful password reset and clears password inputs", async () => {
      mockedUpdatePassword.mockResolvedValue({} as any);

      render(<SettingsPage />);

      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/^confirm new password$/i);

      fireEvent.change(newPasswordInput, { target: { value: "newpassword123" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "newpassword123" } });

      const resetButton = screen.getByRole("button", { name: /reset password/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(mockedUpdatePassword).toHaveBeenCalledWith("newpassword123");
        expect(screen.getByText("Password reset successfully!")).toBeInTheDocument();
        expect(newPasswordInput).toHaveValue("");
        expect(confirmPasswordInput).toHaveValue("");
      });
    });
  });

  describe("Account Deletion", () => {
    it("disables delete confirmation button until DELETE is typed", async () => {
      render(<SettingsPage />);

      const deleteModalTrigger = screen.getByRole("button", { name: /delete account/i });
      fireEvent.click(deleteModalTrigger);

      const confirmButton = screen.getByRole("button", {
        name: /permanently delete account/i,
      });
      expect(confirmButton).toBeDisabled();

      const input = screen.getByPlaceholderText("DELETE");
      fireEvent.change(input, { target: { value: "del" } });
      expect(confirmButton).toBeDisabled();

      fireEvent.change(input, { target: { value: "DELETE" } });
      expect(confirmButton).not.toBeDisabled();
    });

    it("calls deleteAccountAction when DELETE is typed and confirmed", async () => {
      mockedDeleteAccountAction.mockResolvedValue(undefined as any);

      render(<SettingsPage />);

      const deleteModalTrigger = screen.getByRole("button", { name: /delete account/i });
      fireEvent.click(deleteModalTrigger);

      const input = screen.getByPlaceholderText("DELETE");
      fireEvent.change(input, { target: { value: "DELETE" } });

      const confirmButton = screen.getByRole("button", {
        name: /permanently delete account/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockedDeleteAccountAction).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("State Resets", () => {
    it("resets form states and input values when user prop updates", () => {
      const { rerender } = render(<SettingsPage />);

      expect(screen.getByDisplayValue("johndoe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();

      const newMockUser = {
        id: "user-456",
        email: "alice@example.com",
        user_metadata: { username: "alice" },
      } as any;

      mockedUseUser.mockReturnValue({
        user: newMockUser,
        loading: false,
        error: null,
      });

      rerender(<SettingsPage />);

      expect(screen.getByDisplayValue("alice")).toBeInTheDocument();
      expect(screen.getByDisplayValue("alice@example.com")).toBeInTheDocument();
    });
  });
});
