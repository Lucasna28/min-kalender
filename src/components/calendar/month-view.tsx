"use client";

import { useState, useEffect, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  subDays,
  addDays,
  getDay,
  isAfter,
  isBefore,
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
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo } from "react";

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  isLoading?: boolean;
  onDateChange: (
    date: Date,
    options?: { shouldOpenCreateEvent?: boolean; shouldChangeView?: boolean }
  ) => void;
  showHolidays: boolean;
}

// Funktion til at få ugenummer
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

// Memoized event component
interface MemoizedEventItemProps {
  event: CalendarEvent;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const MemoizedEventItem = memo(
  ({ event, className, onClick }: MemoizedEventItemProps) => {
    return <EventItem event={event} className={className} onClick={onClick} />;
  }
);

MemoizedEventItem.displayName = "MemoizedEventItem";

// Memoized day cell component
const DayCell = memo(
  ({
    day,
    dayEvents,
    isToday,
    isSelected,
    isOutsideMonth,
    onDateClick,
  }: {
    day: Date;
    dayEvents: CalendarEvent[];
    isToday: boolean;
    isSelected: boolean;
    isOutsideMonth: boolean;
    onDateClick: (date: Date) => void;
  }) => {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
      count: dayEvents.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 24, // Estimeret højde for hver event
      overscan: 3,
    });

    return (
      <div
        className={cn(
          "min-h-[6rem] p-2 relative",
          isToday && "bg-accent/50",
          isSelected && "ring-2 ring-primary",
          isOutsideMonth && "opacity-50"
        )}
        onClick={() => onDateClick(day)}
      >
        <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d.")}</time>

        <div
          ref={parentRef}
          className="overflow-y-auto max-h-[120px] space-y-1 mt-1"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <MemoizedEventItem event={dayEvents[virtualRow.index]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

DayCell.displayName = "DayCell";

export function MonthView({
  date,
  events,
  isLoading,
  onDateChange,
  showHolidays,
}: MonthViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [danishHolidays, setDanishHolidays] = useState<DanishHoliday[]>([]);
  const [mounted, setMounted] = useState(false);

  // Marker at komponenten er mounted og hent helligdage
  useEffect(() => {
    setMounted(true);
    const year = date.getFullYear();
    const holidays = getDanishHolidays(year);
    setDanishHolidays(holidays);
  }, []);

  // Opdater helligdage når året ændrer sig
  useEffect(() => {
    if (mounted) {
      const year = date.getFullYear();
      const holidays = getDanishHolidays(year);
      setDanishHolidays(holidays);
    }
  }, [date, mounted]);

  // Hvis ikke mounted, vis loading state
  if (!mounted) {
    return (
      <div className="flex flex-col h-full bg-background animate-pulse">
        <div className="grid grid-cols-7 gap-1 p-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Hjælpefunktion til at hente events for en given dag
  const getEventsForDay = (day: Date): CalendarEvent[] => {
    const regularEvents = events.filter((event) => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);

      // Tjek om dagen er mellem start og slut (inklusiv)
      return (
        (isSameDay(eventStart, day) || isAfter(day, eventStart)) &&
        (isSameDay(eventEnd, day) || isBefore(day, eventEnd))
      );
    });

    // Find danske helligdage for denne dag, men kun hvis showHolidays er true
    const holidays = showHolidays
      ? danishHolidays
          .filter((holiday) => isSameDay(holiday.date, day))
          .map((holiday) => ({
            ...holiday,
            category: "helligdag",
          }))
      : [];

    return [...regularEvents, ...holidays];
  };

  // Generer dage for måneden
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  // Find første mandag før månedens start
  const firstDayOfMonth = getDay(monthStart);
  const daysToIncludeFromPreviousMonth = (firstDayOfMonth + 6) % 7;
  const calendarStart = subDays(monthStart, daysToIncludeFromPreviousMonth);

  // Find sidste søndag i måneden
  const lastDayOfMonth = getDay(monthEnd);
  const daysToIncludeFromNextMonth = (7 - ((lastDayOfMonth + 1) % 7)) % 7;
  const calendarEnd = addDays(monthEnd, daysToIncludeFromNextMonth);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Beregn antal uger for at sikre konsistent grid
  const numberOfWeeks = Math.ceil(days.length / 7);

  return (
    <div className="flex flex-col h-full bg-background print:bg-white">
      {/* Ugedage header */}
      <div className="grid grid-cols-7 text-sm font-medium text-muted-foreground border-b border-border print:border-gray-200">
        {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center border-r border-border print:border-gray-200 print:text-gray-600 print:font-semibold print:text-base"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Kalendergrid med animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={date.toISOString()}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className="grid grid-cols-7 flex-1 print:gap-0"
          style={{
            gridTemplateRows: `repeat(${numberOfWeeks}, minmax(120px, 1fr))`,
          }}
        >
          {days.map((day, dayIdx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, date);
            const weekNumber = getWeekNumber(day);
            const isFirstInWeek = dayIdx % 7 === 0;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "border-r border-b border-border print:border-gray-200 p-1 relative transition-colors duration-200",
                  !isCurrentMonth && "bg-muted/30 print:bg-gray-50",
                  isToday(day) && "bg-primary/5 print:bg-transparent",
                  "hover:bg-accent/50 cursor-pointer group print:hover:bg-transparent"
                )}
                onClick={() =>
                  onDateChange(day, { shouldOpenCreateEvent: true })
                }
              >
                {/* Ugenummer (kun for første dag i ugen) */}
                {isFirstInWeek && (
                  <div className="absolute -left-8 top-1 text-xs text-muted-foreground print:text-gray-500 print:font-medium">
                    {weekNumber}
                  </div>
                )}

                {/* Dato */}
                <div
                  className={cn(
                    "text-sm font-medium h-6 flex items-center justify-end px-1 print:text-base print:font-semibold",
                    !isCurrentMonth &&
                      "text-muted-foreground/50 italic print:text-gray-400",
                    isToday(day) &&
                      "text-primary font-bold print:text-inherit print:font-normal"
                  )}
                >
                  {!isCurrentMonth && (
                    <span className="text-xs mr-1 text-muted-foreground/40 print:text-gray-400">
                      {format(day, "MMM", { locale: da })}
                    </span>
                  )}
                  {format(day, "d.")}
                </div>

                {/* Events */}
                {isLoading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-1 max-h-[calc(100%-1.5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30 print:max-h-none print:overflow-visible">
                    {dayEvents.map((event) => (
                      <TooltipProvider key={event.id}>
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <div>
                              <MemoizedEventItem
                                event={event}
                                className={cn(
                                  "text-xs p-1 rounded-sm shadow-sm cursor-pointer transition-all duration-200",
                                  "hover:shadow-md hover:scale-[1.02] print:hover:shadow-none print:hover:scale-100",
                                  "print:text-sm print:p-1.5 print:rounded-md print:border print:shadow-none",
                                  !isCurrentMonth && "opacity-50"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(event);
                                }}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="max-w-[300px] print:hidden"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{event.title}</p>
                              {!event.is_all_day && (
                                <p className="text-sm text-muted-foreground">
                                  {event.start_time} - {event.end_time}
                                </p>
                              )}
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
                    ))}
                  </div>
                )}

                {/* Mere indikator hvis der er flere events end der kan vises */}
                {dayEvents.length > 4 && (
                  <div className="absolute bottom-1 right-1 text-xs text-muted-foreground bg-background/80 px-1 rounded print:hidden">
                    +{dayEvents.length - 4} mere
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

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
