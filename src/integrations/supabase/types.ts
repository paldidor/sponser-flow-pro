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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      package_placements: {
        Row: {
          created_at: string
          id: string
          package_id: string
          placement_option_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          package_id: string
          placement_option_id: string
        }
        Update: {
          created_at?: string
          id?: string
          package_id?: string
          placement_option_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_package_placements_package"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_package_placements_placement"
            columns: ["placement_option_id"]
            isOneToOne: false
            referencedRelation: "placement_options"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_options: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_popular: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_popular?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_popular?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sponsorship_offers: {
        Row: {
          created_at: string
          description: string | null
          duration: string
          fundraising_goal: number
          id: string
          impact: string
          source: string
          source_file_name: string | null
          status: string
          supported_players: number | null
          team_profile_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration: string
          fundraising_goal: number
          id?: string
          impact: string
          source?: string
          source_file_name?: string | null
          status?: string
          supported_players?: number | null
          team_profile_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string
          fundraising_goal?: number
          id?: string
          impact?: string
          source?: string
          source_file_name?: string | null
          status?: string
          supported_players?: number | null
          team_profile_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sponsorship_offers_team_profile"
            columns: ["team_profile_id"]
            isOneToOne: false
            referencedRelation: "team_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_packages: {
        Row: {
          benefits: string[] | null
          created_at: string
          description: string | null
          id: string
          name: string
          package_order: number | null
          price: number
          sponsorship_offer_id: string
          updated_at: string
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          package_order?: number | null
          price: number
          sponsorship_offer_id: string
          updated_at?: string
        }
        Update: {
          benefits?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          package_order?: number | null
          price?: number
          sponsorship_offer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sponsorship_packages_offer"
            columns: ["sponsorship_offer_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_questionnaire_responses: {
        Row: {
          created_at: string
          id: string
          responses: Json
          sponsorship_offer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          responses?: Json
          sponsorship_offer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          responses?: Json
          sponsorship_offer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_questionnaire_responses_offer"
            columns: ["sponsorship_offer_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      team_profiles: {
        Row: {
          competition_scope: string | null
          created_at: string
          domain: string | null
          email_list_size: number | null
          facebook_followers: number | null
          facebook_link: string | null
          id: string
          instagram_followers: number | null
          instagram_link: string | null
          level_of_play: string | null
          linkedin_link: string | null
          location: string | null
          main_values: Json
          number_of_players: string | null
          organization_status: string | null
          season_end_date: string | null
          season_start_date: string | null
          seed_url: string | null
          sources: Json
          sport: string | null
          team_bio: string | null
          team_name: string | null
          twitter_followers: number | null
          twitter_link: string | null
          updated_at: string
          user_id: string
          youtube_link: string | null
        }
        Insert: {
          competition_scope?: string | null
          created_at?: string
          domain?: string | null
          email_list_size?: number | null
          facebook_followers?: number | null
          facebook_link?: string | null
          id?: string
          instagram_followers?: number | null
          instagram_link?: string | null
          level_of_play?: string | null
          linkedin_link?: string | null
          location?: string | null
          main_values?: Json
          number_of_players?: string | null
          organization_status?: string | null
          season_end_date?: string | null
          season_start_date?: string | null
          seed_url?: string | null
          sources?: Json
          sport?: string | null
          team_bio?: string | null
          team_name?: string | null
          twitter_followers?: number | null
          twitter_link?: string | null
          updated_at?: string
          user_id: string
          youtube_link?: string | null
        }
        Update: {
          competition_scope?: string | null
          created_at?: string
          domain?: string | null
          email_list_size?: number | null
          facebook_followers?: number | null
          facebook_link?: string | null
          id?: string
          instagram_followers?: number | null
          instagram_link?: string | null
          level_of_play?: string | null
          linkedin_link?: string | null
          location?: string | null
          main_values?: Json
          number_of_players?: string | null
          organization_status?: string | null
          season_end_date?: string | null
          season_start_date?: string | null
          seed_url?: string | null
          sources?: Json
          sport?: string | null
          team_bio?: string | null
          team_name?: string | null
          twitter_followers?: number | null
          twitter_link?: string | null
          updated_at?: string
          user_id?: string
          youtube_link?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          competition_scope: string | null
          created_at: string
          facebook_link: string | null
          id: string
          instagram_link: string | null
          level_of_play: string | null
          linkedin_link: string | null
          location: string | null
          main_values: Json | null
          number_of_players: string | null
          seed_url: string
          sources: Json | null
          sport: string | null
          team_bio: string | null
          team_name: string | null
          youtube_link: string | null
        }
        Insert: {
          competition_scope?: string | null
          created_at?: string
          facebook_link?: string | null
          id?: string
          instagram_link?: string | null
          level_of_play?: string | null
          linkedin_link?: string | null
          location?: string | null
          main_values?: Json | null
          number_of_players?: string | null
          seed_url: string
          sources?: Json | null
          sport?: string | null
          team_bio?: string | null
          team_name?: string | null
          youtube_link?: string | null
        }
        Update: {
          competition_scope?: string | null
          created_at?: string
          facebook_link?: string | null
          id?: string
          instagram_link?: string | null
          level_of_play?: string | null
          linkedin_link?: string | null
          location?: string | null
          main_values?: Json | null
          number_of_players?: string | null
          seed_url?: string
          sources?: Json | null
          sport?: string | null
          team_bio?: string | null
          team_name?: string | null
          youtube_link?: string | null
        }
        Relationships: []
      }
      "Websites Analysis": {
        Row: {
          created_at: string
          id: number
          website_link: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          website_link?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          website_link?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_complete_sponsorship_offer: {
        Args: {
          p_description?: string
          p_duration: string
          p_fundraising_goal: number
          p_impact: string
          p_packages?: Json
          p_questionnaire_responses?: Json
          p_supported_players: number
          p_team_profile_id?: string
          p_title: string
        }
        Returns: Json
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
