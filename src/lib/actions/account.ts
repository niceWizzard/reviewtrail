"use server";

import { createClient, createAdminClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export async function deleteAccountAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User must be authenticated to delete account.");
  }

  // 1. Delete user profile and trackers
  const { error: profileDeleteError } = await supabase
    .from("profiles")
    .delete()
    .eq("user_id", user.id);

  if (profileDeleteError) {
    console.warn("Profiles deletion warning:", profileDeleteError.message);
  }

  const { error: trackersDeleteError } = await supabase
    .from("exam_trackers")
    .delete()
    .eq("user_id", user.id);

  if (trackersDeleteError) {
    console.warn("Exam trackers deletion warning:", trackersDeleteError.message);
  }

  // 2. Permanently delete user from Supabase Auth via admin client
  try {
    const adminSupabase = createAdminClient();
    const { error: adminDeleteError } = await adminSupabase.auth.admin.deleteUser(user.id);
    if (adminDeleteError) {
      console.warn("Admin delete user warning:", adminDeleteError.message);
    }
  } catch (err) {
    console.warn("Could not execute admin delete user:", err);
  }

  // 3. Sign out user session
  await supabase.auth.signOut();

  redirect("/");
}
