import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteAccountAction } from "./account";
import { redirect } from "next/navigation";

const mockGetUser = vi.fn();
const mockSignOut = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();

const mockDeleteUser = vi.fn();

vi.mock("@/src/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
    },
    from: mockFrom,
  })),
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        deleteUser: mockDeleteUser,
      },
    },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Account Actions (lib/actions/account)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEq.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });
  });

  it("throws an error when user is unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error("No session") });

    await expect(deleteAccountAction()).rejects.toThrow(
      "User must be authenticated to delete account."
    );
  });

  it("deletes user profile, user trackers, auth account via admin client, signs out, and redirects to /", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-999", email: "delete@example.com" } },
      error: null,
    });
    mockSignOut.mockResolvedValue({ error: null });
    mockDeleteUser.mockResolvedValue({ data: { user: null }, error: null });

    await deleteAccountAction();

    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockFrom).toHaveBeenCalledWith("exam_trackers");
    expect(mockEq).toHaveBeenNthCalledWith(1, "user_id", "user-999");
    expect(mockEq).toHaveBeenNthCalledWith(2, "user_id", "user-999");
    expect(mockDeleteUser).toHaveBeenCalledWith("user-999");
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith("/");
  });
});
