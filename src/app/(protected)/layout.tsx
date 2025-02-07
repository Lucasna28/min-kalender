"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { SidebarContainer } from "@/components/layout/sidebar-container";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen">
      <SidebarContainer
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />
      <div className="flex-1">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="relative">{children}</main>
      </div>
    </div>
  );
}
