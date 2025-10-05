export type FlowStep =
  | "landing"
  | "auth"
  | "create-profile"
  | "profile-review"
  | "create-offer"
  | "fundraising-goal"
  | "impact-selection"
  | "supported-players"
  | "duration-selection"
  | "package-builder"
  | "website-input"
  | "website-analysis"
  | "pdf-input"
  | "pdf-analysis"
  | "sponsorship-review"
  | "marketplace";

export interface MultiStepOfferData {
  fundraisingGoal?: string;
  impactTags?: string[];
  supportedPlayers?: number;
  duration?: string;
  packages?: EnhancedSponsorshipPackage[];
  currentStep: number;
}

export interface EnhancedSponsorshipPackage {
  id: string;
  name: string;
  price: number;
  placementIds: string[];
}

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
  instagram_link?: string;
  facebook_link?: string;
  linkedin_link?: string;
  youtube_link?: string;
  twitter_link?: string;
  instagram_followers?: number;
  facebook_followers?: number;
  linkedin_followers?: number;
  twitter_followers?: number;
  youtube_followers?: number;
  email_list_size?: number;
  reach?: number;
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
  source: "form" | "website" | "pdf" | "questionnaire";
  sourceUrl?: string;
  fileName?: string;
}
