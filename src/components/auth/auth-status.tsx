"use client";

import { useSupabase } from "@/components/providers/supabase-provider";

export default function AuthStatus() {
  const { auth } = useSupabase();

  return (
    <div>
      {auth.user ? (
        <p className="text-sm text-muted-foreground ml-4">
          Logget ind som: {auth.user.email}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Ikke logget ind</p>
      )}
    </div>
  );
}
