"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { SidebarContainer } from "@/components/layout/sidebar-container";
import { cn } from "@/lib/utils";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isUserAction = useRef(false);

  // Nulstil sidebar tilstand ved mount
  useEffect(() => {
    if (!isUserAction.current) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleSidebarChange = (open: boolean) => {
    isUserAction.current = true;
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
        <Header onOpenSidebar={() => handleSidebarChange(true)} />
        <main className="relative" role="main" aria-label="Kalender indhold">
          {children}
        </main>
      </section>
    </div>
  );
}
