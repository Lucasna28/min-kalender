"use client";

import { format } from "date-fns";
import { da } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/use-events";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScheduleViewProps {
  date: Date;
  events: CalendarEvent[];
}

export function ScheduleView({ date, events }: ScheduleViewProps) {
  // Sorter begivenheder efter startdato
  const sortedEvents = [...events].sort((a, b) => {
    const aDate = new Date(a.start_date);
    const bDate = new Date(b.start_date);
    return aDate.getTime() - bDate.getTime();
  });

  // Gruppér begivenheder efter dato
  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const date = new Date(event.start_date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-8">
        {Object.entries(groupedEvents).map(([date, events]) => (
          <div key={date} className="space-y-4">
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm p-2 border-b">
              <h3 className="font-medium">
                {format(new Date(date), "EEEE d. MMMM yyyy", { locale: da })}
              </h3>
            </div>
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.is_all_day ? (
                        "Hele dagen"
                      ) : (
                        <>
                          {format(new Date(event.start_date), "HH:mm", {
                            locale: da,
                          })}
                          {" - "}
                          {format(new Date(event.end_date), "HH:mm", {
                            locale: da,
                          })}
                        </>
                      )}
                    </div>
                    {event.description && (
                      <div className="mt-2 text-sm">{event.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
