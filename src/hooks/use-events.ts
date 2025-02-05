"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  location?: string;
  calendar_id: string;
  calendar_name?: string;
  color?: string;
  category?: string;
  user_id: string;
  created_at?: Date;
  creator_name?: string;
  creator_email?: string;
}

export function useEvents(visibleCalendarIds: string[]) {
  const { supabase } = useSupabase();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!visibleCalendarIds.length) {
        console.log("Ingen synlige kalendere");
        setEvents([]);
        return;
      }

      console.log("Henter events for kalendere:", visibleCalendarIds);

      // Hent events
      const { data: events, error } = await supabase
        .from("accessible_events")
        .select("*")
        .in("calendar_id", visibleCalendarIds);

      if (error) {
        console.error("Fejl ved hentning af begivenheder:", error);
        return;
      }

      console.log("Rå events fra databasen:", events);

      // Konverter datoer og tilføj brugerdata
      const formattedEvents = events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start_date: new Date(
          event.start_date + (event.is_all_day ? "" : "T" + event.start_time),
        ),
        end_date: new Date(
          event.end_date + (event.is_all_day ? "" : "T" + event.end_time),
        ),
        is_all_day: event.is_all_day,
        user_id: event.user_id,
        calendar_id: event.calendar_id,
        color: event.color,
        location: event.location,
        start_time: event.start_time,
        end_time: event.end_time,
      }));

      console.log("Formaterede events:", formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Fejl ved hentning af begivenheder:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, visibleCalendarIds]);

  // Hent events når komponenten monteres eller når synlige kalendere ændres
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Subscribe til events ændringer
  useEffect(() => {
    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        () => {
          // Genindlæs events når der sker ændringer
          fetchEvents();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchEvents]);

  return {
    events,
    isLoading,
    refetch: fetchEvents,
  };
}
