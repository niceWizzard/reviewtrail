import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppNavbar } from "./app-navbar";

import { mockGetUser, mockOnAuthStateChange } from "@/src/test/mocks/supabase";

vi.mock("@/src/lib/supabase/client", () => import("@/src/test/mocks/supabase"));

describe("AppNavbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
    });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("renders logo linking to /dashboard, app nav links, and excludes About link", async () => {
    render(<AppNavbar />);

    await waitFor(() => {
      const logoLink = screen.getByRole("link", { name: /review trail board exam/i });
      expect(logoLink).toHaveAttribute("href", "/dashboard");
    });

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /exam templates/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tracker builder/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /about/i })).not.toBeInTheDocument();
  });

  it("renders user profile trigger and hides login/register CTAs", async () => {
    render(<AppNavbar />);

    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /log in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /register/i })).not.toBeInTheDocument();
  });
});
