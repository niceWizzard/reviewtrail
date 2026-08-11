import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — cookies cannot be updated directly here
          }
        },
      },
    }
  );
}

export function createStaticClient(cookieString: string) {
  const parsedCookies = cookieString
    ? cookieString.split("; ").map((pair) => {
        const idx = pair.indexOf("=");
        if (idx < 0) return { name: pair.trim(), value: "" };
        return {
          name: pair.substring(0, idx).trim(),
          value: pair.substring(idx + 1).trim(),
        };
      })
    : [];

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return parsedCookies;
        },
        setAll() {},
      },
    }
  );
}

