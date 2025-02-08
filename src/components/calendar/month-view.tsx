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
import { CalendarEvent } from "@/hooks/use-events";
import { ViewEventDialog } from "./view-event-dialog";
import { EventItem } from "./event-item";
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
import { toast } from "sonner";

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
    const weekday = format(day, "EEEE", { locale: da });
    const dayNumber = getDay(day);

    const virtualizer = useVirtualizer({
      count: dayEvents.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 24,
      overscan: 3,
    });

    return (
      <div
        className={cn(
          "min-h-[6rem] p-2",
          isToday && "bg-accent/50",
          isSelected && "ring-2 ring-primary",
          isOutsideMonth && "opacity-50"
        )}
        onClick={() => onDateClick(day)}
        data-weekday={weekday}
        data-day={dayNumber}
      >
        <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d.")}</time>

        <div ref={parentRef} className=" max-h-[120px] space-y-1 mt-1">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
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
  events = [],
  isLoading,
  onDateChange,
  showHolidays,
}: MonthViewProps) {
  useEffect(() => {
    if (events.length > 0) {
    }
  }, [events]);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [danishHolidays, setDanishHolidays] = useState<DanishHoliday[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const year = date.getFullYear();
    const holidays = getDanishHolidays(year);
    setDanishHolidays(holidays);
  }, []);

  useEffect(() => {
    if (date) {
      const year = date.getFullYear();
      const holidays = getDanishHolidays(year);
      setDanishHolidays(holidays);
    }
  }, [date]);

  // Håndter redigering af event
  const handleEdit = async (event: CalendarEvent) => {
    try {
      // Tjek om det er en helligdag
      if (event.calendar_id === "danish-holidays") {
        toast.error("Du kan ikke redigere helligdage");
        return;
      }

      setSelectedEvent(null);
    } catch (error) {
      console.error("Fejl ved redigering af event:", error);
    }
  };

  // Håndter sletning af event
  const handleDelete = async (eventId: string) => {
    try {
      // Tjek om det er en helligdag
      if (selectedEvent?.calendar_id === "danish-holidays") {
        toast.error("Du kan ikke slette helligdage");
        return;
      }

      setSelectedEvent(null);
    } catch (error) {
      console.error("Fejl ved sletning af event:", error);
    }
  };

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

  const getEventsForDay = (day: Date, events: CalendarEvent[]) => {
    // Almindelige events
    const regularEvents = events.filter((event) => {
      if (!event.start_date || !event.end_date) {
        return false;
      }

      return (
        isSameDay(event.start_date, day) ||
        (isAfter(day, event.start_date) && isBefore(day, event.end_date)) ||
        isSameDay(event.end_date, day)
      );
    });

    // Helligdage
    const holidays = showHolidays
      ? danishHolidays
          .filter((holiday) => isSameDay(holiday.date, day))
          .map((holiday) => ({
            id: `holiday-${holiday.date.getTime()}-${holiday.title
              .toLowerCase()
              .replace(/\s+/g, "-")}`,
            title: holiday.title,
            start_date: holiday.date,
            end_date: holiday.date,
            is_all_day: true,
            color: "#dc2626",
            calendar_id: "danish-holidays",
            user_id: "system",
            created_at: new Date(),
            category: "helligdag",
            description: "Dansk helligdag",
          }))
      : [];

    return [...holidays, ...regularEvents];
  };

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const firstDayOfMonth = getDay(monthStart);
  const daysToIncludeFromPreviousMonth = (firstDayOfMonth + 6) % 7;
  const calendarStart = subDays(monthStart, daysToIncludeFromPreviousMonth);

  const lastDayOfMonth = getDay(monthEnd);
  const daysToIncludeFromNextMonth = (7 - ((lastDayOfMonth + 1) % 7)) % 7;
  const calendarEnd = addDays(monthEnd, daysToIncludeFromNextMonth);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const numberOfWeeks = Math.ceil(days.length / 7);

  return (
    <div className="flex flex-col h-full bg-background print:bg-white">
      {/* Ugedage header - mere kompakt på små skærme */}
      <div className="grid grid-cols-7 text-[8px] sm:text-xs font-medium text-muted-foreground border-b border-border print:border-gray-200 ">
        {["M", "Ti", "O", "To", "F", "L", "S"].map((day) => (
          <div
            key={day}
            className={cn(
              "h-6 sm:h-8 flex items-center justify-center",
              "border-r border-border print:border-gray-200",
              "print:text-gray-600 print:font-semibold print:text-base",
              // Responsiv styling
              "min-w-[40px] sm:min-w-0", // Fast minimumsbredde på mobile
              "px-0.5 sm:px-2"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Kalendergrid - optimeret for alle skærmstørrelser */}
      <div
        className="grid grid-cols-7 flex-1 print:gap-0"
        style={{
          gridTemplateRows: `repeat(${numberOfWeeks}, minmax(80px, 1fr))`,
          gridTemplateColumns: "repeat(7, minmax(40px, 1fr))", // Minimum 40px pr kolonne
        }}
      >
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day, events);
          const isCurrentMonth = isSameMonth(day, date);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "border-r border-b border-border print:border-gray-200",
                "relative transition-colors duration-200",
                // Responsiv styling
                "min-h-[80px]", // Fast minimumshøjde
                "p-0.5 sm:p-2",
                !isCurrentMonth && "bg-muted/30 print:bg-gray-50",
                isToday(day) && "bg-primary/5 print:bg-transparent",
                "hover:bg-accent/50 cursor-pointer group print:hover:bg-transparent",
                dayIdx % 7 === 0 && "pl-2 sm:pl-3"
              )}
              onClick={() => onDateChange(day, { shouldOpenCreateEvent: true })}
            >
              {/* Ugenummer - mere synlig på små skærme */}
              {dayIdx % 7 === 0 && (
                <div className="absolute left-0.5 top-0.5 text-[7px] sm:text-[8px] text-muted-foreground/70 font-medium">
                  {getWeekNumber(day)}
                </div>
              )}

              {/* Dato - forbedret læsbarhed */}
              <div
                className={cn(
                  "text-[10px] sm:text-xs font-medium flex items-center justify-end",
                  "h-4 sm:h-5",
                  !isCurrentMonth && "text-muted-foreground/50 italic",
                  isToday(day) && "text-primary font-bold"
                )}
              >
                {format(day, "d")}
              </div>

              {/* Events container - bedre spacing og læsbarhed */}
              <div className="space-y-1 sm:space-y-1.5 mt-1 sm:mt-2">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventItem
                    key={`event-${event.id}`}
                    event={event}
                    className={cn(
                      // Større tekst og bedre padding
                      "text-[8px] sm:text-[10px] leading-tight",
                      "py-1 sm:py-1.5",
                      "px-1.5 sm:px-2",
                      "rounded",
                      // Forbedret hover effekt
                      "hover:brightness-90 transition-all",
                      // Bedre kontrast for tekst
                      "font-medium"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                    }}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div
                    className={cn(
                      "text-[8px] sm:text-[10px]",
                      "font-medium text-muted-foreground",
                      "px-1.5 py-0.5",
                      "hover:bg-accent/50 rounded cursor-pointer"
                    )}
                  >
                    +{dayEvents.length - 3} mere
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event dialog */}
      <ViewEventDialog
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
        }}
        onEdit={(event) => {
          // Håndter redigering her
          console.log("Redigerer event:", event);
          // Åbn redigeringsdialog eller lignende
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}
