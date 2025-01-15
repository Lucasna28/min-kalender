export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      calendars: {
        Row: {
          id: string
          created_at: string
          name: string
          color: string
          user_id: string
          is_visible: boolean
          is_default: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          color: string
          user_id: string
          is_visible?: boolean
          is_default?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          color?: string
          user_id?: string
          is_visible?: boolean
          is_default?: boolean
        }
      }
      events: {
        Row: {
          id: string
          created_at: string
          title: string
          description?: string
          start_date: string
          end_date: string
          start_time?: string
          end_time?: string
          is_all_day: boolean
          location?: string
          calendar_id: string
          user_id: string
          category?: string
          color?: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string
          start_date: string
          end_date: string
          start_time?: string
          end_time?: string
          is_all_day?: boolean
          location?: string
          calendar_id: string
          user_id: string
          category?: string
          color?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          start_date?: string
          end_date?: string
          start_time?: string
          end_time?: string
          is_all_day?: boolean
          location?: string
          calendar_id?: string
          user_id?: string
          category?: string
          color?: string
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name?: string
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 