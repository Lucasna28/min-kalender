import { useCallback, useEffect, useRef, useState } from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";
import { PostgrestError } from "@supabase/supabase-js";
import { Event } from "@/types/calendar";

interface EventCache {
  [key: string]: {
    events: Event[];
    timestamp: number;
  };
}

// Type for rå event data fra databasen
interface DatabaseEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  userId: string;
  calendar_id: string;
  color?: string;
}

export type CreateEventData = Omit<Event, "id" | "userId">;

interface UseEventsReturn {
  events: Event[];
  isLoading: boolean;
  createEvent: (eventData: CreateEventData) => Promise<Event>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useEvents(visibleCalendarIds: string[]): UseEventsReturn {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const { toast } = useToast();
  const eventCache = useRef<EventCache>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutter

  const getEvents = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setIsLoading(true);

      const cacheKey = `${format(startDate, "yyyy-MM-dd")}_${
        format(endDate, "yyyy-MM-dd")
      }`;

      const cached = eventCache.current[cacheKey];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.events;
      }

      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .in("calendar_id", visibleCalendarIds)
        .gte("start", startDate.toISOString())
        .lte("end", endDate.toISOString())
        .order("start", { ascending: true });

      if (error) throw error;

      const formattedEvents = (events || []).map((event: DatabaseEvent) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      eventCache.current[cacheKey] = {
        events: formattedEvents,
        timestamp: Date.now(),
      };

      return formattedEvents;
    } catch (error: unknown) {
      const err = error as Error | PostgrestError;
      toast({
        title: "Fejl ved hentning",
        description: err.message || "Kunne ikke hente begivenheder",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [CACHE_DURATION, supabase, visibleCalendarIds]);

  // Hent events for den aktuelle måned når komponenten mountes eller når visibleCalendarIds ændres
  useEffect(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    getEvents(start, end).then((fetchedEvents) => {
      setEvents(fetchedEvents);
    });
  }, [getEvents, visibleCalendarIds]);

  const createEvent = useCallback(async (eventData: CreateEventData) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("events")
        .insert([{
          ...eventData,
          start: eventData.start.toISOString(),
          end: eventData.end.toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      // Opdater events state med den nye begivenhed
      const newEvent = {
        ...data,
        start: new Date(data.start),
        end: new Date(data.end),
      };
      setEvents((prev) => [...prev, newEvent]);

      // Ryd cache for at tvinge en genindlæsning
      eventCache.current = {};

      toast({
        title: "Begivenhed oprettet",
        description: "Din begivenhed er blevet oprettet",
      });

      return newEvent;
    } catch (error: unknown) {
      const err = error as Error | PostgrestError;
      toast({
        title: "Fejl ved oprettelse",
        description: err.message || "Kunne ikke oprette begivenhed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  const updateEvent = useCallback(async (event: Event) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("events")
        .update({
          ...event,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
        })
        .eq("id", event.id);

      if (error) throw error;

      setEvents((prev) => prev.map((e) => e.id === event.id ? event : e));

      toast({
        title: "Begivenhed opdateret",
        description: "Din begivenhed er blevet opdateret",
      });
    } catch (error) {
      const err = error as Error | PostgrestError;
      toast({
        title: "Fejl ved opdatering",
        description: err.message || "Kunne ikke opdatere begivenhed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      // Fjern den slettede begivenhed fra events state
      setEvents((prev) => prev.filter((e) => e.id !== eventId));

      // Ryd cache for at tvinge en genindlæsning
      eventCache.current = {};

      toast({
        title: "Begivenhed slettet",
        description: "Din begivenhed er blevet slettet",
      });
    } catch (error: unknown) {
      const err = error as Error | PostgrestError;
      toast({
        title: "Fejl ved sletning",
        description: err.message || "Kunne ikke slette begivenhed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const refetch = async () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    // Ryd cache for at tvinge en genindlæsning
    eventCache.current = {};

    const fetchedEvents = await getEvents(start, end);
    setEvents(fetchedEvents);
  };

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch,
  };
}
