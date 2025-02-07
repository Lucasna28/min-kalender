"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import CalendarSidebar from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/providers/theme-provider";
import SupabaseProvider from "@/components/providers/supabase-provider";

export function RootProvider({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month" | "year">("month");
  const [visibleCalendarIds, setVisibleCalendarIds] = useState<string[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(
    null
  );
  const [showHolidays, setShowHolidays] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider>
        <div className="relative flex min-h-screen">
          {/* Desktop Sidebar */}

          {/* Mobile Sidebar */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 lg:hidden",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full",
              "transition-transform duration-300 ease-in-out"
            )}
          >
            <div className="h-full flex flex-col bg-muted/50 backdrop-blur-xl border-r">
              <CalendarSidebar
                view={view}
                onViewChange={setView}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                visibleCalendarIds={visibleCalendarIds}
                onVisibleCalendarIdsChange={setVisibleCalendarIds}
                selectedCalendarId={selectedCalendarId}
                onSelectedCalendarIdChange={setSelectedCalendarId}
                isOpen={isSidebarOpen}
                onOpenChange={setIsSidebarOpen}
                showHolidays={showHolidays}
                onShowHolidaysChange={setShowHolidays}
                handlePrint={handlePrint}
              />
            </div>
          </div>

          {/* Overlay når mobile sidebar er åben */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main content */}
          <div className="flex-1">
            <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
            <main className="relative">{children}</main>
          </div>
        </div>
      </SupabaseProvider>
    </ThemeProvider>
  );
}
