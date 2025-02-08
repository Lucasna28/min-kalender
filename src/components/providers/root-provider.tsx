"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import SupabaseProvider from "@/components/providers/supabase-provider";
import { Toaster } from "sonner";

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider>{children}</SupabaseProvider>
      <Toaster />
    </ThemeProvider>
  );
}
