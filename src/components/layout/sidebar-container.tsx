"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import CalendarSidebar from "@/components/layout/sidebar";

interface SidebarContainerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SidebarContainer({
  isOpen,
  onOpenChange,
}: SidebarContainerProps) {
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
    <>
      <aside
        role="complementary"
        aria-label="Kalender navigation"
        className={cn(
          "fixed inset-y-0 left-0",
          "w-72 bg-muted/50 backdrop-blur-xl border-r",
          "transform transition-transform duration-300 ease-in-out",
          "z-50",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav role="navigation" aria-label="Kalender navigation">
          <CalendarSidebar
            view={view}
            onViewChange={setView}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            visibleCalendarIds={visibleCalendarIds}
            onVisibleCalendarIdsChange={setVisibleCalendarIds}
            selectedCalendarId={selectedCalendarId}
            onSelectedCalendarIdChange={setSelectedCalendarId}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            showHolidays={showHolidays}
            onShowHolidaysChange={setShowHolidays}
            handlePrint={handlePrint}
          />
        </nav>
      </aside>

      {/* Overlay for mobile only */}
      {isOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}
    </>
  );
}
