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

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    if (view === "year" || view === "month") {
      setView("day");
    }
  };

  return (
    <>
      <div className="hidden lg:flex lg:w-72 flex-col bg-muted/50 backdrop-blur-xl border-r">
        <CalendarSidebar
          view={view}
          onViewChange={setView}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          visibleCalendarIds={visibleCalendarIds}
          onVisibleCalendarIdsChange={setVisibleCalendarIds}
          selectedCalendarId={selectedCalendarId}
          onSelectedCalendarIdChange={setSelectedCalendarId}
          isOpen={true}
          onOpenChange={() => {}}
          showHolidays={showHolidays}
          onShowHolidaysChange={setShowHolidays}
          handlePrint={handlePrint}
        />
      </div>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "transition-transform duration-300 ease-in-out"
        )}
      >
        <div className="h-full flex flex-col bg-muted/50 backdrop-blur-xl border-r">
          <CalendarSidebar
            view={view}
            onViewChange={setView}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
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
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}
    </>
  );
}
