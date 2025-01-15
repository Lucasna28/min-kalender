"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { z } from "zod";
import { useRouter } from "next/navigation";

const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Navn skal være mindst 2 tegn")
    .max(50, "Navn må højst være 50 tegn")
    .regex(
      /^[a-zA-ZæøåÆØÅ\s-]+$/,
      "Navn må kun indeholde bogstaver, mellemrum og bindestreg"
    ),
  email: z.string().email("Indtast en gyldig email"),
  password: z
    .string()
    .min(8, "Adgangskoden skal være mindst 8 tegn")
    .regex(/[A-Z]/, "Adgangskoden skal indeholde mindst ét stort bogstav")
    .regex(/[a-z]/, "Adgangskoden skal indeholde mindst ét lille bogstav")
    .regex(/[0-9]/, "Adgangskoden skal indeholde mindst ét tal")
    .regex(/[^A-Za-z0-9]/, "Adgangskoden skal indeholde mindst ét specialtegn"),
});

interface PasswordRequirement {
  text: string;
  regex: RegExp;
}

const passwordRequirements: PasswordRequirement[] = [
  { text: "Mindst 8 tegn", regex: /.{8,}/ },
  { text: "Mindst ét stort bogstav", regex: /[A-Z]/ },
  { text: "Mindst ét lille bogstav", regex: /[a-z]/ },
  { text: "Mindst ét tal", regex: /[0-9]/ },
  { text: "Mindst ét specialtegn", regex: /[^A-Za-z0-9]/ },
];

export default function SignupForm() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  useEffect(() => {
    // Beregn password styrke
    const strength = passwordRequirements.reduce((score, requirement) => {
      return score + (requirement.regex.test(formData.password) ? 1 : 0);
    }, 0);
    setPasswordStrength(strength);
  }, [formData.password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    if (passwordStrength === 4) return "bg-indigo-500";
    return "bg-indigo-600";
  };

  const validateForm = () => {
    try {
      signupSchema.parse(formData);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        }
      );

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Ingen bruger returneret");

      toast({
        title: "Konto oprettet",
        description:
          "Din konto er blevet oprettet. Tjek din email for at bekræfte din konto.",
      });

      router.push("/login");
    } catch (error) {
      console.error("Fejl ved oprettelse:", error);
      toast({
        title: "Fejl ved oprettelse",
        description:
          error instanceof Error ? error.message : "Der skete en uventet fejl",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "User already registered":
        return "Denne email er allerede registreret";
      case "Password should be at least 6 characters":
        return "Adgangskoden skal være mindst 6 tegn";
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
            Opret konto
          </motion.h2>
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Opret en konto for at komme i gang
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Label htmlFor="name">Navn</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Dit navn"
              value={formData.name}
              onChange={handleChange}
              className={`h-10 ${errors.name ? "border-red-500" : ""}`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p className="text-sm text-red-500" id="name-error">
                {errors.name}
              </p>
            )}
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="din@email.dk"
              value={formData.email}
              onChange={handleChange}
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
            transition={{ delay: 0.3 }}
          >
            <Label htmlFor="password">Adgangskode</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`h-10 pr-10 ${
                  errors.password ? "border-red-500" : ""
                }`}
                aria-invalid={!!errors.password}
                aria-describedby="password-requirements"
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

            {/* Password strength indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${getPasswordStrengthColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <ul className="space-y-1 text-sm" id="password-requirements">
                  {passwordRequirements.map((requirement, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      {requirement.regex.test(formData.password) ? (
                        <Check className="h-4 w-4 text-indigo-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      {requirement.text}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {errors.password && (
              <p className="text-sm text-red-500" id="password-error">
                {errors.password}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
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
                "Opret konto"
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
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Har du allerede en konto? Log ind</span>
          </Link>
        </motion.div>
      </motion.div>
    </Card>
  );
}
