export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_state: {
        Row: {
          competitors: Json
          config: Json
          created_at: string
          custom_vehicles: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          competitors?: Json
          config?: Json
          created_at?: string
          custom_vehicles?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          competitors?: Json
          config?: Json
          created_at?: string
          custom_vehicles?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_scores: {
        Row: {
          created_at: string
          day: string
          id: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day: string
          id?: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day?: string
          id?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      defis: {
        Row: {
          completed_at: string | null
          created_at: string
          creator_id: string
          creator_score: number | null
          duration_sec: number
          expires_at: string
          id: string
          opponent_id: string
          opponent_score: number | null
          seed: number
          status: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          creator_id: string
          creator_score?: number | null
          duration_sec?: number
          expires_at?: string
          id?: string
          opponent_id: string
          opponent_score?: number | null
          seed: number
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          creator_id?: string
          creator_score?: number | null
          duration_sec?: number
          expires_at?: string
          id?: string
          opponent_id?: string
          opponent_score?: number | null
          seed?: number
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      game_saves: {
        Row: {
          created_at: string
          data: Json
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          data?: Json
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          data?: Json
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      mp_elo: {
        Row: {
          draws: number
          losses: number
          rating: number
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          draws?: number
          losses?: number
          rating?: number
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          draws?: number
          losses?: number
          rating?: number
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: []
      }
      mp_match_events: {
        Row: {
          amount: number
          created_at: string
          event_type: string
          id: number
          match_id: string
          missions_completed: number
          total_score: number
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          event_type: string
          id?: number
          match_id: string
          missions_completed?: number
          total_score?: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          event_type?: string
          id?: number
          match_id?: string
          missions_completed?: number
          total_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mp_match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "mp_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      mp_match_players: {
        Row: {
          elo_after: number | null
          elo_before: number
          last_event_at: string
          match_id: string
          missions_completed: number
          pseudo: string
          score: number
          user_id: string
        }
        Insert: {
          elo_after?: number | null
          elo_before?: number
          last_event_at?: string
          match_id: string
          missions_completed?: number
          pseudo?: string
          score?: number
          user_id: string
        }
        Update: {
          elo_after?: number | null
          elo_before?: number
          last_event_at?: string
          match_id?: string
          missions_completed?: number
          pseudo?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mp_match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "mp_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      mp_matches: {
        Row: {
          duration_sec: number
          ended_at: string | null
          id: string
          seed: number
          started_at: string
          status: string
          winner_id: string | null
        }
        Insert: {
          duration_sec?: number
          ended_at?: string | null
          id?: string
          seed: number
          started_at?: string
          status?: string
          winner_id?: string | null
        }
        Update: {
          duration_sec?: number
          ended_at?: string | null
          id?: string
          seed?: number
          started_at?: string
          status?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      mp_queue: {
        Row: {
          duration_sec: number
          joined_at: string
          rating: number
          user_id: string
        }
        Insert: {
          duration_sec?: number
          joined_at?: string
          rating?: number
          user_id: string
        }
        Update: {
          duration_sec?: number
          joined_at?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_kind: string
          avatar_url: string | null
          created_at: string
          driver_name: string | null
          id: string
          license_level: number
          license_xp: number
          pseudo: string
          updated_at: string
        }
        Insert: {
          avatar_kind?: string
          avatar_url?: string | null
          created_at?: string
          driver_name?: string | null
          id: string
          license_level?: number
          license_xp?: number
          pseudo?: string
          updated_at?: string
        }
        Update: {
          avatar_kind?: string
          avatar_url?: string | null
          created_at?: string
          driver_name?: string | null
          id?: string
          license_level?: number
          license_xp?: number
          pseudo?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_license_xp: {
        Args: { _amount: number }
        Returns: {
          level: number
          xp: number
        }[]
      }
      create_defi: {
        Args: { _duration_sec?: number; _opponent_pseudo: string }
        Returns: string
      }
      find_user_by_pseudo: {
        Args: { _pseudo: string }
        Returns: {
          avatar_kind: string
          id: string
          pseudo: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mp_finish_match: {
        Args: { _match_id: string }
        Returns: {
          duration_sec: number
          ended_at: string | null
          id: string
          seed: number
          started_at: string
          status: string
          winner_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "mp_matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mp_join_matchmaking: { Args: { _duration_sec?: number }; Returns: string }
      mp_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          draws: number
          losses: number
          pseudo: string
          rating: number
          user_id: string
          wins: number
        }[]
      }
      mp_leave_queue: { Args: never; Returns: undefined }
      mp_submit_event: {
        Args: { _amount: number; _match_id: string }
        Returns: {
          missions_completed: number
          total_score: number
        }[]
      }
      submit_defi_run: {
        Args: {
          _defi_id: string
          _elapsed_sec: number
          _missions_completed: number
        }
        Returns: {
          completed_at: string | null
          created_at: string
          creator_id: string
          creator_score: number | null
          duration_sec: number
          expires_at: string
          id: string
          opponent_id: string
          opponent_score: number | null
          seed: number
          status: string
          updated_at: string
          winner_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "defis"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
