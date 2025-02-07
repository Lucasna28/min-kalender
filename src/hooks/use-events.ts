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

interface CreateEventInput {
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  start_time?: string;
  end_time?: string;
  is_all_day?: boolean;
  location?: string;
  calendar_id: string;
  category?: EventCategory;
  color?: string;
}

type EventCategory =
  | "arbejde"
  | "personlig"
  | "familie"
  | "ferie"
  | "fødselsdag"
  | "møde"
  | "læge"
  | "andet";

export function useEvents(visibleCalendarIds: string[]) {
  const { supabase } = useSupabase();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!visibleCalendarIds.length) {
        
        setEvents([]);
        return;
      }

      

      // Hent events
      const { data: events, error } = await supabase
        .from("accessible_events")
        .select("*")
        .in("calendar_id", visibleCalendarIds);

      if (error) {
        console.error("Fejl ved hentning af begivenheder:", error);
        return;
      }

      

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
        (payload) => {
          
          // Genindlæs events når der sker ændringer
          fetchEvents();
        },
      )
      .subscribe((status) => {
        // Håndter kanal status
        if (status === "SUBSCRIBED") {
          
        } else if (status === "CLOSED") {
          
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            "Fejl i events kanal - prøver at genoprette forbindelse",
          );
          // Prøv at genoprette forbindelsen efter en kort pause
          setTimeout(() => {
            channel.subscribe();
          }, 1000);
        }
      });

    return () => {
      
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchEvents]);

  const updateEvent = useCallback(async (event: CalendarEvent) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("events")
        .update({
          title: event.title,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date,
          is_all_day: event.is_all_day,
          location: event.location,
          color: event.color,
          // ... andre felter der skal opdateres
        })
        .eq("id", event.id);

      if (error) throw error;

      // Genindlæs events
      await fetchEvents();
    } catch (error) {
      console.error("Fejl ved opdatering af event:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchEvents]);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      // Opdater events state
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Fejl ved sletning af event:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const createEvent = useCallback(async (eventData: CreateEventInput) => {
    try {
      setIsLoading(true);

      // Valider bruger
      const { data: { user }, error: userError } = await supabase.auth
        .getUser();
      if (userError || !user) {
        throw new Error("Du skal være logget ind for at oprette begivenheder");
      }

      // Valider input
      validateEventInput(eventData);

      // Formatér event data
      const eventToCreate = formatEventData(eventData);

      // Debug logging
      logEventData(eventData, eventToCreate);

      // Opret event
      const { data: newEvent, error } = await supabase
        .rpc("insert_event", { event_data: eventToCreate });

      if (error) {
        console.error("Database fejl:", error);
        throw new Error(error.message);
      }

      // Formatér og returner det nye event
      const formattedEvent = formatNewEvent(newEvent);
      await fetchEvents();
      return formattedEvent;
    } catch (error) {
      console.error("Fejl ved oprettelse af event:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchEvents]);

  // Hjælpefunktioner
  const validateEventInput = (eventData: CreateEventInput) => {
    if (!eventData.title?.trim()) {
      throw new Error("Titel er påkrævet");
    }
    if (!eventData.calendar_id) {
      throw new Error("Vælg venligst en kalender");
    }
    if (!eventData.start_date) {
      throw new Error("Startdato er påkrævet");
    }
  };

  const formatEventData = (eventData: CreateEventInput) => ({
    title: eventData.title.trim(),
    description: eventData.description?.trim() || null,
    start_date: eventData.start_date.toISOString().split("T")[0],
    end_date: eventData.end_date.toISOString().split("T")[0],
    start_time: eventData.is_all_day
      ? "00:00:00"
      : eventData.start_time || "00:00:00",
    end_time: eventData.is_all_day
      ? "23:59:59"
      : eventData.end_time || "23:59:59",
    is_all_day: eventData.is_all_day || false,
    location: eventData.location?.trim() || "",
    calendar_id: eventData.calendar_id,
    category: eventData.category || "arbejde",
    color: eventData.color || "#4285F4",
    repeat_days: [],
    repeat: null,
  });

  const formatNewEvent = (newEvent: any) => ({
    ...newEvent,
    start_date: new Date(newEvent.start_date),
    end_date: new Date(newEvent.end_date),
  });

  const logEventData = (rawData: CreateEventInput, formattedData: any) => {
    if (process.env.NODE_ENV === "development") {
      
      
      console.log("Calendar ID check:", {
        fromEventData: rawData.calendar_id,
        inEventToCreate: formattedData.calendar_id,
        type: typeof formattedData.calendar_id,
      });
    }
  };

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}
