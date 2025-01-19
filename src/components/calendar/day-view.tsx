"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import {
  format,
  setHours,
  setMinutes,
  isToday,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isSameDay,
} from "date-fns";
import { da } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/hooks/use-events";
import { ViewEventDialog } from "./view-event-dialog";
import { EventItem } from "./event-item";
import { motion, AnimatePresence } from "framer-motion";
import { getDanishHolidays, DanishHoliday } from "@/lib/danish-holidays";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  isLoading: boolean;
  onDateChange: (
    date: Date,
    options?: { shouldOpenCreateEvent: boolean }
  ) => void;
  showHolidays: boolean;
}

export function DayView({
  date,
  events,
  isLoading,
  onDateChange,
  showHolidays,
}: DayViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [currentTimeIndicatorTop, setCurrentTimeIndicatorTop] = useState(0);
  const timeGridRef = useRef<HTMLDivElement>(null);

  // Opdater current time indicator position
  useEffect(() => {
    const updateCurrentTimeIndicator = () => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const percentage = (minutes / (24 * 60)) * 100;
      setCurrentTimeIndicatorTop(percentage);
    };

    updateCurrentTimeIndicator();
    const interval = setInterval(updateCurrentTimeIndicator, 60000);
    return () => clearInterval(interval);
  }, []);

  // Scroll til nuværende tid
  useEffect(() => {
    const scrollToCurrentTime = () => {
      if (!timeGridRef.current) return;

      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const percentage = (minutes / (24 * 60)) * 100;
      const scrollPosition =
        (timeGridRef.current.scrollHeight * percentage) / 100;
      timeGridRef.current.scrollTo({
        top: scrollPosition - timeGridRef.current.clientHeight / 2,
        behavior: "smooth",
      });
    };

    scrollToCurrentTime();
  }, []);

  // Generer timer (24 timer i stedet for 48 halvtimer)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // Få events for denne dag
  const getEventsForDay = () => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_date);
      return isSameDay(date, eventDate);
    });
  };

  // Få heldagsbegivenheder
  const getAllDayEvents = () => {
    const regularEvents = events.filter((event) => {
      if (!event.is_all_day) return false;
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      return isWithinInterval(date, {
        start: startOfDay(eventStart),
        end: endOfDay(eventEnd),
      });
    });

    // Find danske helligdage for denne dag
    const holidays = showHolidays
      ? getDanishHolidays(date.getFullYear())
          .filter((holiday) => isSameDay(holiday.date, date))
          .map(
            (holiday) =>
              ({
                id: `holiday-${holiday.date.getTime()}`,
                title: holiday.title,
                start_date: holiday.date,
                end_date: holiday.date,
                is_all_day: true,
                color: holiday.color,
                calendar_id: "danish-holidays",
                user_id: "system",
                created_at: new Date(),
                category: "helligdag",
              } as CalendarEvent)
          )
      : [];

    return [...holidays, ...regularEvents];
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background print:bg-white">
      {/* Header med heldagsbegivenheder */}
      <div className="sticky top-0 z-10 flex-none bg-background border-b border-border print:border-gray-200">
        <div className="grid grid-cols-1">
          <div className="flex flex-col border-r border-border print:border-gray-200">
            {/* Dato header */}
            <div className="p-2 text-center border-b border-border print:border-gray-200">
              <span className="text-sm print:text-base print:font-medium">
                {format(date, "EEEE", { locale: da })}
              </span>
              <span className="text-sm print:text-base print:font-medium ml-1">
                {format(date, "d. MMMM", { locale: da })}
              </span>
            </div>

            {/* Heldagsbegivenheder */}
            <div className="min-h-[60px] p-1 space-y-1">
              {getAllDayEvents().map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  className="text-xs p-1 rounded-sm shadow-sm print:text-sm print:p-1.5 print:rounded-md print:border print:shadow-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tidsgrid */}
      <div
        className="flex-1 grid grid-cols-1 overflow-y-auto relative bg-background/95 scroll-smooth"
        ref={timeGridRef}
      >
        {/* Tidslinje */}
        <div className="border-r border-border/50">
          {timeSlots.map((hour) => (
            <div
              key={hour}
              className="h-20 relative flex items-center border-t border-border/40"
              onClick={() => {
                const selectedDate = setMinutes(setHours(date, hour), 0);
                onDateChange(selectedDate, { shouldOpenCreateEvent: true });
              }}
            >
              <span className="absolute left-2 text-xs text-muted-foreground font-medium">
                {format(setHours(new Date(), hour), "HH:mm")}
              </span>

              {/* Events for denne time */}
              {getEventsForDay()
                .filter((event) => {
                  if (event.is_all_day) return false;

                  const [startHour, startMinute] = (event.start_time || "00:00")
                    .split(":")
                    .map(Number);
                  const [endHour, endMinute] = (event.end_time || "23:59")
                    .split(":")
                    .map(Number);

                  const eventStartMinutes = startHour * 60 + startMinute;
                  const eventEndMinutes = endHour * 60 + endMinute;
                  const slotStartMinutes = hour * 60;
                  const slotEndMinutes = (hour + 1) * 60;

                  return (
                    eventStartMinutes < slotEndMinutes &&
                    eventEndMinutes > slotStartMinutes
                  );
                })
                .map((event) => {
                  const [startHour, startMinute] = (event.start_time || "00:00")
                    .split(":")
                    .map(Number);
                  const [endHour, endMinute] = (event.end_time || "23:59")
                    .split(":")
                    .map(Number);

                  const startMinutes = startHour * 60 + startMinute;
                  const endMinutes = endHour * 60 + endMinute;

                  const pixelsPerMinute = 80 / 60; // 80px per time / 60 minutter
                  const top = (startMinutes - hour * 60) * pixelsPerMinute;
                  const height = (endMinutes - startMinutes) * pixelsPerMinute;

                  return (
                    <EventItem
                      key={event.id}
                      event={event}
                      className="absolute left-8 right-1 rounded-md shadow-sm z-10"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        minHeight: "20px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    />
                  );
                })}
            </div>
          ))}

          {/* Current time indicator */}
          {isToday(date) && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="absolute left-0 right-0 z-50 print:hidden"
              style={{ top: `${currentTimeIndicatorTop}%` }}
            >
              <div className="relative">
                <div className="absolute -left-1 -top-1 w-3 h-3 rounded-full bg-red-500 shadow-lg animate-pulse" />
                <div className="h-[2px] w-full bg-red-500 shadow-sm" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

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
