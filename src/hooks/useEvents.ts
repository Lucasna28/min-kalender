import { useCallback, useRef, useState } from "react";
import { format } from "date-fns";
import { useSupabase } from "@/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";
import { PostgrestError } from "supabase";
import { Event } from "@/types/calendar";

interface EventCache {
  [key: string]: {
    events: Event[];
    timestamp: number;
  };
}

export type CreateEventData = Omit<Event, "id" | "userId">;

export function useEvents(visibleCalendarIds: string[]) {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
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

      const formattedEvents = (events || []).map((event) => ({
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
  }, [supabase, toast, visibleCalendarIds]);

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

      // Ryd cache for at tvinge en genindlæsning
      eventCache.current = {};

      toast({
        title: "Begivenhed oprettet",
        description: "Din begivenhed er blevet oprettet",
      });

      return data;
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

      // Ryd cache for at tvinge en genindlæsning
      eventCache.current = {};

      toast({
        title: "Begivenhed opdateret",
        description: "Din begivenhed er blevet opdateret",
      });
    } catch (error: unknown) {
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
  }, [supabase, toast]);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

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
  }, [supabase, toast]);

  return {
    events: [],
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: () => {
      // Ryd cache for at tvinge en genindlæsning
      eventCache.current = {};
      return Promise.resolve();
    },
  };
}
