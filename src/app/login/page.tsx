"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Håndter keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const form = document.querySelector("form");
        if (form) form.requestSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Beregn password styrke
  const calculatePasswordStrength = (pass: string): number => {
    let strength = 0;
    if (pass.length >= 6) strength += 20;
    if (pass.length >= 8) strength += 20;
    if (/[A-Z]/.test(pass)) strength += 20;
    if (/[0-9]/.test(pass)) strength += 20;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 20;
    return strength;
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength === 0) return "Meget svag";
    if (strength <= 20) return "Svag";
    if (strength <= 40) return "Okay";
    if (strength <= 60) return "God";
    if (strength <= 80) return "Stærk";
    return "Meget stærk";
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 20) return "bg-destructive";
    if (strength <= 40) return "bg-orange-500";
    if (strength <= 60) return "bg-yellow-500";
    if (strength <= 80) return "bg-indigo-500";
    return "bg-indigo-600";
  };

  // Tilføj validering på input change
  const validateEmail = (email: string) => {
    if (!email) return "Email er påkrævet";
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      if (!email.includes("@")) return "Email skal indeholde @";
      if (!email.includes(".")) return "Email skal indeholde et domæne";
      return "Ugyldig email adresse";
    }
    return "";
  };

  const validateName = (name: string) => {
    if (!name.trim()) return "Navn er påkrævet";
    if (name.trim().length < 2) return "Navn skal være mindst 2 tegn";
    if (name.trim().length > 50) return "Navn må højst være 50 tegn";
    if (!/^[a-zA-ZæøåÆØÅ\s-]+$/.test(name))
      return "Navn må kun indeholde bogstaver, mellemrum og bindestreg";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Adgangskode er påkrævet";
    if (password.length < 6) return "Adgangskode skal være mindst 6 tegn";
    if (password.length > 50) return "Adgangskode må højst være 50 tegn";
    if (!/[A-Z]/.test(password))
      return "Adgangskode skal indeholde mindst ét stort bogstav";
    if (!/[0-9]/.test(password))
      return "Adgangskode skal indeholde mindst ét tal";
    if (!/[a-z]/.test(password))
      return "Adgangskode skal indeholde mindst ét lille bogstav";
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    const error = validateEmail(newEmail);
    setErrors((prev) => ({ ...prev, email: error }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    const error = validateName(newName);
    setErrors((prev) => ({ ...prev, name: error }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const error = validatePassword(newPassword);
    setErrors((prev) => ({ ...prev, password: error }));
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const nameError = isSignUp ? validateName(name) : "";

    const newErrors = {
      email: emailError,
      password: passwordError,
      name: nameError,
    };

    setErrors(newErrors);

    // Form er kun gyldig hvis der ingen fejl er
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data: authData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: name,
              },
            },
          });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("Ingen bruger returneret");

        try {
          // Opdater profil for den nye bruger
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert(
              {
                id: authData.user.id,
                display_name: name,
                updated_at: new Date().toISOString(),
                has_completed_tutorial: false,
              },
              {
                onConflict: "id",
                ignoreDuplicates: false,
              }
            );

          if (profileError) {
            console.error("Fejl ved opdatering af profil:", profileError);
            // Log mere detaljeret fejlinformation
            if (profileError.code === "23505") {
              console.log(
                "Profil findes allerede - fortsætter med kalenderoprettelse"
              );
            } else {
              console.error("Uventet fejl ved profiloprettelse:", profileError);
            }
            // Fortsæt med kalenderoprettelse selvom profilopdatering fejler
          }

          // Tjek om brugeren allerede har en kalender
          const { data: existingCalendars, error: calendarCheckError } =
            await supabase
              .from("calendars")
              .select("id")
              .eq("user_id", authData.user.id)
              .limit(1);

          if (
            !calendarCheckError &&
            (!existingCalendars || existingCalendars.length === 0)
          ) {
            // Opret kun kalender hvis brugeren ikke har en i forvejen
            const { error: calendarError } = await supabase
              .from("calendars")
              .insert({
                name: "Min kalender",
                description: "Min personlige kalender",
                color: "#4285f4",
                type: "personal",
                is_visible: true,
                is_public: false,
                show_in_search: false,
                allow_invites: true,
                user_id: authData.user.id,
              });

            if (calendarError) {
              console.error("Fejl ved oprettelse af kalender:", calendarError);
              toast({
                title: "Bemærk",
                description:
                  "Der skete en fejl ved oprettelse af din standardkalender.",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error("Fejl ved oprettelse af profil/kalender:", error);
          // Vi fortsætter selvom der er fejl, da brugeren stadig er oprettet
          toast({
            title: "Bemærk",
            description:
              "Der skete en fejl ved opsætning af din profil eller kalender.",
            variant: "destructive",
          });
        }

        toast({
          title: "Konto oprettet",
          description: "Tjek din email for at bekræfte din konto",
          duration: 5000,
        });

        // Reset form efter signup
        setEmail("");
        setPassword("");
        setName("");
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        // Hent bruger data
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Ingen bruger fundet");

        // Tjek om brugeren er ny
        const { data: profile } = await supabase
          .from("profiles")
          .select("has_completed_tutorial")
          .eq("id", user.id)
          .single();

        // Hvis brugeren ikke har en profil eller ikke har gennemført tutorial
        if (!profile || profile.has_completed_tutorial === null) {
          // Opret/opdater profil med has_completed_tutorial = false
          await supabase.from("profiles").upsert({
            id: user.id,
            display_name: name,
            has_completed_tutorial: false,
            updated_at: new Date().toISOString(),
          });
        }

        toast({
          title: "Velkommen tilbage!",
          description: "Du er nu logget ind",
          duration: 3000,
        });

        router.push("/calendar");

        // I login-håndteringen, efter vellykket login
        const createDefaultCalendar = async (userId: string) => {
          const { data: existingCalendars, error: checkError } = await supabase
            .from("calendars")
            .select("id")
            .eq("user_id", userId)
            .limit(1);

          if (checkError) {
            console.error(
              "Fejl ved tjek af eksisterende kalendere:",
              checkError
            );
            return;
          }

          if (!existingCalendars || existingCalendars.length === 0) {
            const { error: createError } = await supabase
              .from("calendars")
              .insert({
                name: "Min kalender",
                description: "Min personlige kalender",
                color: "#4285f4",
                type: "personal",
                is_visible: true,
                user_id: userId,
              });

            if (createError) {
              console.error(
                "Fejl ved oprettelse af standardkalender:",
                createError
              );
            }
          }
        };
      }
    } catch (error) {
      console.error("Auth error:", error);
      let errorMessage = "Der skete en fejl";

      if (error instanceof Error) {
        switch (error.message) {
          case "Invalid login credentials":
            errorMessage = "Forkert email eller adgangskode";
            break;
          case "Email not confirmed":
            errorMessage = "Email er ikke bekræftet endnu. Tjek din inbox.";
            break;
          case "User already registered":
            errorMessage =
              "Denne email er allerede registreret. Prøv at logge ind.";
            break;
          default:
            errorMessage = error.message;
        }
      }

      toast({
        title: "Fejl",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setName("");
    setPasswordStrength(0);
    setErrors({
      email: "",
      password: "",
      name: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Animeret baggrund */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-black opacity-[0.02] dark:bg-grid-white dark:opacity-[0.02]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      {/* Hovedindhold */}
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card/80 dark:bg-card/40 backdrop-blur-xl p-6 sm:p-8 rounded-lg shadow-xl border border-border/50"
        >
          {/* Header med animation */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-2 rounded-full bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              {isSignUp ? "Opret konto" : "Log ind"}
            </h1>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isSignUp ? "signup" : "login"}
              initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email felt */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={cn(
                      "pr-10 transition-all duration-300",
                      "bg-background/50 focus:bg-background",
                      errors.email
                        ? "border-destructive"
                        : email && !errors.email
                        ? "border-primary"
                        : ""
                    )}
                    placeholder="din@email.dk"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {email && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {errors.email ? (
                          <X className="h-4 w-4 text-destructive" />
                        ) : (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive flex items-center gap-2"
                  >
                    <X className="h-3 w-3" />
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Navn felt (kun ved signup) */}
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label
                      htmlFor="name"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <User className="h-4 w-4" />
                      Navn
                    </Label>
                    <div className="relative group">
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        className={cn(
                          "pr-10 transition-all duration-300",
                          "bg-background/50 focus:bg-background",
                          errors.name
                            ? "border-destructive"
                            : name && !errors.name
                            ? "border-primary"
                            : ""
                        )}
                        placeholder="Dit navn"
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {name && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {errors.name ? (
                              <X className="h-4 w-4 text-destructive" />
                            ) : (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive flex items-center gap-2"
                      >
                        <X className="h-3 w-3" />
                        {errors.name}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password felt */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Lock className="h-4 w-4" />
                  Adgangskode
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    className={cn(
                      "pr-10 transition-all duration-300",
                      "bg-background/50 focus:bg-background",
                      errors.password
                        ? "border-destructive"
                        : password && !errors.password
                        ? "border-primary"
                        : ""
                    )}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: showPassword ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </motion.div>
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive flex items-center gap-2"
                  >
                    <X className="h-3 w-3" />
                    {errors.password}
                  </motion.p>
                )}
                {isSignUp && password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1"
                  >
                    <Progress
                      value={passwordStrength}
                      className={cn(
                        "h-1 transition-colors duration-500",
                        getPasswordStrengthColor(passwordStrength)
                      )}
                    />
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-muted-foreground flex items-center gap-1"
                    >
                      Styrke:{" "}
                      <span
                        className={cn(
                          "font-medium",
                          passwordStrength <= 20 && "text-destructive",
                          passwordStrength > 20 &&
                            passwordStrength <= 40 &&
                            "text-orange-500",
                          passwordStrength > 40 &&
                            passwordStrength <= 60 &&
                            "text-yellow-500",
                          passwordStrength > 60 && "text-primary"
                        )}
                      >
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </motion.p>
                  </motion.div>
                )}
              </div>

              {/* Submit knap */}
              <Button
                type="submit"
                className={cn(
                  "w-full relative overflow-hidden transition-all duration-300",
                  isLoading && "cursor-not-allowed"
                )}
                disabled={isLoading}
              >
                <motion.div
                  initial={false}
                  animate={{
                    y: isLoading ? -30 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span>{isSignUp ? "Opret konto" : "Log ind"}</span>
                </motion.div>
                <motion.div
                  initial={false}
                  animate={{
                    y: isLoading ? -30 : 30,
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                </motion.div>
              </Button>
            </motion.form>
          </AnimatePresence>

          {/* Toggle signup/login */}
          <div className="mt-6 text-center">
            <motion.button
              type="button"
              onClick={toggleSignUp}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors relative"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSignUp
                ? "Har du allerede en konto? Log ind"
                : "Har du ikke en konto? Opret en"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
