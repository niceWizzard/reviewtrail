import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  loginUser,
  registerUser,
  signOutUser,
  updateUsername,
  updateEmail,
  updatePassword,
  requestPasswordReset,
} from "./index";

import {
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
  mockUpdateUser,
  mockResetPasswordForEmail,
  mockFrom,
} from "@/src/test/mocks/supabase";

vi.mock("../supabase/client", () => import("@/src/test/mocks/supabase"));

describe("Auth Helpers (lib/auth)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup window.location.origin for registerUser
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    });
  });

  it("should call signInWithPassword with correct credentials on loginUser", async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { user: { id: "123" } }, error: null });

    const result = await loginUser({ email: "test@example.com", password: "password123" });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(result).toEqual({ data: { user: { id: "123" } }, error: null });
  });

  it("should call signUp with username metadata on registerUser", async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: "123" } }, error: null });

    const result = await registerUser({
      email: "newuser@example.com",
      password: "password123",
      username: "testuser",
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "newuser@example.com",
      password: "password123",
      options: {
        data: { username: "testuser" },
        emailRedirectTo: "http://localhost:3000/auth/callback",
      },
    });
    expect(result).toEqual({ data: { user: { id: "123" } }, error: null });
  });

  it("should call signOut on signOutUser", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await signOutUser();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  describe("updateUsername", () => {
    it("throws error if username is empty", async () => {
      await expect(updateUsername("user-1", "   ")).rejects.toThrow("Username cannot be empty");
    });

    it("throws error if username is already taken in profiles table", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: "other-user" }, error: null }),
      });

      await expect(updateUsername("user-1", "existinguser")).rejects.toThrow(
        "Username is already taken. Please choose another one."
      );
    });

    it("updates auth metadata and profiles table when username is unique", async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        upsert: mockUpsert,
      });

      mockUpdateUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

      const res = await updateUsername("user-1", "newuniqueusername");

      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: { username: "newuniqueusername" },
      });
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user-1",
          username: "newuniqueusername",
        })
      );
      expect(res).toEqual({ user: { id: "user-1" } });
    });
  });

  describe("updateEmail", () => {
    it("throws error if email is empty", async () => {
      await expect(updateEmail("user-1", "   ")).rejects.toThrow("Email cannot be empty");
    });

    it("throws error if email is already taken in profiles table", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: "other-user" }, error: null }),
      });

      await expect(updateEmail("user-1", "existing@example.com")).rejects.toThrow(
        "Email address is already in use by another account."
      );
    });

    it("requests email update and updates profiles table when email is available", async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        upsert: mockUpsert,
      });

      mockUpdateUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

      const res = await updateEmail("user-1", "newemail@example.com");

      expect(mockUpdateUser).toHaveBeenCalledWith({
        email: "newemail@example.com",
      });
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user-1",
          email: "newemail@example.com",
        })
      );
      expect(res).toEqual({ user: { id: "user-1" } });
    });
  });

  describe("updatePassword", () => {
    it("throws error if password is less than 6 characters", async () => {
      await expect(updatePassword("12345")).rejects.toThrow(
        "Password must be at least 6 characters long."
      );
    });

    it("calls updateUser with new password", async () => {
      mockUpdateUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

      const res = await updatePassword("securePassword123");

      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: "securePassword123",
      });
      expect(res).toEqual({ user: { id: "user-1" } });
    });
  });

  describe("requestPasswordReset", () => {
    it("throws error if email is empty", () => {
      expect(() => requestPasswordReset("   ")).toThrow("Email cannot be empty");
    });

    it("calls resetPasswordForEmail with trimmed email and redirect URL", () => {
      mockResetPasswordForEmail.mockReturnValue({ data: {}, error: null });

      const res = requestPasswordReset(" User@Example.com ");

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith("user@example.com", {
        redirectTo: "http://localhost:3000/auth/callback?next=/reset-password",
      });
      expect(res).toEqual({ data: {}, error: null });
    });
  });
});
