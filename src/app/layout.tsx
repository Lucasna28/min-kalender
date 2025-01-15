import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import SupabaseProvider from "@/components/providers/supabase-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Min Kalender",
  description: "En simpel kalender app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider>
            {children}
            <Toaster
              richColors
              position="bottom-right"
              duration={4000}
              closeButton
              theme="system"
              className="dark:bg-gray-800 dark:text-white"
            />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
