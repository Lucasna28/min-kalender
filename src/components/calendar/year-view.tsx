"use client";

import { useState } from "react";
import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  getDay,
} from "date-fns";
import { da } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/hooks/use-events";
import { ViewEventDialog } from "./view-event-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { getDanishHolidays } from "@/lib/danish-holidays";

interface YearViewProps {
  date: Date;
  events: CalendarEvent[];
  isLoading?: boolean;
  onDateChange: (
    date: Date,
    options?: { shouldOpenCreateEvent?: boolean; shouldChangeView?: boolean }
  ) => void;
}

interface EventTypeIndicator {
  type: string;
  color: string;
  count: number;
}

export function YearView({ date, events, onDateChange }: YearViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [hoveredMonth, setHoveredMonth] = useState<Date | null>(null);

  // Få alle måneder i året
  const months = eachMonthOfInterval({
    start: startOfYear(date),
    end: endOfYear(date),
  });

  // Få danske helligdage for året
  const holidays = getDanishHolidays(date.getFullYear());

  // Funktion til at få events grupperet efter type for en specifik dag
  const getEventsByType = (day: Date) => {
    const dayEvents = events.filter((event) => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      return isSameDay(day, eventStart) || isSameDay(day, eventEnd);
    });

    const dayHolidays = holidays
      .filter((holiday) => isSameDay(holiday.date, day))
      .map((holiday) => ({
        id: `holiday-${holiday.date.getTime()}`,
        title: holiday.title,
        start_date: holiday.date,
        end_date: holiday.date,
        is_all_day: true,
        color: holiday.color,
        calendar_id: "danish-holidays",
        category: "helligdag",
        user_id: "system",
        created_at: new Date(),
      })) as CalendarEvent[];

    const allEvents = [...dayHolidays, ...dayEvents];

    // Gruppér events efter type og tæl dem
    const eventTypes = allEvents.reduce((acc, event) => {
      const type = event.category || "andet";
      const color = event.color || getEventColor(type);

      if (!acc[type]) {
        acc[type] = {
          type,
          color,
          count: 0,
        };
      }
      acc[type].count++;
      return acc;
    }, {} as Record<string, EventTypeIndicator>);

    return Object.values(eventTypes);
  };

  // Hjælpefunktion til at få standardfarver for event typer
  const getEventColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case "fødselsdag":
        return "#FF4D4D"; // Rød
      case "helligdag":
        return "#FFD700"; // Guld
      case "møde":
        return "#4169E1"; // Blå
      case "ferie":
        return "#32CD32"; // Grøn
      default:
        return "#A0AEC0"; // Grå
    }
  };

  // Funktion til at håndtere klik på en måned (skifter til månedsvisning)
  const handleMonthClick = (month: Date) => {
    const selectedDate = new Date(month);
    selectedDate.setHours(12, 0, 0, 0);
    // Send signal om at vi vil skifte til månedsvisning
    onDateChange(selectedDate, { shouldChangeView: true });
  };

  // Funktion til at håndtere klik på en dag (åbner opret begivenhed)
  const handleDayClick = (day: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(day, { shouldOpenCreateEvent: true });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-background">
      {months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const daysInMonth = eachDayOfInterval({
          start: monthStart,
          end: monthEnd,
        });

        // Beregn tomme dage baseret på ugedagen for den første dag i måneden
        // getDay() returnerer 0 for søndag, 1 for mandag, osv.
        const firstDayOfMonth = getDay(monthStart);
        // Konverter til mandag-baseret uge (0 for mandag, 6 for søndag)
        const emptyDaysCount = (firstDayOfMonth + 6) % 7;
        const emptyDays = Array.from({ length: emptyDaysCount });

        return (
          <motion.div
            key={month.toISOString()}
            className={cn(
              "border rounded-lg p-2 hover:shadow-lg transition-all duration-200",
              hoveredMonth === month && "ring-2 ring-primary"
            )}
            onMouseEnter={() => setHoveredMonth(month)}
            onMouseLeave={() => setHoveredMonth(null)}
            onClick={() => handleMonthClick(month)}
            whileHover={{ scale: 1.02 }}
          >
            {/* Månedens navn */}
            <div className="text-center font-medium mb-2 text-primary">
              {format(month, "MMMM", { locale: da })}
            </div>

            {/* Ugedage */}
            <div className="grid grid-cols-7 text-[0.6rem] text-muted-foreground mb-1">
              {["M", "T", "O", "T", "F", "L", "S"].map((day) => (
                <div
                  key={day}
                  className={cn("text-center", "w-[calc((100%-1rem)/7)]")}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Dage */}
            <div className="grid grid-cols-7 gap-0.5">
              {emptyDays.map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="aspect-square w-[calc((100%-1rem)/7)]"
                />
              ))}
              {daysInMonth.map((day) => {
                const eventTypes = getEventsByType(day);
                const hasEvents = eventTypes.length > 0;

                return (
                  <motion.div
                    key={day.toISOString()}
                    className={cn(
                      "aspect-square flex items-center justify-center text-[0.6rem]",
                      "w-[calc((100%-1rem)/7)]",
                      isSameMonth(day, new Date()) &&
                        isSameDay(day, new Date()) &&
                        "bg-primary text-primary-foreground rounded-full",
                      hasEvents && "font-medium",
                      "hover:bg-accent/50 cursor-pointer"
                    )}
                    onClick={(e) => handleDayClick(day, e)}
                  >
                    {format(day, "d")}
                    {hasEvents && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-[2px]">
                        {eventTypes.map((eventType) => (
                          <div
                            key={eventType.type}
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: eventType.color }}
                            title={`${eventType.count} ${eventType.type}`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Event indikator med farveforklaring */}
            <div className="mt-2 space-y-1">
              {hoveredMonth === month && (
                <>
                  <div className="text-[0.65rem] text-muted-foreground">
                    {
                      events.filter((event) =>
                        isSameMonth(new Date(event.start_date), month)
                      ).length
                    }{" "}
                    begivenheder
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(
                      events
                        .filter((event) =>
                          isSameMonth(new Date(event.start_date), month)
                        )
                        .reduce((acc, event) => {
                          const type = event.category || "andet";
                          acc[type] = (acc[type] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center gap-1 text-[0.6rem] text-muted-foreground"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getEventColor(type) }}
                        />
                        <span>
                          {count} {type}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Event dialog */}
      <AnimatePresence>
        {selectedEvent && (
          <ViewEventDialog
            event={selectedEvent}
            isOpen={!!selectedEvent}
            onOpenChange={(open) => !open && setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
