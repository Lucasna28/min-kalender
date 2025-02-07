import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { RootProvider } from "@/components/providers/root-provider";
import { cn } from "@/lib/utils";

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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no, shrink-to-fit=no, interactive-widget=resizes-content"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Min Kalender" />

        {/* Safari mobile web app styling */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* Forhindre telefonnumre i at blive links */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          "min-h-[100dvh]", // Brug dynamic viewport height
          inter.className
        )}
      >
        <RootProvider className={inter.className}>{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
