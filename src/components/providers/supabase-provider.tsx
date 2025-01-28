"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient, User } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/database.types";
import { toast } from "sonner";

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
  auth: {
    user: User | null;
    error: Error | null;
  };
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => {
    try {
      return createClientComponentClient<Database>();
    } catch (error) {
      console.error("Fejl ved oprettelse af Supabase klient:", error);
      toast.error("Der opstod en fejl ved forbindelse til databasen");
      throw error;
    }
  });
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      try {
        if (event === "SIGNED_OUT") {
          setUser(null);
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          setUser(session?.user ?? null);
        } else if (event === "USER_DELETED") {
          setUser(null);
          toast.error("Din bruger er blevet slettet");
        } else if (event === "USER_UPDATED") {
          setUser(session?.user ?? null);
          toast.success("Din bruger er blevet opdateret");
        }
        setError(null);
      } catch (error) {
        console.error("Fejl ved håndtering af auth state ændring:", error);
        setError(error as Error);
        toast.error("Der opstod en fejl med bruger sessionen");
      }
    });

    // Initial session check
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        setUser(session?.user ?? null);
        setError(null);
      } catch (error) {
        console.error("Fejl ved tjek af session:", error);
        setError(error as Error);
        toast.error("Der opstod en fejl ved indlæsning af bruger session");
      }
    };

    checkSession();

    return () => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error("Fejl ved unsubscribe:", error);
      }
    };
  }, [supabase]);

  return (
    <Context.Provider value={{ supabase, auth: { user, error } }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase skal bruges inden i SupabaseProvider");
  }
  return context;
};
