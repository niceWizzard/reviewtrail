"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/src/lib/supabase/client";

export interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const supabase = createClient();

        const { data, error: fetchError } = await supabase.auth.getUser();
        if (isMounted) {
          if (fetchError) {
            setError(fetchError);
          } else {
            setUser(data.user ?? null);
          }
          setLoading(false);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (isMounted) {
            setUser(session?.user ?? null);
            setLoading(false);
          }
        });

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    }

    const cleanupPromise = initAuth();

    return () => {
      isMounted = false;
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, []);

  return { user, loading, error };
}
