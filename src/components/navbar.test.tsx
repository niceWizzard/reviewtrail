import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Navbar } from "./navbar";

const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock("@/src/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("renders brand title and nav links correctly", () => {
    render(<Navbar />);

    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Trail")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /exam templates/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tracker builder/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
  });

  it("renders login and register CTA buttons when user is logged out", async () => {
    render(<Navbar />);

    const loginButtons = screen.getAllByRole("button", { name: /log in/i });
    const registerButtons = screen.getAllByRole("button", { name: /register/i });

    expect(loginButtons.length).toBeGreaterThan(0);
    expect(registerButtons.length).toBeGreaterThan(0);
  });

  it("renders dashboard button when user is logged in", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
    });

    render(<Navbar />);

    await waitFor(() => {
      const dashboardButtons = screen.getAllByRole("button", { name: /dashboard/i });
      expect(dashboardButtons.length).toBeGreaterThan(0);
    });

    expect(screen.queryByRole("button", { name: /log in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /register/i })).not.toBeInTheDocument();
  });
});
