export type FlowStep =
  | "landing"
  | "auth"
  | "create-profile"
  | "profile-review"
  | "create-offer"
  | "form"
  | "website-input"
  | "website-analysis"
  | "pdf-input"
  | "pdf-analysis"
  | "sponsorship-review"
  | "marketplace";

export interface SocialLinks {
  website: string;
  facebook: string;
  instagram: string;
  additionalSocials: Array<{ platform: string; url: string }>;
}

export interface TeamProfile {
  team_name: string;
  main_values: string[];
  location: string;
  team_bio: string;
  sport: string;
  number_of_players: string;
  level_of_play: string;
  competition_scope: string;
  season_start_date?: string;
  season_end_date?: string;
  organization_status: string;
  instagram_followers?: number;
  facebook_followers?: number;
  twitter_followers?: number;
  email_list_size?: number;
  images?: string[];
}

export interface SponsorshipPackage {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  placements: string[];
}

export interface SponsorshipData {
  fundraisingGoal: string;
  duration: string;
  description?: string;
  packages: SponsorshipPackage[];
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  source: "form" | "website" | "pdf";
  sourceUrl?: string;
  fileName?: string;
}
