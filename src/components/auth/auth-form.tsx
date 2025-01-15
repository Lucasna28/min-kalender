"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Indtast en gyldig email"),
  password: z.string().min(6, "Adgangskoden skal være mindst 6 tegn"),
});

export default function AuthForm() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [showPassword, setShowPassword] = useState(false);

  // Tjek for fejl parameter i URL
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_error") {
      toast({
        title: "Fejl",
        description: "Der opstod en fejl. Prøv venligst igen.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const validateForm = () => {
    try {
      loginSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (typeof err.path[0] === "string") {
            formattedErrors[err.path[0]] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        // Succes - vis toast og lad middleware håndtere redirect
        toast({
          title: "Velkommen tilbage",
          description: "Du er nu logget ind",
        });

        // Redirect til den oprindelige URL hvis den findes
        const redirectTo = searchParams.get("redirect") || "/calendar";
        router.push(redirectTo);
      } else {
        // Ingen session - vis fejl
        throw new Error("Kunne ikke oprette session");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Fejl",
        description: getErrorMessage(error.message),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "Invalid login credentials":
        return "Forkert email eller adgangskode";
      case "Email not confirmed":
        return "Email er ikke bekræftet. Tjek din indbakke.";
      case "Too many requests":
        return "For mange forsøg. Prøv igen senere.";
      default:
        return "Der skete en fejl. Prøv igen senere";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 space-y-6"
      >
        <div className="space-y-2 text-center">
          <motion.h2
            className="text-2xl font-semibold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Log ind
          </motion.h2>
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Velkommen tilbage! Log ind for at fortsætte
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="din@email.dk"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={`h-10 ${errors.email ? "border-red-500" : ""}`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p className="text-sm text-red-500" id="email-error">
                {errors.email}
              </p>
            )}
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="password">Adgangskode</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`h-10 pr-10 ${
                  errors.password ? "border-red-500" : ""
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500" id="password-error">
                {errors.password}
              </p>
            )}
            <Link
              href="/reset-password"
              className="text-sm text-muted-foreground hover:text-primary transition-colors block text-right"
            >
              Glemt adgangskode?
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              className="w-full h-10"
              type="submit"
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Log ind"
              )}
            </Button>
          </motion.div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Eller</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/signup"
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <span>Har du ikke en konto? Opret konto</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </Card>
  );
}
