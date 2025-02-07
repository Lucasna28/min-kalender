"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import CalendarSidebar from "@/components/layout/sidebar";
import { motion, AnimatePresence } from "framer-motion";

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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        role="complementary"
        aria-label="Kalender navigation"
        className={cn(
          "fixed inset-y-0 left-0",
          "w-[85vw] md:w-72 bg-background border-r",
          "transform transition-transform duration-300 ease-in-out",
          "z-50 touch-manipulation",
          "shadow-lg",
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
    </>
  );
}
