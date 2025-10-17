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
      ai_conversations: {
        Row: {
          business_profile_id: string | null
          channel: string
          created_at: string | null
          id: string
          last_activity_at: string | null
          metadata: Json | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_profile_id?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_profile_id?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          message_id: string | null
          package_id: string | null
          recommendation_data: Json | null
          recommendation_reason: string | null
          sponsorship_offer_id: string | null
          user_action: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          message_id?: string | null
          package_id?: string | null
          recommendation_data?: Json | null
          recommendation_reason?: string | null
          sponsorship_offer_id?: string | null
          user_action?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          message_id?: string | null
          package_id?: string | null
          recommendation_data?: Json | null
          recommendation_reason?: string | null
          sponsorship_offer_id?: string | null
          user_action?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendations_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ai_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendations_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendations_sponsorship_offer_id_fkey"
            columns: ["sponsorship_offer_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_offer_pricing_summary"
            referencedColumns: ["sponsorship_offer_id"]
          },
          {
            foreignKeyName: "ai_recommendations_sponsorship_offer_id_fkey"
            columns: ["sponsorship_offer_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_user_preferences: {
        Row: {
          avoided_offers: string[] | null
          budget_range: unknown | null
          created_at: string | null
          id: string
          interaction_patterns: Json | null
          preferred_locations: string[] | null
          preferred_sports: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avoided_offers?: string[] | null
          budget_range?: unknown | null
          created_at?: string | null
          id?: string
          interaction_patterns?: Json | null
          preferred_locations?: string[] | null
          preferred_sports?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avoided_offers?: string[] | null
          budget_range?: unknown | null
          created_at?: string | null
          id?: string
          interaction_patterns?: Json | null
          preferred_locations?: string[] | null
          preferred_sports?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      business_profiles: {
        Row: {
          analysis_error: string | null
          analysis_started_at: string | null
          analysis_status: string | null
          business_name: string
          city: string
          company_bio: string | null
          created_at: string
          current_onboarding_step: string
          domain: string | null
          facebook_link: string | null
          id: string
          industry: string
          instagram_link: string | null
          linkedin_link: string | null
          location_lat: number | null
          location_lon: number | null
          main_values: Json | null
          markets_served: string | null
          number_of_employees: string | null
          onboarding_completed: boolean
          seed_url: string | null
          sources: Json | null
          state: string
          tiktok_link: string | null
          twitter_link: string | null
          updated_at: string
          user_id: string
          website: string | null
          youtube_link: string | null
          zip_code: string | null
        }
        Insert: {
          analysis_error?: string | null
          analysis_started_at?: string | null
          analysis_status?: string | null
          business_name: string
          city: string
          company_bio?: string | null
          created_at?: string
          current_onboarding_step?: string
          domain?: string | null
          facebook_link?: string | null
          id?: string
          industry: string
          instagram_link?: string | null
          linkedin_link?: string | null
          location_lat?: number | null
          location_lon?: number | null
          main_values?: Json | null
          markets_served?: string | null
          number_of_employees?: string | null
          onboarding_completed?: boolean
          seed_url?: string | null
          sources?: Json | null
          state: string
          tiktok_link?: string | null
          twitter_link?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          youtube_link?: string | null
          zip_code?: string | null
        }
        Update: {
          analysis_error?: string | null
          analysis_started_at?: string | null
          analysis_status?: string | null
          business_name?: string
          city?: string
          company_bio?: string | null
          created_at?: string
          current_onboarding_step?: string
          domain?: string | null
          facebook_link?: string | null
          id?: string
          industry?: string
          instagram_link?: string | null
          linkedin_link?: string | null
          location_lat?: number | null
          location_lon?: number | null
          main_values?: Json | null
          markets_served?: string | null
          number_of_employees?: string | null
          onboarding_completed?: boolean
          seed_url?: string | null
          sources?: Json | null
          state?: string
          tiktok_link?: string | null
          twitter_link?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          youtube_link?: string | null
          zip_code?: string | null
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
          duration_years: number | null
          fundraising_goal: number | null
          id: string
          impact: string
          pdf_public_url: string | null
          season_end_date: string | null
          season_start_date: string | null
          source: string
          source_file_name: string | null
          status: string
          supported_players: number | null
          team_profile_id: string
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
          duration_years?: number | null
          fundraising_goal?: number | null
          id?: string
          impact: string
          pdf_public_url?: string | null
          season_end_date?: string | null
          season_start_date?: string | null
          source?: string
          source_file_name?: string | null
          status?: string
          supported_players?: number | null
          team_profile_id: string
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
          duration_years?: number | null
          fundraising_goal?: number | null
          id?: string
          impact?: string
          pdf_public_url?: string | null
          season_end_date?: string | null
          season_start_date?: string | null
          source?: string
          source_file_name?: string | null
          status?: string
          supported_players?: number | null
          team_profile_id?: string
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
          status: string
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
          status?: string
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
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sponsorship_packages_offer"
            columns: ["sponsorship_offer_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_offer_pricing_summary"
            referencedColumns: ["sponsorship_offer_id"]
          },
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
            referencedRelation: "sponsorship_offer_pricing_summary"
            referencedColumns: ["sponsorship_offer_id"]
          },
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
          current_onboarding_step: Database["public"]["Enums"]["onboarding_step"]
          domain: string | null
          email_list_size: number | null
          facebook_followers: number | null
          facebook_link: string | null
          id: string
          images: string[] | null
          instagram_followers: number | null
          instagram_link: string | null
          level_of_play: string | null
          linkedin_followers: number | null
          linkedin_link: string | null
          location: string | null
          location_lat: number | null
          location_lon: number | null
          logo: string | null
          main_values: Json
          number_of_players: string | null
          onboarding_completed: boolean
          organization_status: string | null
          reach: number | null
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
          current_onboarding_step?: Database["public"]["Enums"]["onboarding_step"]
          domain?: string | null
          email_list_size?: number | null
          facebook_followers?: number | null
          facebook_link?: string | null
          id?: string
          images?: string[] | null
          instagram_followers?: number | null
          instagram_link?: string | null
          level_of_play?: string | null
          linkedin_followers?: number | null
          linkedin_link?: string | null
          location?: string | null
          location_lat?: number | null
          location_lon?: number | null
          logo?: string | null
          main_values?: Json
          number_of_players?: string | null
          onboarding_completed?: boolean
          organization_status?: string | null
          reach?: number | null
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
          current_onboarding_step?: Database["public"]["Enums"]["onboarding_step"]
          domain?: string | null
          email_list_size?: number | null
          facebook_followers?: number | null
          facebook_link?: string | null
          id?: string
          images?: string[] | null
          instagram_followers?: number | null
          instagram_link?: string | null
          level_of_play?: string | null
          linkedin_followers?: number | null
          linkedin_link?: string | null
          location?: string | null
          location_lat?: number | null
          location_lon?: number | null
          logo?: string | null
          main_values?: Json
          number_of_players?: string | null
          onboarding_completed?: boolean
          organization_status?: string | null
          reach?: number | null
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
      sponsorship_offer_pricing_summary: {
        Row: {
          max_package_price: number | null
          min_package_price: number | null
          sponsorship_offer_id: string | null
          sponsorship_offer_name: string | null
          team_profilename: string | null
          total_packages: number | null
        }
        Relationships: []
      }
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
      km_between: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      rpc_estimate_roi: {
        Args: {
          p_category_slug?: string
          p_package_id: string
          p_team_profile_id: string
        }
        Returns: {
          est_cpf: number
          est_reach: number
          notes: string
        }[]
      }
      rpc_get_team_packages: {
        Args: {
          p_budget_max?: number
          p_budget_min?: number
          p_team_profile_id: string
        }
        Returns: {
          benefits: string[]
          description: string
          name: string
          package_id: string
          price: number
          status: string
        }[]
      }
      rpc_recommend_offers: {
        Args: {
          p_base_url?: string
          p_budget_max?: number
          p_budget_min?: number
          p_category_slug?: string
          p_lat: number
          p_limit?: number
          p_lon: number
          p_radius_km: number
          p_sport?: string
        }
        Returns: {
          distance_km: number
          est_cpf: number
          images: string[]
          logo: string
          marketplace_url: string
          package_id: string
          package_name: string
          price: number
          sponsorship_offer_id: string
          sport: string
          team_name: string
          team_profile_id: string
          total_reach: number
        }[]
      }
      rpc_search_teams_by_target: {
        Args: {
          p_budget_max?: number
          p_budget_min?: number
          p_lat: number
          p_lon: number
          p_radius_km: number
          p_sport?: string
        }
        Returns: {
          best_price: number
          distance_km: number
          score: number
          team_name: string
          team_profile_id: string
          total_reach: number
        }[]
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
      onboarding_step:
        | "account_created"
        | "team_profile"
        | "website_analyzed"
        | "packages"
        | "review"
        | "completed"
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
      onboarding_step: [
        "account_created",
        "team_profile",
        "website_analyzed",
        "packages",
        "review",
        "completed",
      ],
    },
  },
} as const
