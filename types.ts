
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      calendar_invitations: {
        Row: {
          calendar_id: string | null
          created_at: string | null
          id: string
          invitation_type: string | null
          invitee_email: string
          inviter_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          invitation_type?: string | null
          invitee_email: string
          inviter_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          invitation_type?: string | null
          invitee_email?: string
          inviter_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_invitations_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_shares: {
        Row: {
          calendar_id: string
          created_at: string
          email: string
          id: string
          permission: string
          status: string
          user_id: string | null
        }
        Insert: {
          calendar_id: string
          created_at?: string
          email: string
          id?: string
          permission: string
          status?: string
          user_id?: string | null
        }
        Update: {
          calendar_id?: string
          created_at?: string
          email?: string
          id?: string
          permission?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_shares_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      calendars: {
        Row: {
          allow_invites: boolean | null
          color: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          is_visible: boolean | null
          name: string
          show_in_search: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          allow_invites?: boolean | null
          color: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_visible?: boolean | null
          name: string
          show_in_search?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          allow_invites?: boolean | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_visible?: boolean | null
          name?: string
          show_in_search?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      event_invitations: {
        Row: {
          created_at: string
          email: string | null
          event_id: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tags: {
        Row: {
          event_id: string
          tag_id: string
        }
        Insert: {
          event_id: string
          tag_id: string
        }
        Update: {
          event_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tags_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          calendar_id: string
          category: Database["public"]["Enums"]["event_category"] | null
          color: string
          created_at: string
          description: string | null
          end_date: string
          end_time: string
          id: string
          is_all_day: boolean
          location: string
          parent_event_id: string | null
          recurrence_end_date: string | null
          recurrence_rule: string | null
          repeat: string | null
          repeat_days: number[] | null
          repeat_interval: number | null
          repeat_until: string | null
          start_date: string
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          calendar_id: string
          category?: Database["public"]["Enums"]["event_category"] | null
          color?: string
          created_at?: string
          description?: string | null
          end_date: string
          end_time: string
          id?: string
          is_all_day?: boolean
          location: string
          parent_event_id?: string | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          repeat?: string | null
          repeat_days?: number[] | null
          repeat_interval?: number | null
          repeat_until?: string | null
          start_date: string
          start_time: string
          title: string
          user_id?: string
        }
        Update: {
          calendar_id?: string
          category?: Database["public"]["Enums"]["event_category"] | null
          color?: string
          created_at?: string
          description?: string | null
          end_date?: string
          end_time?: string
          id?: string
          is_all_day?: boolean
          location?: string
          parent_event_id?: string | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          repeat?: string | null
          repeat_days?: number[] | null
          repeat_interval?: number | null
          repeat_until?: string | null
          start_date?: string
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          calendar_id: string | null
          created_at: string
          event_id: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          calendar_id?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          calendar_id?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          display_name: string | null
          has_completed_tutorial: boolean | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          display_name?: string | null
          has_completed_tutorial?: boolean | null
          id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          display_name?: string | null
          has_completed_tutorial?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          remind_at: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          remind_at: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          remind_at?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_details: {
        Args: {
          user_ids: string[]
        }
        Returns: {
          id: string
          email: string
          full_name: string
        }[]
      }
      get_user_id_from_email: {
        Args: {
          email: string
        }
        Returns: string
      }
    }
    Enums: {
      event_category:
        | "arbejde"
        | "personlig"
        | "familie"
        | "ferie"
        | "fødselsdag"
        | "møde"
        | "læge"
        | "andet"
      notification_type:
        | "event_invitation"
        | "event_updated"
        | "event_deleted"
        | "calendar_shared"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
