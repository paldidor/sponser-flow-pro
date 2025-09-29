export type FlowStep =
  | "landing"
  | "auth"
  | "congratulations"
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
  name: string;
  bio: string;
  location: string;
  images: string[];
  socialStats: {
    instagram: number;
    facebook: number;
    twitter: number;
  };
  playerCount: number;
  sport: string;
  emailListSize?: number;
  competitionLevel: "local" | "regional" | "national";
  seasonSchedule?: string;
  organizationStatus: "nonprofit" | "private";
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
