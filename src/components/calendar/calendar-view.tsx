"use client";

import { useState, useEffect } from "react";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import { YearView } from "./year-view";
import { useEvents } from "@/hooks/use-events";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { CreateEventDialog } from "./create-event-dialog";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { VIEW_OPTIONS } from "@/lib/constants";
import { useSupabase } from "@/components/providers/supabase-provider";

export type CalendarViewType = "day" | "week" | "month" | "year";

interface CalendarViewProps {
  view: CalendarViewType;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarViewType) => void;
  visibleCalendarIds: string[];
  onSidebarOpenChange?: (open: boolean) => void;
  isCreateEventOpen?: boolean;
  onCreateEventOpenChange?: (open: boolean) => void;
}

const CalendarView = ({
  view,
  selectedDate,
  onDateChange,
  onViewChange,
  visibleCalendarIds,
  onSidebarOpenChange,
  isCreateEventOpen = false,
  onCreateEventOpenChange,
}: CalendarViewProps) => {
  const [_isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedEventDate, setSelectedEventDate] = useState<Date>(new Date());
  const { events, isLoading, createEvent, refetch } =
    useEvents(visibleCalendarIds);
  const { supabase } = useSupabase();

  // Subscribe til events ændringer
  useEffect(() => {
    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        () => {
          // Genindlæs events når der sker ændringer
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refetch]);

  const handleDateChange = (
    date: Date,
    options?: { shouldOpenCreateEvent?: boolean; shouldChangeView?: boolean }
  ) => {
    onDateChange(date);

    // Hvis vi skal skifte view
    if (options?.shouldChangeView) {
      onViewChange("month");
    }

    // Hvis vi skal åbne opret begivenhed dialog
    if (options?.shouldOpenCreateEvent) {
      setSelectedEventDate(date);
      onCreateEventOpenChange?.(true);
    }
  };

  const ViewComponent = {
    day: DayView,
    week: WeekView,
    month: MonthView,
    year: YearView,
  }[view];

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    switch (view) {
      case "day":
        newDate.setDate(newDate.getDate() - 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "year":
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    switch (view) {
      case "day":
        newDate.setDate(newDate.getDate() + 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "year":
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    onDateChange(newDate);
  };

  const getDateDisplay = () => {
    switch (view) {
      case "day":
        return format(selectedDate, "d. MMMM yyyy", { locale: da });
      case "week":
        return `Uge ${format(selectedDate, "w, yyyy", { locale: da })}`;
      case "month":
        return format(selectedDate, "MMMM yyyy", { locale: da });
      case "year":
        return format(selectedDate, "yyyy", { locale: da });
    }
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const goToPreviousDate = () => {
    const newDate = new Date(selectedDate);
    switch (view) {
      case "day":
        newDate.setDate(newDate.getDate() - 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "year":
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    onDateChange(newDate);
  };

  const goToNextDate = () => {
    const newDate = new Date(selectedDate);
    switch (view) {
      case "day":
        newDate.setDate(newDate.getDate() + 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "year":
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    onDateChange(newDate);
  };

  const formatDateRange = () => {
    const formatter = new Intl.DateTimeFormat("da-DK", {
      month: "long",
      year: "numeric",
      day: "numeric",
    });

    switch (view) {
      case "day":
        return formatter.format(selectedDate);
      case "week": {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.getDate()}. - ${formatter.format(weekEnd)}`;
      }
      case "month":
        return new Intl.DateTimeFormat("da-DK", {
          month: "long",
          year: "numeric",
        }).format(selectedDate);
      case "year":
        return selectedDate.getFullYear().toString();
    }
  };

  // Keyboard shortcuts
  useHotkeys("t", () => {
    goToToday();
    toast.success("Gik til i dag");
  });

  useHotkeys("left", () => {
    goToPreviousDate();
  });

  useHotkeys("right", () => {
    goToNextDate();
  });

  useHotkeys("n", () => {
    setSelectedEventDate(selectedDate);
    setIsCreateEventOpen(true);
    toast.success("Opret ny begivenhed");
  });

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full">
      {/* Navigation */}
      <div className="flex items-center justify-between gap-2 p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Desktop navigation */}
        <div className="hidden sm:flex items-center gap-4">
          <Button
            variant="outline"
            onClick={goToToday}
            className="h-9 px-4 hover:bg-secondary/80 transition-all active:scale-95"
            title="Gå til i dag (T)"
          >
            I dag
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousDate}
              className="h-9 w-9 hover:bg-secondary/80 transition-all active:scale-95"
              title="Forrige (←)"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextDate}
              className="h-9 w-9 hover:bg-secondary/80 transition-all active:scale-95"
              title="Næste (→)"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobil navigation */}
        <div className="sm:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousDate}
            className="h-9 w-9 bg-secondary/40 hover:bg-secondary rounded-xl"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Visningsvalg */}
        <div className="flex-1 flex justify-center sm:justify-end">
          {Object.entries(VIEW_OPTIONS).map(([key, label]) => (
            <Button
              key={key}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(key as CalendarViewType)}
              className={cn(
                "h-9 px-3 text-sm transition-colors",
                "sm:rounded-lg sm:hover:bg-secondary/80",
                "rounded-none border-b-2 sm:border-none",
                view === key
                  ? "border-primary text-primary font-medium sm:bg-secondary"
                  : "border-transparent"
              )}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Mobil navigation (højre) */}
        <div className="sm:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextDate}
            className="h-9 w-9 bg-secondary/40 hover:bg-secondary rounded-xl"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view + selectedDate.toISOString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.2,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="flex-1 overflow-auto relative"
        >
          <div className="min-w-full h-full">
            <ViewComponent
              date={selectedDate}
              onDateChange={handleDateChange}
              events={events}
              isLoading={isLoading}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      <CreateEventDialog
        isOpen={
          onCreateEventOpenChange ? isCreateEventOpen : _isCreateEventOpen
        }
        onOpenChange={onCreateEventOpenChange ?? setIsCreateEventOpen}
        defaultDate={selectedEventDate}
        visibleCalendarIds={visibleCalendarIds}
        createEvent={createEvent}
      />
    </div>
  );
};

export default CalendarView;
