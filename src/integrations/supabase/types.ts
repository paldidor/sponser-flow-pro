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
      activation_tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string
          id: string
          package_id: string | null
          sponsor_name: string | null
          status: string
          task_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          package_id?: string | null
          sponsor_name?: string | null
          status?: string
          task_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          package_id?: string | null
          sponsor_name?: string | null
          status?: string
          task_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activation_tasks_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string | null
          cover_image_alt: string | null
          cover_image_url: string | null
          created_at: string | null
          id: string | null
          preview_text: string | null
          published_at: string | null
          slug: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          id?: string | null
          preview_text?: string | null
          published_at?: string | null
          slug?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          id?: string | null
          preview_text?: string | null
          published_at?: string | null
          slug?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      creative_assets: {
        Row: {
          asset_name: string
          asset_url: string
          created_at: string
          id: string
          sponsor_id: string
        }
        Insert: {
          asset_name: string
          asset_url: string
          created_at?: string
          id?: string
          sponsor_id: string
        }
        Update: {
          asset_name?: string
          asset_url?: string
          created_at?: string
          id?: string
          sponsor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_assets_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
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
      sponsors: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          package_id: string | null
          social_links: Json | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          package_id?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          package_id?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsors_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_offers: {
        Row: {
          analysis_status: string | null
          created_at: string
          description: string | null
          draft_data: Json | null
          duration: string
          fundraising_goal: number
          id: string
          impact: string
          pdf_public_url: string | null
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
          analysis_status?: string | null
          created_at?: string
          description?: string | null
          draft_data?: Json | null
          duration: string
          fundraising_goal: number
          id?: string
          impact: string
          pdf_public_url?: string | null
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
          analysis_status?: string | null
          created_at?: string
          description?: string | null
          draft_data?: Json | null
          duration?: string
          fundraising_goal?: number
          id?: string
          impact?: string
          pdf_public_url?: string | null
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
          linkedin_followers: number | null
          linkedin_link: string | null
          location: string | null
          main_values: Json
          number_of_players: string | null
          onboarding_completed: boolean
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
          youtube_followers: number | null
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
          linkedin_followers?: number | null
          linkedin_link?: string | null
          location?: string | null
          main_values?: Json
          number_of_players?: string | null
          onboarding_completed?: boolean
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
          youtube_followers?: number | null
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
          linkedin_followers?: number | null
          linkedin_link?: string | null
          location?: string | null
          main_values?: Json
          number_of_players?: string | null
          onboarding_completed?: boolean
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
          youtube_followers?: number | null
          youtube_link?: string | null
        }
        Relationships: []
      }
      team_sponsorship_combined: {
        Row: {
          created_at: string
          fundraising_goal: number
          location: string | null
          sponsorship_offer_id: string
          team_id: string
          team_name: string
        }
        Insert: {
          created_at?: string
          fundraising_goal: number
          location?: string | null
          sponsorship_offer_id: string
          team_id: string
          team_name: string
        }
        Update: {
          created_at?: string
          fundraising_goal?: number
          location?: string | null
          sponsorship_offer_id?: string
          team_id?: string
          team_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tsc_offer"
            columns: ["sponsorship_offer_id"]
            isOneToOne: true
            referencedRelation: "sponsorship_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tsc_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
      app_role: "team" | "business" | "admin"
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
      app_role: ["team", "business", "admin"],
    },
  },
} as const
