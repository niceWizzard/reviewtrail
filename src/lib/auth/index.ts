import { createClient } from "../supabase/client";

export function loginUser({ email, password }: { email: string; password: string }) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export function registerUser({
  email,
  password,
  username,
}: {
  email: string;
  password: string;
  username: string;
}) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signOutUser() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
