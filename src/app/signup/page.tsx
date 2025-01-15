"use client";

import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "lucide-react";
import { useState } from "react";

export default function SignUpPage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) throw signUpError;

      toast({
        title: "Konto oprettet",
        description: "Tjek din email for at bekræfte din konto",
      });

      router.push("/login");
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Fejl",
        description:
          error instanceof Error ? error.message : "Der skete en fejl",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 p-2 rounded-full bg-primary/10">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Opret en konto
          </h2>
          <p className="text-sm text-muted-foreground">
            Opret en konto for at komme i gang med din kalender
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Navn</Label>
            <Input
              id="name"
              placeholder="Dit navn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="din@email.dk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Adgangskode</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Opretter konto..." : "Opret konto"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Eller
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/login")}
          disabled={isLoading}
        >
          Har du allerede en konto? Log ind
        </Button>
      </div>
    </div>
  );
}
