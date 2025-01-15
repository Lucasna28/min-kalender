export type Event = {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  color: string;
  is_all_day: boolean;
  location: string | null;
};

export type Database = {
  public: {
    Tables: {
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at'> & {
          user_id?: string; // Optional fordi Supabase RLS vil sætte den automatisk
        };
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'user_id'>>;
      };
    };
  };
}; 