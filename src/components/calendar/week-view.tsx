"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  setHours,
  setMinutes,
  isToday,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isSameDay,
  addMinutes,
  addDays,
} from "date-fns";
import { da } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/hooks/use-events";
import { ViewEventDialog } from "./view-event-dialog";
import { EventItem } from "./event-item";
import { motion, AnimatePresence } from "framer-motion";
import { getDanishHolidays, DanishHoliday } from "@/lib/danish-holidays";

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  isLoading: boolean;
  onDateChange: (date: Date) => void;
}

// Funktion til at få ugenummer - flyttet udenfor komponenten
const getWeekNumber = (date: Date) => {
  if (!date) return 1;
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
};

export function WeekView({
  date,
  events,
  isLoading,
  onDateChange,
}: WeekViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [danishHolidays, setDanishHolidays] = useState<DanishHoliday[]>([]);
  const [mounted, setMounted] = useState(false);
  const timeGridRef = useRef<HTMLDivElement>(null);

  // Beregn ugenummer og dage i ugen
  const weekNumber = getWeekNumber(date);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Beregn tidspunkter og current time indicator
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
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

  // Scroll til nuværende tid kun på client side
  useEffect(() => {
    if (!mounted || !timeGridRef.current) return;

    const scrollToCurrentTime = () => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const percentage = (minutes / (24 * 60)) * 100;
      const scrollPosition =
        (timeGridRef.current!.scrollHeight * percentage) / 100;
      timeGridRef.current!.scrollTo({
        top: scrollPosition - timeGridRef.current!.clientHeight / 2,
        behavior: "smooth",
      });
    };

    scrollToCurrentTime();
  }, [mounted]);

  // Hent danske helligdage når året ændrer sig
  useEffect(() => {
    const year = date.getFullYear();
    const holidays = getDanishHolidays(year);
    setDanishHolidays(holidays);
  }, [date]);

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      if (event.is_all_day) return false;
      const eventDate = new Date(event.start_date);
      return isSameDay(day, eventDate);
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

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter((event) => {
      if (event.is_all_day) return false;

      // Konverter tidspunkter til minutter siden midnat
      const [startHour, startMinute] = (event.start_time || "00:00")
        .split(":")
        .map(Number);
      const [endHour, endMinute] = (event.end_time || "23:59")
        .split(":")
        .map(Number);
      const eventStartMinutes = startHour * 60 + startMinute;
      const eventEndMinutes = endHour * 60 + endMinute;
      const hourStartMinutes = hour * 60;
      const hourEndMinutes = (hour + 1) * 60;

      // Check om begivenheden er inden for denne time
      return (
        isSameDay(day, new Date(event.start_date)) &&
        eventStartMinutes < hourEndMinutes &&
        eventEndMinutes > hourStartMinutes
      );
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background print:bg-white print:h-auto">
      {/* Header med ugedage og heldagsbegivenheder */}
      <div className="sticky top-0 z-10 flex-none bg-background border-b border-border print:border-gray-200 print:pb-4">
        <div className="grid grid-cols-8 print:grid-cols-7">
          {/* Ugenummer */}
          <div className="w-20 border-r border-border print:hidden">
            Uge {weekNumber}
          </div>

          {/* Print header med måned og ugenummer */}
          <div className="hidden print:block print:col-span-7 print:text-center print:mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {days[0] && format(days[0], "MMMM yyyy", { locale: da })}
              <span className="text-gray-600 font-medium text-lg ml-2">
                · Uge {weekNumber}
              </span>
            </h1>
          </div>

          {/* Dage */}
          <div className="col-span-7 grid grid-cols-7 text-sm leading-6 text-muted-foreground">
            {days.map((day, i) => (
              <div
                key={i}
                className="flex flex-col border-r border-border print:border-gray-200"
              >
                {/* Dato header */}
                <div className="p-2 text-center border-b border-border print:border-gray-200 print:py-3">
                  <div className="print:text-lg print:font-bold print:text-gray-900">
                    {format(day, "EEEE", { locale: da })}
                  </div>
                  <div className="print:text-base print:font-medium print:text-gray-600 print:mt-1">
                    {format(day, "d. MMM", { locale: da })}
                  </div>
                </div>

                {/* Heldagsbegivenheder */}
                <div className="min-h-[60px] p-1 space-y-1 print:min-h-[100px] print:p-3 print:space-y-2">
                  {getAllDayEvents(day).map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      className="text-xs p-1 rounded-sm shadow-sm print:text-sm print:p-2.5 print:rounded-md print:border print:shadow-none print:font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tidsgrid */}
      <div
        className="flex-1 grid grid-cols-8 overflow-y-auto relative bg-background/95 scroll-smooth print:overflow-visible print:h-auto print:grid-cols-7 print:bg-white"
        ref={timeGridRef}
      >
        {/* Tidslinje - skjult ved print */}
        <div className="border-r border-border print:hidden">
          {timeSlots.map((hour) => (
            <div
              key={hour}
              className="h-20 border-b border-border relative group"
            >
              <span className="absolute -top-3 right-2 text-sm text-muted-foreground">
                {hour}:00
              </span>
            </div>
          ))}
        </div>

        {/* Dage med events */}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="relative border-r border-border print:border-gray-200"
            onClick={() => onDateChange(day)}
          >
            {/* Timegrid */}
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="h-20 border-b border-border print:border-gray-200 relative group print:h-28"
              />
            ))}

            {/* Events */}
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

            {/* Current time indicator - skjult ved print */}
            {isToday(day) && (
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
