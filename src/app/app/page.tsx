"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import CalendarView from "@/components/calendar/calendar-view";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CalendarViewType } from "@/types/calendar";

export default function AppPage() {
  const { user } = useSupabase().auth;
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>("month");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [visibleCalendarIds, setVisibleCalendarIds] = useState<string[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(
    null
  );
  const [showHolidays, setShowHolidays] = useState(true);

  if (!user) {
    router.push("/login");
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-background"
    >
      <Navbar />
      <Sidebar
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        selectedDate={date}
        onDateChange={setDate}
        view={view}
        onViewChange={setView}
        visibleCalendarIds={visibleCalendarIds}
        onVisibleCalendarIdsChange={setVisibleCalendarIds}
        selectedCalendarId={selectedCalendarId}
        onSelectedCalendarIdChange={setSelectedCalendarId}
        showHolidays={showHolidays}
        onShowHolidaysChange={setShowHolidays}
        handlePrint={handlePrint}
      />
      <main
        className={cn(
          "h-screen pt-14 transition-[padding]",
          isSidebarOpen ? "lg:pl-64" : "lg:pl-0"
        )}
      >
        <div className="h-full">
          <CalendarView
            className="h-full"
            selectedDate={date}
            onDateChange={setDate}
            view={view}
          />
        </div>
      </main>
    </motion.div>
  );
}
