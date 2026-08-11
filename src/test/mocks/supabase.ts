import { vi } from "vitest";

export const mockSignInWithPassword = vi.fn();
export const mockSignUp = vi.fn();
export const mockSignOut = vi.fn();
export const mockGetUser = vi.fn();
export const mockOnAuthStateChange = vi.fn();

export const createClient = vi.fn(() => ({
  auth: {
    signInWithPassword: mockSignInWithPassword,
    signUp: mockSignUp,
    signOut: mockSignOut,
    getUser: mockGetUser,
    onAuthStateChange: mockOnAuthStateChange,
  },
}));
