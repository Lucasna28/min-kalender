import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { CalendarViewType, Event, CalendarState } from '@/types/calendar';
import { useToast } from '@/components/ui/use-toast';

export function useCalendar(initialView: CalendarViewType = 'month') {
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [state, setState] = useState<CalendarState>({
    events: [],
    isLoading: true,
    error: null,
    view: initialView,
    date: new Date(),
    selectedEvent: null,
  });

  // Hent events for den aktuelle måned
  const fetchEvents = async (date: Date) => {
    if (!session?.user?.id) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('userId', session.user.id)
        .gte('start', startOfMonth.toISOString())
        .lte('end', endOfMonth.toISOString());

      if (error) throw error;

      const events = data.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      setState(prev => ({ ...prev, events, isLoading: false }));
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
      toast({
        title: 'Fejl ved hentning af begivenheder',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Opret ny begivenhed
  const createEvent = async (event: Omit<Event, 'id' | 'userId'>) => {
    if (!session?.user?.id) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            ...event,
            userId: session.user.id,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        events: [...prev.events, { ...data, start: new Date(data.start), end: new Date(data.end) }],
        isLoading: false,
      }));

      toast({
        title: 'Begivenhed oprettet',
        description: 'Din begivenhed er blevet oprettet',
      });
    } catch (error: any) {
      console.error('Error creating event:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
      toast({
        title: 'Fejl ved oprettelse af begivenhed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Opdater begivenhed
  const updateEvent = async (event: Event) => {
    if (!session?.user?.id) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase
        .from('events')
        .update({
          ...event,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
        })
        .eq('id', event.id)
        .eq('userId', session.user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        events: prev.events.map(e => (e.id === event.id ? event : e)),
        isLoading: false,
      }));

      toast({
        title: 'Begivenhed opdateret',
        description: 'Din begivenhed er blevet opdateret',
      });
    } catch (error: any) {
      console.error('Error updating event:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
      toast({
        title: 'Fejl ved opdatering af begivenhed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Slet begivenhed
  const deleteEvent = async (eventId: string) => {
    if (!session?.user?.id) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('userId', session.user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        events: prev.events.filter(e => e.id !== eventId),
        isLoading: false,
      }));

      toast({
        title: 'Begivenhed slettet',
        description: 'Din begivenhed er blevet slettet',
      });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
      toast({
        title: 'Fejl ved sletning af begivenhed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Skift visning
  const setView = (view: CalendarViewType) => {
    setState(prev => ({ ...prev, view }));
  };

  // Skift dato
  const setDate = (date: Date) => {
    setState(prev => ({ ...prev, date }));
  };

  // Vælg begivenhed
  const selectEvent = (event: Event | null) => {
    setState(prev => ({ ...prev, selectedEvent: event }));
  };

  // Hent events når datoen ændres
  useEffect(() => {
    fetchEvents(state.date);
  }, [state.date]);

  return {
    ...state,
    setView,
    setDate,
    selectEvent,
    createEvent,
    updateEvent,
    deleteEvent,
  };
} 