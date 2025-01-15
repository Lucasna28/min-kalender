import { useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { useSupabase } from "@/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";

interface EventCache {
  [key: string]: {
    events: CalendarEvent[];
    timestamp: number;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_all_day: boolean;
  user_id: string;
}

export function useEvents() {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const eventCache = useRef<EventCache>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutter

  const getEvents = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setIsLoading(true);
      
      const cacheKey = `${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
      
      const cached = eventCache.current[cacheKey];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.events;
      }

      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_date', format(startDate, 'yyyy-MM-dd'))
        .lte('end_date', format(endDate, 'yyyy-MM-dd'))
        .order('start_date', { ascending: true });

      if (error) throw error;

      eventCache.current[cacheKey] = {
        events: events || [],
        timestamp: Date.now()
      };

      return events || [];
    } catch (error: any) {
      toast({
        title: 'Fejl ved hentning',
        description: error.message || 'Kunne ikke hente begivenheder',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  return {
    isLoading,
    getEvents
  };
} 