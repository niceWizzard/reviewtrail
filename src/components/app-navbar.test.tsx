import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppNavbar } from "./app-navbar";

import { mockGetUser, mockOnAuthStateChange } from "@/src/test/mocks/supabase";

vi.mock("@/src/lib/supabase/client", () => import("@/src/test/mocks/supabase"));

describe("AppNavbar Component", () => {
  it("renders username from user_metadata and excludes About link", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          email: "test@example.com",
          user_metadata: { username: "johndoe" },
        },
      },
    });

    render(<AppNavbar />);

    await waitFor(() => {
      const logoLink = screen.getByRole("link", { name: /review trail board exam/i });
      expect(logoLink).toHaveAttribute("href", "/dashboard");
    });

    expect(screen.getByText("johndoe")).toBeInTheDocument();
    expect(screen.getByText("J")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /exam templates/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tracker builder/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /about/i })).not.toBeInTheDocument();
  });

  it("falls back to User and U when username is missing from user_metadata", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
    });

    render(<AppNavbar />);

    await waitFor(() => {
      expect(screen.getByText("User")).toBeInTheDocument();
    });

    expect(screen.getByText("U")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /log in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /register/i })).not.toBeInTheDocument();
  });
});
