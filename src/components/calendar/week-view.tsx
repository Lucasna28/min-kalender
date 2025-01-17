"use client";

import { useState, useEffect, useRef } from "react";
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
  const [days, setDays] = useState<Date[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [currentTimeIndicatorTop, setCurrentTimeIndicatorTop] = useState(0);
  const [danishHolidays, setDanishHolidays] = useState<DanishHoliday[]>([]);
  const [mounted, setMounted] = useState(false);
  const timeGridRef = useRef<HTMLDivElement>(null);

  // Marker at komponenten er mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generer dage kun når komponenten er mounted
  useEffect(() => {
    if (mounted) {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      const daysInWeek = eachDayOfInterval({ start, end });
      setDays(daysInWeek);
    }
  }, [date, mounted]);

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

  // Render kun ugenummer når komponenten er mounted
  const weekNumber = mounted && days[0] ? getWeekNumber(days[0]) : null;

  // Generer timer (24 timer i stedet for 48 halvtimer)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

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
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header med ugedage og heldagsbegivenheder */}
      <div className="sticky top-0 z-10 flex-none bg-background border-b border-border">
        <div className="grid grid-cols-8">
          <div className="flex items-center justify-center font-medium text-muted-foreground p-2 border-r border-border">
            {weekNumber ? `Uge ${weekNumber}` : ""}
          </div>
          <div className="col-span-7 grid grid-cols-7 text-sm leading-6 text-muted-foreground">
            {days.map((day, i) => (
              <div key={i} className="flex flex-col border-r border-border">
                {/* Dato header */}
                <div className="p-2 text-center">
                  <span className="text-sm">
                    {format(day, "EEE", { locale: da })}
                  </span>
                  <span className="text-sm ml-1">
                    {format(day, "d", { locale: da })}
                  </span>
                </div>

                {/* Heldagsbegivenheder */}
                <div className="min-h-[60px] p-1 space-y-1 border-t border-border">
                  {getAllDayEvents(day).map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      className="text-xs p-1 rounded-sm shadow-sm"
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
        className="flex-1 grid grid-cols-8 overflow-y-auto relative bg-background/95 scroll-smooth"
        ref={timeGridRef}
      >
        {/* Tidslinje */}
        <div className="border-r border-border/50 bg-muted/30 sticky left-0">
          {timeSlots.map((hour) => (
            <div
              key={hour}
              className="h-20 relative flex items-center justify-end pr-2 border-t border-border/40"
            >
              <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                {format(
                  setMinutes(
                    setHours(new Date(), Math.floor(hour)),
                    (hour % 1) * 60
                  ),
                  "HH:mm"
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Dage med events */}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "relative border-r border-border/50 transition-colors duration-200",
              isToday(day) && "bg-primary/5",
              "hover:bg-muted/20"
            )}
          >
            {/* Tidsgrid baggrund */}
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className={cn(
                  "h-20 border-t border-border/40 relative group transition-colors duration-200",
                  "hover:bg-muted/50"
                )}
                onClick={() => {
                  const selectedDate = setMinutes(
                    setHours(day, Math.floor(hour)),
                    (hour % 1) * 60
                  );
                  onDateChange(selectedDate, { shouldOpenCreateEvent: true });
                }}
              >
                {/* Hover effekt med klokkeslæt */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute right-1 top-1 bg-background/95 px-1.5 py-0.5 rounded text-xs text-muted-foreground shadow-sm">
                    {format(
                      setMinutes(
                        setHours(day, Math.floor(hour)),
                        (hour % 1) * 60
                      ),
                      "HH:mm"
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Events for denne dag */}
            {getEventsForDay(day).map((event) => {
              // Konverter start og slut tid til minutter
              const [startHour, startMinute] = (event.start_time || "00:00")
                .split(":")
                .map(Number);
              const [endHour, endMinute] = (event.end_time || "23:59")
                .split(":")
                .map(Number);

              // Beregn total minutter siden midnat
              const startMinutes = startHour * 60 + startMinute;
              const endMinutes = endHour * 60 + endMinute;

              // Beregn position og højde
              // Hver halv time er 40px (h-10), så en hel time er 80px
              const pixelsPerMinute = 80 / 60; // 80px per time / 60 minutter = 1.333... px per minut
              const top = startMinutes * pixelsPerMinute;
              const height = (endMinutes - startMinutes) * pixelsPerMinute;

              return (
                <EventItem
                  key={event.id}
                  event={event}
                  className="absolute left-1 right-1 z-10 rounded-md shadow-sm"
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

            {/* Current time indicator */}
            {isToday(day) && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="absolute left-0 right-0 z-50"
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
