"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Ugyldig email"),
  password: z.string().min(6, "Adgangskoden skal være mindst 6 tegn"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) throw signInError;

      toast({
        title: "Logget ind",
        description: "Du er nu logget ind.",
      });

      router.push("/calendar");
    } catch (error) {
      console.error("Fejl ved login:", error);
      toast({
        title: "Fejl ved login",
        description:
          error instanceof Error ? error.message : "Der skete en uventet fejl",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <div>{/* Render your form components here */}</div>;
}
