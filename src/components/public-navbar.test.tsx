import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PublicNavbar } from "./public-navbar";

import { mockGetUser, mockOnAuthStateChange } from "@/src/test/mocks/supabase";

vi.mock("@/src/lib/supabase/client", () => import("@/src/test/mocks/supabase"));

describe("PublicNavbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("renders brand logo linking to / and all public nav links", async () => {
    render(<PublicNavbar />);

    await waitFor(() => {
      expect(screen.getByText("Review")).toBeInTheDocument();
    });

    const logoLink = screen.getByRole("link", { name: /review trail board exam/i });
    expect(logoLink).toHaveAttribute("href", "/");

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /exam templates/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tracker builder/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
  });

  it("renders login and register CTA buttons when user is logged out", async () => {
    render(<PublicNavbar />);

    await waitFor(() => {
      const loginButtons = screen.getAllByRole("button", { name: /log in/i });
      expect(loginButtons.length).toBeGreaterThan(0);
    });

    const registerButtons = screen.getAllByRole("button", { name: /register/i });
    expect(registerButtons.length).toBeGreaterThan(0);
  });
});
