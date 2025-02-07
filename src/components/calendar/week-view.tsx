"use client";

import { useState, useEffect, useRef } from "react";
import {
  format,
  startOfWeek,
  isToday,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isSameDay,
  addDays,
  isAfter,
  isBefore,
  subDays,
} from "date-fns";
import { da } from "date-fns/locale";
import type { CalendarEvent } from "@/hooks/use-events";
import { ViewEventDialog } from "./view-event-dialog";
import { EventItem } from "./event-item";
import { motion, AnimatePresence } from "framer-motion";
import { getDanishHolidays, DanishHoliday } from "@/lib/danish-holidays";
import { getWeekNumber } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  isLoading: boolean;
  onDateChange: (date: Date) => void;
}

export function WeekView({ date, events, onDateChange }: WeekViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [danishHolidays, setDanishHolidays] = useState<DanishHoliday[]>([]);
  const [mounted, setMounted] = useState(false);
  const timeGridRef = useRef<HTMLDivElement>(null);

  // Beregn ugenummer og dage i ugen
  const weekNumber = getWeekNumber(date);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Beregn tidspunkter og current time indicator
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [currentTimeIndicatorTop, setCurrentTimeIndicatorTop] = useState(0);

  // Opdater current time indicator position kun på client side
  useEffect(() => {
    if (!mounted) return;

    const updateCurrentTimeIndicator = () => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const percentage = (minutes / (24 * 60)) * 100;
      setCurrentTimeIndicatorTop(percentage);
    };

    updateCurrentTimeIndicator();
    const interval = setInterval(updateCurrentTimeIndicator, 60000);
    return () => clearInterval(interval);
  }, [mounted]);

  // Marker at komponenten er mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll til 12:00 som standard, eller til nuværende tid hvis det er i dag
  useEffect(() => {
    if (!mounted || !timeGridRef.current) return;

    // Scroll til 12:00 som standard, eller til nuværende tid hvis det er i dag
    const scrollToTime = () => {
      const now = new Date();
      let scrollHour = 12; // Standard scroll til 12:00

      // Hvis det er i dag og tiden er mellem 8:00 og 20:00, scroll til nuværende tid
      if (isToday(date) && now.getHours() >= 8 && now.getHours() <= 20) {
        scrollHour = now.getHours();
      }

      const percentage = (scrollHour / 24) * 100;
      const scrollPosition =
        (timeGridRef.current!.scrollHeight * percentage) / 100;

      timeGridRef.current!.scrollTo({
        top: scrollPosition - timeGridRef.current!.clientHeight / 2,
        behavior: "smooth",
      });
    };

    scrollToTime();
  }, [mounted, date]);

  // Hent danske helligdage når året ændrer sig
  useEffect(() => {
    const year = date.getFullYear();
    const holidays = getDanishHolidays(year);
    setDanishHolidays(holidays);
  }, [date]);

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      if (event.is_all_day) return false; // Ignorer heldagsbegivenheder
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);

      return (
        (isSameDay(eventStart, day) || isAfter(day, eventStart)) &&
        (isSameDay(eventEnd, day) || isBefore(day, eventEnd))
      );
    });
  };

  const getAllDayEvents = (day: Date) => {
    const regularEvents = events.filter((event) => {
      if (!event.is_all_day) return false;
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      return isWithinInterval(day, {
        start: startOfDay(eventStart),
        end: endOfDay(eventEnd),
      });
    });

    // Find danske helligdage for denne dag
    const holidays = danishHolidays
      .filter((holiday) => isSameDay(holiday.date, day))
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
            category: "andet",
          } as CalendarEvent)
      );

    return [...holidays, ...regularEvents];
  };

  return (
    <div className="flex flex-col h-full bg-background print:bg-white">
      {/* Touch-venlig uge navigation */}
      <motion.div
        className="sticky top-0 z-10 bg-background border-b border-border"
        whileTap={{ scale: 0.98 }}
      >
        <div className="p-4 flex justify-between items-center">
          <button
            onClick={() => onDateChange(subDays(date, 7))}
            className="p-2 hover:bg-accent rounded-full touch-manipulation"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(weekDays[0], "d. MMM", { locale: da })} -{" "}
            {format(weekDays[6], "d. MMM", { locale: da })}
          </h2>
          <button
            onClick={() => onDateChange(addDays(date, 7))}
            className="p-2 hover:bg-accent rounded-full touch-manipulation"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Ugedage header - mere touch-venlig */}
        <div className="grid grid-cols-7 text-sm font-medium text-muted-foreground">
          {weekDays.map((day) => (
            <motion.button
              key={day.toISOString()}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateChange(day)}
              className={cn(
                "p-2 flex flex-col items-center touch-manipulation",
                isSameDay(day, new Date()) && "text-primary font-bold"
              )}
            >
              <span className="text-xs">
                {format(day, "EEE", { locale: da })}
              </span>
              <span className="text-base">{format(day, "d")}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Forbedret touch-venlig tidsgrid */}
      <div
        ref={timeGridRef}
        className="flex-1 grid grid-cols-8 overflow-y-auto relative bg-background/95 scroll-smooth touch-pan-y overscroll-none"
      >
        {/* Tidslinje */}
        <div className="border-r border-border print:hidden">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-20 border-b border-border relative group"
            >
              <div className="absolute -top-3 right-2 text-sm text-muted-foreground flex items-center gap-1">
                <span>{format(new Date().setHours(hour, 0), "HH:mm")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dage med events */}
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "relative border-r border-border print:border-gray-200",
              isSameDay(day, new Date()) && "bg-primary/5"
            )}
            onClick={() => onDateChange(day)}
          >
            {/* Timegrid */}
            {hours.map((hour) => (
              <div
                key={hour}
                className={cn(
                  "h-20 border-b border-border print:border-gray-200 relative group print:h-28",
                  isToday(day) &&
                    hour === new Date().getHours() &&
                    "bg-primary/5"
                )}
              >
                {/* Vis nuværende tid som baggrund på den aktuelle time */}
                {isToday(day) && hour === new Date().getHours() && (
                  <div className="absolute inset-0 flex items-center justify-end pr-2">
                    <span className="text-sm font-medium text-primary">
                      {format(new Date(), "HH:mm")}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Events - kun ikke-heldagsbegivenheder */}
            {getEventsForDay(day).map((event) => {
              const [startHour, startMinute] = (event.start_time || "00:00")
                .split(":")
                .map(Number);
              const [endHour, endMinute] = (event.end_time || "23:59")
                .split(":")
                .map(Number);

              const startMinutes = startHour * 60 + startMinute;
              const endMinutes = endHour * 60 + endMinute;

              const pixelsPerMinute = 112 / 60; // Justeret for print højde (28rem * 4)
              const top = startMinutes * pixelsPerMinute;
              const height = (endMinutes - startMinutes) * pixelsPerMinute;

              return (
                <EventItem
                  key={event.id}
                  event={event}
                  className="absolute left-1 right-1 z-10 rounded-md shadow-sm print:left-3 print:right-3 print:text-base print:font-medium print:p-2"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    minHeight: "24px",
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
