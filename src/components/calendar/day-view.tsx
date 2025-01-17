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
}

// Funktion til at få ugenummer
const getWeekNumber = (date: Date) => {
  if (!date) return 1;
  const target = new Date(date.valueOf());
  // Juster for mandag som første dag i ugen
  const dayNr = (date.getDay() + 6) % 7; // Konverter til mandag-baseret (0 = mandag, 6 = søndag)
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
};

export function DayView({
  date,
  events,
  isLoading,
  onDateChange,
}: DayViewProps) {
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
  const weekNumber = mounted ? getWeekNumber(date) : null;

  // Generer timer (24 timer i stedet for 48 halvtimer)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // Hent danske helligdage når året ændrer sig
  useEffect(() => {
    const year = date.getFullYear();
    const holidays = getDanishHolidays(year);
    setDanishHolidays(holidays);
  }, [date]);

  const getEventsForDay = () => {
    const dayEvents = events.filter((event) => {
      if (event.is_all_day) return false;
      const eventDate = new Date(event.start_date);
      return isSameDay(date, eventDate);
    });

    // Sorter events efter starttidspunkt
    dayEvents.sort((a, b) => {
      const aStart = a.start_time || "00:00";
      const bStart = b.start_time || "00:00";
      return aStart.localeCompare(bStart);
    });

    // Find overlappende events og tildel position
    const processedEvents = dayEvents.map((event) => {
      const [startHour, startMinute] = (event.start_time || "00:00")
        .split(":")
        .map(Number);
      const [endHour, endMinute] = (event.end_time || "23:59")
        .split(":")
        .map(Number);

      return {
        ...event,
        startMinutes: startHour * 60 + startMinute,
        endMinutes: endHour * 60 + endMinute,
        column: 0,
        columnSpan: 1,
      };
    });

    // Find overlappende grupper
    let currentGroup: typeof processedEvents = [];
    const groups: (typeof processedEvents)[] = [];

    processedEvents.forEach((event) => {
      if (currentGroup.length === 0) {
        currentGroup.push(event);
        return;
      }

      const lastEvent = currentGroup[currentGroup.length - 1];
      if (event.startMinutes < lastEvent.endMinutes) {
        currentGroup.push(event);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [event];
      }
    });
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    // Tildel kolonner til hver gruppe
    groups.forEach((group) => {
      const columns: number[] = [];
      group.forEach((event) => {
        let column = 0;
        while (columns[column] && columns[column] > event.startMinutes) {
          column++;
        }
        event.column = column;
        columns[column] = event.endMinutes;
        event.columnSpan = Math.max(...group.map((e) => e.column)) + 1;
      });
    });

    return processedEvents;
  };

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
    const holidays = danishHolidays
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
            category: "andet",
          } as CalendarEvent)
      );

    return [...holidays, ...regularEvents];
  };

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

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="sticky top-0 z-10 flex-none bg-background border-b border-border">
        <div className="grid grid-cols-[auto_1fr]">
          <div className="flex items-center justify-center font-medium text-muted-foreground p-2 border-r border-border">
            {weekNumber ? `Uge ${weekNumber}` : ""}
          </div>
          <div className="flex flex-col border-r border-border">
            <div className="p-2 flex items-center justify-between border-b border-border">
              <span className="text-sm font-medium">
                {format(date, "EEEE d. MMMM", { locale: da })}
              </span>
              {isToday(date) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={scrollToCurrentTime}
                >
                  Scroll til nu
                </Button>
              )}
            </div>

            {/* Heldagsbegivenheder */}
            {isLoading ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <div className="min-h-[60px] p-1 space-y-1">
                {getAllDayEvents().length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    Ingen heldagsbegivenheder
                  </div>
                ) : (
                  getAllDayEvents().map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      className="text-xs p-1 rounded-sm shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tidsgrid */}
      <div
        className="flex-1 grid grid-cols-[auto_1fr] overflow-y-auto relative bg-background/95 scroll-smooth"
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
                {format(setHours(new Date(), hour), "HH:mm")}
              </span>
            </div>
          ))}
        </div>

        {/* Dag med events */}
        <div
          className={cn(
            "relative border-r border-border/50 transition-colors duration-200",
            isToday(date) && "bg-primary/5",
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
                const selectedDate = setHours(date, hour);
                onDateChange(selectedDate, { shouldOpenCreateEvent: true });
              }}
            >
              {/* Hover effekt med klokkeslæt */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute right-1 top-1 bg-background/95 px-1.5 py-0.5 rounded text-xs text-muted-foreground shadow-sm">
                  {format(setHours(date, hour), "HH:mm")}
                </div>
              </div>
            </div>
          ))}

          {/* Events for denne dag */}
          {getEventsForDay().map((event) => {
            const startMinutes = event.startMinutes;
            const endMinutes = event.endMinutes;
            const pixelsPerMinute = 80 / 60;
            const top = startMinutes * pixelsPerMinute;
            const height = (endMinutes - startMinutes) * pixelsPerMinute;
            const width = 100 / event.columnSpan;
            const left = width * event.column;

            return (
              <TooltipProvider key={event.id}>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div>
                      <EventItem
                        event={event}
                        className="absolute z-10 rounded-md shadow-sm cursor-pointer"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          minHeight: "20px",
                          left: `${left + 1}%`,
                          right: `${100 - (left + width) + 1}%`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[300px]">
                    <div className="space-y-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.start_time} - {event.end_time}
                      </p>
                      {event.description && (
                        <p className="text-sm">{event.description}</p>
                      )}
                      {event.location && (
                        <p className="text-sm text-muted-foreground">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}

          {/* Current time indicator */}
          {isToday(date) && (
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
