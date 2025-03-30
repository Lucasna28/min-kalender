"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { SidebarContainer } from "@/components/layout/sidebar-container";
import { cn } from "@/lib/utils";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Funktion til at åbne sidebaren
  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  // Funktion til at styre sidebar tilstand
  const handleSidebarChange = (open: boolean) => {
    setIsSidebarOpen(open);
  };

  return (
    <div
      className={cn(
        "min-h-screen",
        "max-w-screen overflow-x-hidden",
        "[824px]:pl-72"
      )}
    >
      <SidebarContainer
        isOpen={isSidebarOpen}
        onOpenChange={handleSidebarChange}
      />
      <section
        className={cn(
          "transition-all duration-300 ease-in-out",
          "[824px]:pl-72"
        )}
      >
        <Header onOpenSidebar={openSidebar} />
        <main className="relative" role="main" aria-label="Kalender indhold">
          {children}
        </main>
      </section>
    </div>
  );
}
