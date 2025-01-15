"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/lib/database.types";

export type Event = {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  location?: string;
  calendar_id: string;
  category?: string;
  color?: string;
  user_id: string;
  repeat?: string;
  repeat_interval?: number;
  repeat_days?: string[];
  creator?: {
    email: string;
    raw_user_meta_data: {
      full_name: string;
    };
  };
};

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
  category?: EventCategory;
  user_id: string;
  created_at: Date;
  creator_name?: string;
  creator_email?: string;
  invitations?: Array<{
    email: string;
    status: "pending" | "accepted" | "declined";
    name?: string;
  }>;
}

export type EventCategory =
  | "arbejde"
  | "personlig"
  | "familie"
  | "ferie"
  | "fødselsdag"
  | "møde"
  | "læge"
  | "andet"
  | "helligdag";

export interface CreateEventData {
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  location?: string;
  calendar_id: string;
  category?: EventCategory;
  color?: string;
  invitations?: string[];
}

interface EventInvitation {
  email: string;
  status: "pending" | "accepted" | "declined";
  user?: {
    full_name?: string;
    email: string;
  };
}

// Funktion til at beregne påskedag
function getEasterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

// Funktion til at formatere dato til ISO string
function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

// Funktion til at tilføje dage til en dato
function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}

// Funktion til at hente danske helligdage
function getDanishHolidays(year: number) {
  // Beregn påskedag
  const easterSunday = getEasterSunday(year);

  // Beregn andre bevægelige helligdage baseret på påskedag
  const maundyThursday = addDays(easterSunday, -3); // Skærtorsdag
  const goodFriday = addDays(easterSunday, -2); // Langfredag
  const easterMonday = addDays(easterSunday, 1); // 2. Påskedag
  const prayerDay = addDays(easterSunday, 26); // Store Bededag
  const ascensionDay = addDays(easterSunday, 39); // Kristi Himmelfartsdag
  const pentecostSunday = addDays(easterSunday, 49); // Pinsedag
  const pentecostMonday = addDays(easterSunday, 50); // 2. Pinsedag

  const holidays = [
    { date: `${year}-01-01`, name: "Nytårsdag" },
    { date: formatDate(maundyThursday), name: "Skærtorsdag" },
    { date: formatDate(goodFriday), name: "Langfredag" },
    { date: formatDate(easterSunday), name: "Påskedag" },
    { date: formatDate(easterMonday), name: "2. Påskedag" },
    { date: formatDate(prayerDay), name: "Store Bededag" },
    { date: formatDate(ascensionDay), name: "Kristi Himmelfartsdag" },
    { date: formatDate(pentecostSunday), name: "Pinsedag" },
    { date: formatDate(pentecostMonday), name: "2. Pinsedag" },
    { date: `${year}-12-24`, name: "Juleaften" },
    { date: `${year}-12-25`, name: "1. Juledag" },
    { date: `${year}-12-26`, name: "2. Juledag" },
    { date: `${year}-12-31`, name: "Nytårsaften" },
  ];

  return holidays;
}

export function useEvents(visibleCalendarIds: string[] = []) {
  const { supabase } = useSupabase();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: events, error } = await supabase
        .from("events")
        .select(`
          *,
          creator:user_id (
            email,
            raw_user_meta_data->full_name
          )
        `)
        .in("calendar_id", visibleCalendarIds);

      if (error) {
        console.error("Fejl ved hentning af begivenheder:", error);
        return;
      }

      setEvents(events);
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

  const createEvent = useCallback(async (eventData: CreateEventData) => {
    try {
      // Forbered event data
      const eventDataToInsert = {
        title: eventData.title,
        description: eventData.description,
        start_date: format(eventData.start_date, "yyyy-MM-dd"),
        end_date: format(eventData.end_date, "yyyy-MM-dd"),
        start_time: eventData.is_all_day
          ? "00:00"
          : (eventData.start_time || format(eventData.start_date, "HH:mm")),
        end_time: eventData.is_all_day
          ? "23:59"
          : (eventData.end_time || format(eventData.end_date, "HH:mm")),
        is_all_day: eventData.is_all_day,
        location: eventData.location,
        calendar_id: eventData.calendar_id,
        category: eventData.category,
        color: eventData.color,
        repeat: eventData.repeat || "NONE",
        repeat_interval: eventData.repeat_interval || 1,
        repeat_days: eventData.repeat_days || [],
      };

      // Opret begivenheden
      const { data: newEvent, error } = await supabase
        .from("accessible_events")
        .insert([eventDataToInsert])
        .select("*")
        .single();

      if (error) {
        console.error("Database fejl:", error);
        throw error;
      }

      await fetchEvents();
      return newEvent;
    } catch (error) {
      console.error("Fejl ved oprettelse af begivenhed:", error);
      throw error;
    }
  }, [supabase, fetchEvents]);

  return {
    events,
    isLoading,
    createEvent,
    refetch: fetchEvents,
  };
}
