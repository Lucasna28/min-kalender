"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./login-form";

interface AuthError {
  message: string;
  status?: number;
}

interface AuthFormProps {
  view?: "sign-in" | "sign-up" | "forgotten-password" | "update-password";
}

export function AuthForm({ view = "sign-in" }: AuthFormProps) {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string) => {
    setIsLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (signInError) {
        throw signInError;
      }

      toast({
        title: "Tjek din email",
        description: "Vi har sendt dig et magisk link til at logge ind med.",
      });
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast({
        title: "Fejl",
        description:
          authError?.message || "Der skete en fejl. Prøv igen senere.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {view === "sign-in" && "Log ind"}
          {view === "sign-up" && "Opret konto"}
          {view === "forgotten-password" && "Nulstil adgangskode"}
          {view === "update-password" && "Opdater adgangskode"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {view === "sign-in" && "Log ind med din email"}
          {view === "sign-up" && "Opret en konto med din email"}
          {view === "forgotten-password" &&
            "Indtast din email for at nulstille din adgangskode"}
          {view === "update-password" && "Vælg en ny adgangskode"}
        </p>
      </div>

      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />

      <p className="px-8 text-center text-sm text-muted-foreground">
        Ved at fortsætte accepterer du vores{" "}
        <Button variant="link" className="h-auto p-0">
          Vilkår og betingelser
        </Button>{" "}
        og{" "}
        <Button variant="link" className="h-auto p-0">
          Privatlivspolitik
        </Button>
        .
      </p>
    </div>
  );
}
