"use client";

import { useState, useEffect, forwardRef } from "react";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import { YearView } from "./year-view";
import { useEvents } from "@/hooks/use-events";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CreateEventDialog } from "./create-event-dialog";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { VIEW_OPTIONS } from "@/lib/constants";
import { useSupabase } from "@/components/providers/supabase-provider";
import "@/styles/print.css";

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
  showHolidays: boolean;
}

const CalendarView = forwardRef<HTMLDivElement, CalendarViewProps>(
  (
    {
      view,
      selectedDate,
      onDateChange,
      onViewChange,
      visibleCalendarIds,
      isCreateEventOpen = false,
      onCreateEventOpenChange,
      showHolidays,
    },
    ref
  ) => {
    const [_isCreateEventOpen, setIsCreateEventOpen] = useState(false);
    const [selectedEventDate, setSelectedEventDate] = useState<Date>(
      new Date()
    );
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

    // Render den aktuelle view komponent
    const CurrentView =
      view === "day"
        ? DayView
        : view === "week"
        ? WeekView
        : view === "month"
        ? MonthView
        : YearView;

    return (
      <div ref={ref} className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousDate}
              className="print:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextDate}
              className="print:hidden"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">{formatDateRange()}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="print:hidden"
            >
              I dag
            </Button>
            <div className="flex items-center rounded-md border p-1 print:hidden">
              {Object.entries(VIEW_OPTIONS).map(([value, label]) => (
                <Button
                  key={value}
                  variant={view === value ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(value as CalendarViewType)}
                  className={cn(
                    "text-sm",
                    view === value && "bg-muted text-muted-foreground"
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <CurrentView
            date={selectedDate}
            events={events}
            isLoading={isLoading}
            onDateChange={handleDateChange}
            showHolidays={showHolidays}
          />
        </div>

        <CreateEventDialog
          isOpen={isCreateEventOpen || _isCreateEventOpen}
          onOpenChange={(open) => {
            setIsCreateEventOpen(open);
            onCreateEventOpenChange?.(open);
          }}
          defaultDate={selectedEventDate}
          visibleCalendarIds={visibleCalendarIds}
          createEvent={createEvent}
        />
      </div>
    );
  }
);

CalendarView.displayName = "CalendarView";

export default CalendarView;
