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

export async function updateUsername(userId: string, username: string) {
  const supabase = createClient();
  const trimmed = username.trim();

  if (!trimmed) {
    throw new Error("Username cannot be empty");
  }

  // 1. Uniqueness check against profiles table
  const { data: existingUser, error: checkError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", trimmed)
    .neq("id", userId)
    .maybeSingle();

  if (checkError) {
    console.warn("Error checking username uniqueness:", checkError.message);
  }

  if (existingUser) {
    throw new Error("Username is already taken. Please choose another one.");
  }

  // 2. Update Auth metadata
  const { data, error: authError } = await supabase.auth.updateUser({
    data: { username: trimmed },
  });

  if (authError) throw authError;

  // 3. Upsert profiles table
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      username: trimmed,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.warn("Profiles upsert warning:", profileError.message);
  }

  return data;
}

export async function updateEmail(userId: string, email: string) {
  const supabase = createClient();
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    throw new Error("Email cannot be empty");
  }

  // 1. Uniqueness check against profiles table
  const { data: existingUser, error: checkError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", trimmed)
    .neq("id", userId)
    .maybeSingle();

  if (checkError) {
    console.warn("Error checking email uniqueness:", checkError.message);
  }

  if (existingUser) {
    throw new Error("Email address is already in use by another account.");
  }

  // 2. Request Auth email update
  const { data, error: authError } = await supabase.auth.updateUser({
    email: trimmed,
  });

  if (authError) throw authError;

  // 3. Update profiles table
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email: trimmed,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.warn("Profiles email upsert warning:", profileError.message);
  }

  return data;
}

export async function updatePassword(password: string) {
  const supabase = createClient();

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) throw error;
  return data;
}
