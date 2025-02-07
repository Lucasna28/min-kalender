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
          "min-h-[6rem] p-2 relative",
          isToday && "bg-accent/50",
          isSelected && "ring-2 ring-primary",
          isOutsideMonth && "opacity-50"
        )}
        onClick={() => onDateClick(day)}
        data-weekday={weekday}
        data-day={dayNumber}
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
      {/* Ugedage header */}
      <div className="grid grid-cols-7 text-sm font-medium text-muted-foreground border-b border-border print:border-gray-200">
        {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((day, i) => (
          <div
            key={day}
            className={cn(
              "h-10 flex items-center justify-center border-r border-border print:border-gray-200 print:text-gray-600 print:font-semibold print:text-base",
              // Vis kun første bogstav på små skærme
              "sm:block",
              "relative"
            )}
          >
            <span className="hidden sm:block">{day}</span>
            <span className="sm:hidden">{day[0]}</span>
          </div>
        ))}
      </div>

      {/* Kalendergrid */}
      <div
        className="grid grid-cols-7 flex-1 print:gap-0"
        style={{
          gridTemplateRows: `repeat(${numberOfWeeks}, minmax(100px, 1fr))`,
        }}
      >
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day, events);
          const isCurrentMonth = isSameMonth(day, date);
          const weekNumber = getWeekNumber(day);
          const isFirstInWeek = dayIdx % 7 === 0;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "border-r border-b border-border print:border-gray-200 relative transition-colors duration-200",
                "min-h-[100px] sm:min-h-[120px]", // Mindre højde på mobile
                !isCurrentMonth && "bg-muted/30 print:bg-gray-50",
                isToday(day) && "bg-primary/5 print:bg-transparent",
                "hover:bg-accent/50 cursor-pointer group print:hover:bg-transparent"
              )}
              onClick={() => onDateChange(day, { shouldOpenCreateEvent: true })}
            >
              {/* Ugenummer - kun synlig på større skærme */}
              {isFirstInWeek && (
                <div className="hidden sm:block absolute -left-8 top-1 text-xs text-muted-foreground print:text-gray-500 print:font-medium">
                  {weekNumber}
                </div>
              )}

              {/* Dato header */}
              <div className="p-1 sm:p-2">
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
                    <span className="text-xs mr-1 text-muted-foreground/40 print:text-gray-400 hidden sm:inline">
                      {format(day, "MMM", { locale: da })}
                    </span>
                  )}
                  {format(day, "d.")}
                </div>

                {/* Events liste - tilpasset til mobile */}
                <div className="space-y-1 mt-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      className="text-xs truncate sm:text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayEvents.length - 3} mere
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event dialog */}
      <ViewEventDialog
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
