"use client";

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
  isAfter,
  isBefore,
} from "date-fns";
import { da } from "date-fns/locale";
import type { CalendarEvent } from "@/hooks/use-events";
import { ViewEventDialog } from "./view-event-dialog";
import { EventItem } from "./event-item";
import { motion, AnimatePresence } from "framer-motion";
import { getDanishHolidays } from "@/lib/danish-holidays";
import { cn } from "@/lib/utils";

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

  // Scroll til 12:00 som standard, eller til nuværende tid hvis det er i dag
  useEffect(() => {
    if (!timeGridRef.current) return;

    const scrollToTime = () => {
      const now = new Date();
      let scrollHour = 12; // Standard scroll til 12:00

      // Hvis det er i dag og tiden er mellem 8:00 og 20:00, scroll til nuværende tid
      if (isToday(date) && now.getHours() >= 8 && now.getHours() <= 20) {
        scrollHour = now.getHours();
      }

      const percentage = (scrollHour / 24) * 100;
      const scrollPosition =
        (timeGridRef.current.scrollHeight * percentage) / 100;

      timeGridRef.current.scrollTo({
        top: scrollPosition - timeGridRef.current.clientHeight / 2,
        behavior: "smooth",
      });
    };

    scrollToTime();
  }, [date]);

  // Generer timer (24 timer)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Få events for denne dag
  const getEventsForDay = () => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);

      // Tjek om dagen er mellem start og slut (inklusiv)
      return (
        (isSameDay(eventStart, date) || isAfter(date, eventStart)) &&
        (isSameDay(eventEnd, date) || isBefore(date, eventEnd))
      );
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
        className="flex-1 grid grid-cols-[80px_1fr] overflow-y-auto relative bg-background/95 scroll-smooth"
        ref={timeGridRef}
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

        {/* Events grid */}
        <div className="relative">
          {hours.map((hour) => (
            <div
              key={hour}
              className={cn(
                "h-20 border-b border-border relative group",
                isToday(date) &&
                  hour === new Date().getHours() &&
                  "bg-primary/5"
              )}
              onClick={() => {
                const selectedDate = setMinutes(setHours(date, hour), 0);
                onDateChange(selectedDate, { shouldOpenCreateEvent: true });
              }}
            >
              {/* Vis nuværende tid som baggrund på den aktuelle time */}
              {isToday(date) && hour === new Date().getHours() && (
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <span className="text-sm font-medium text-primary">
                    {format(new Date(), "HH:mm")}
                  </span>
                </div>
              )}

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

                  const pixelsPerMinute = 80 / 60;
                  const top = (startMinutes - hour * 60) * pixelsPerMinute;
                  const height = (endMinutes - startMinutes) * pixelsPerMinute;

                  return (
                    <EventItem
                      key={event.id}
                      event={event}
                      className="absolute left-2 right-2 rounded-md shadow-sm z-10"
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
