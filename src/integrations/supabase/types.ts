export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_tip: boolean | null
          message: string
          stream_id: string
          tip_amount: number | null
          user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_tip?: boolean | null
          message: string
          stream_id: string
          tip_amount?: number | null
          user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          is_tip?: boolean | null
          message?: string
          stream_id?: string
          tip_amount?: number | null
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "public_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_lineup: {
        Row: {
          created_at: string
          dj_id: string
          duration_minutes: number | null
          event_id: string
          id: string
          is_headliner: boolean | null
          set_time: string | null
        }
        Insert: {
          created_at?: string
          dj_id: string
          duration_minutes?: number | null
          event_id: string
          id?: string
          is_headliner?: boolean | null
          set_time?: string | null
        }
        Update: {
          created_at?: string
          dj_id?: string
          duration_minutes?: number | null
          event_id?: string
          id?: string
          is_headliner?: boolean | null
          set_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_lineup_dj_id_fkey"
            columns: ["dj_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_lineup_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          organizer_id: string
          start_time: string
          status: Database["public"]["Enums"]["event_status"] | null
          stream_id: string | null
          ticket_capacity: number | null
          ticket_price: number | null
          tickets_sold: number | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          organizer_id: string
          start_time: string
          status?: Database["public"]["Enums"]["event_status"] | null
          stream_id?: string | null
          ticket_capacity?: number | null
          ticket_price?: number | null
          tickets_sold?: number | null
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          organizer_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          stream_id?: string | null
          ticket_capacity?: number | null
          ticket_price?: number | null
          tickets_sold?: number | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "public_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          follower_count: number
          following_count: number
          full_name: string | null
          id: string
          instagram: string | null
          last_streamed_at: string | null
          location: string | null
          role: Database["public"]["Enums"]["user_role"]
          soundcloud: string | null
          spotify: string | null
          streaming_description: string | null
          streaming_title: string | null
          total_streams: number | null
          total_tips_received: number | null
          updated_at: string
          username: string
          verified: boolean
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          follower_count?: number
          following_count?: number
          full_name?: string | null
          id: string
          instagram?: string | null
          last_streamed_at?: string | null
          location?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          soundcloud?: string | null
          spotify?: string | null
          streaming_description?: string | null
          streaming_title?: string | null
          total_streams?: number | null
          total_tips_received?: number | null
          updated_at?: string
          username: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          follower_count?: number
          following_count?: number
          full_name?: string | null
          id?: string
          instagram?: string | null
          last_streamed_at?: string | null
          location?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          soundcloud?: string | null
          spotify?: string | null
          streaming_description?: string | null
          streaming_title?: string | null
          total_streams?: number | null
          total_tips_received?: number | null
          updated_at?: string
          username?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      song_requests: {
        Row: {
          album_art_url: string | null
          created_at: string
          dj_id: string
          event_id: string | null
          fan_id: string
          id: string
          message: string | null
          song_artist: string
          song_title: string
          status: Database["public"]["Enums"]["request_status"] | null
          tip_amount: number
          updated_at: string
        }
        Insert: {
          album_art_url?: string | null
          created_at?: string
          dj_id: string
          event_id?: string | null
          fan_id: string
          id?: string
          message?: string | null
          song_artist: string
          song_title: string
          status?: Database["public"]["Enums"]["request_status"] | null
          tip_amount?: number
          updated_at?: string
        }
        Update: {
          album_art_url?: string | null
          created_at?: string
          dj_id?: string
          event_id?: string | null
          fan_id?: string
          id?: string
          message?: string | null
          song_artist?: string
          song_title?: string
          status?: Database["public"]["Enums"]["request_status"] | null
          tip_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_requests_dj_id_fkey"
            columns: ["dj_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_requests_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_credentials: {
        Row: {
          created_at: string
          hls_url: string
          id: string
          rtmp_url: string
          stream_id: string
          stream_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hls_url: string
          id?: string
          rtmp_url: string
          stream_id: string
          stream_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hls_url?: string
          id?: string
          rtmp_url?: string
          stream_id?: string
          stream_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_credentials_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: true
            referencedRelation: "public_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_credentials_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: true
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_viewers: {
        Row: {
          anonymous_id: string | null
          id: string
          joined_at: string
          left_at: string | null
          stream_id: string
          viewer_id: string | null
        }
        Insert: {
          anonymous_id?: string | null
          id?: string
          joined_at?: string
          left_at?: string | null
          stream_id: string
          viewer_id?: string | null
        }
        Update: {
          anonymous_id?: string | null
          id?: string
          joined_at?: string
          left_at?: string | null
          stream_id?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_viewers_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "public_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_viewers_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_viewers_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streams: {
        Row: {
          bitrate: number | null
          created_at: string
          description: string | null
          duration: number | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          max_viewers: number | null
          resolution: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["stream_status"] | null
          title: string | null
          updated_at: string
          user_id: string
          viewer_count: number | null
        }
        Insert: {
          bitrate?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          max_viewers?: number | null
          resolution?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["stream_status"] | null
          title?: string | null
          updated_at?: string
          user_id: string
          viewer_count?: number | null
        }
        Update: {
          bitrate?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          max_viewers?: number | null
          resolution?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["stream_status"] | null
          title?: string | null
          updated_at?: string
          user_id?: string
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "streams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_promoters: {
        Row: {
          commission_rate: number | null
          created_at: string
          id: string
          is_active: boolean | null
          promoter_id: string
          sub_promoter_id: string
          total_commission: number | null
          total_sales: number | null
          unique_code: string
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          promoter_id: string
          sub_promoter_id: string
          total_commission?: number | null
          total_sales?: number | null
          unique_code: string
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          promoter_id?: string
          sub_promoter_id?: string
          total_commission?: number | null
          total_sales?: number | null
          unique_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_promoters_promoter_id_fkey"
            columns: ["promoter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sub_promoters_sub_promoter_id_fkey"
            columns: ["sub_promoter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_sales: {
        Row: {
          buyer_id: string
          commission_amount: number | null
          created_at: string
          event_id: string
          id: string
          payment_status: string | null
          quantity: number
          sub_promoter_id: string | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          buyer_id: string
          commission_amount?: number | null
          created_at?: string
          event_id: string
          id?: string
          payment_status?: string | null
          quantity: number
          sub_promoter_id?: string | null
          total_amount: number
          unit_price: number
        }
        Update: {
          buyer_id?: string
          commission_amount?: number | null
          created_at?: string
          event_id?: string
          id?: string
          payment_status?: string | null
          quantity?: number
          sub_promoter_id?: string | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_sales_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_sales_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_sales_sub_promoter_id_fkey"
            columns: ["sub_promoter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          amount: number
          created_at: string
          id: string
          message: string | null
          recipient_id: string
          song_request: string | null
          stream_id: string | null
          tipper_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          message?: string | null
          recipient_id: string
          song_request?: string | null
          stream_id?: string | null
          tipper_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          message?: string | null
          recipient_id?: string
          song_request?: string | null
          stream_id?: string | null
          tipper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tips_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "public_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_tipper_id_fkey"
            columns: ["tipper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_streams: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          full_name: string | null
          id: string | null
          max_viewers: number | null
          resolution: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["stream_status"] | null
          title: string | null
          user_id: string | null
          username: string | null
          viewer_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "streams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_stream_credentials: {
        Args: { stream_id_param: string }
        Returns: {
          stream_key: string
          rtmp_url: string
          hls_url: string
        }[]
      }
    }
    Enums: {
      event_status: "draft" | "published" | "live" | "ended" | "cancelled"
      request_status: "pending" | "accepted" | "declined"
      stream_status: "offline" | "live" | "starting" | "ending"
      user_role: "dj" | "fan" | "promoter" | "venue" | "sub_promoter"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_status: ["draft", "published", "live", "ended", "cancelled"],
      request_status: ["pending", "accepted", "declined"],
      stream_status: ["offline", "live", "starting", "ending"],
      user_role: ["dj", "fan", "promoter", "venue", "sub_promoter"],
    },
  },
} as const
