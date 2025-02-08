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
  const [isLoading, setIsLoading] = useState(true);

  // Definer fetchEvents først så vi kan bruge det i realtime subscription
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!visibleCalendarIds.length) {
        setEvents([]);
        return;
      }

      // Hent events for de synlige kalendere
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .in("calendar_id", visibleCalendarIds);

      if (error) {
        console.error("Fejl ved hentning af events:", error);
        return;
      }

      if (events?.length > 0) {
        const formattedEvents = events.map((event) => ({
          ...event,
          start_date: new Date(event.start_date),
          end_date: new Date(event.end_date),
        }));
        setEvents(formattedEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Uventet fejl ved hentning af events:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, visibleCalendarIds]);

  // Realtime subscription
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      try {
        if (channel) {
          await channel.unsubscribe();
        }

        channel = supabase
          .channel("events-changes")
          .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "events",
          }, (payload) => {
            console.log("Realtime update:", payload);
            fetchEvents(); // Brug fetchEvents i stedet for refetch
          })
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              console.log("Realtime subscription active");
            }
          });
      } catch (error) {
        console.error("Fejl ved opsætning af realtime:", error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [supabase, fetchEvents]); // Brug fetchEvents i dependency array

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

      // Formatér event data
      const formattedEvent = formatEventData(eventData);

      // Debug logging
      console.log("Formateret event data:", formattedEvent);

      // Opret event
      const { data: newEvent, error } = await supabase
        .from("events")
        .insert([formattedEvent])
        .select()
        .single();

      if (error) {
        console.error("Database fejl:", error);
        throw new Error(error.message);
      }

      await fetchEvents();
      return newEvent;
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

  const formatEventData = (eventData: CreateEventInput) => {
    try {
      // Konverter datoer til Date objekter og juster for tidszoner
      const startDate = eventData.start_date instanceof Date
        ? new Date(eventData.start_date)
        : new Date(eventData.start_date);

      const endDate = eventData.end_date instanceof Date
        ? new Date(eventData.end_date)
        : new Date(eventData.end_date);

      // Juster for tidszoneforskelle
      const tzOffset = startDate.getTimezoneOffset() * 60000; // Offset i millisekunder

      // Tilføj tidspunkt til datoerne hvis det ikke er en heldagsbegivenhed
      if (!eventData.is_all_day) {
        const [startHours, startMinutes] = eventData.start_time.split(":");
        const [endHours, endMinutes] = eventData.end_time.split(":");

        startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
        endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
      } else {
        // For heldagsbegivenheder, sæt korrekt UTC tid
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      // Konverter til UTC strings med korrektion for tidszone
      const startUTC = new Date(startDate.getTime() - tzOffset).toISOString();
      const endUTC = new Date(endDate.getTime() - tzOffset).toISOString();

      // Sæt standardværdier for alle påkrævede felter
      return {
        title: eventData.title.trim(),
        description: eventData.description?.trim() || null,
        start_date: startUTC,
        end_date: endUTC,
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
        repeat_days: eventData.repeat_days || [],
        repeat: eventData.repeat || null,
        repeat_until: eventData.repeat_until || null,
        parent_event_id: eventData.parent_event_id || null,
      };
    } catch (error) {
      console.error("Fejl ved formatering af event data:", error);
      console.log("Event data der fejlede:", eventData);
      throw new Error("Kunne ikke formatere event data korrekt");
    }
  };

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
