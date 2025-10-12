export interface SponsorshipPackage {
  id: string;
  name: string;
  price: number;
  description?: string;
  sponsorship_offer_id: string;
  package_order: number;
  status: "sold-active" | "live" | "draft" | "inactive";
  duration?: string;
  sponsor_name?: string;
  open_tasks?: number;
  placements: PlacementOption[];
  created_at: string;
  updated_at: string;
}

export interface PlacementOption {
  id: string;
  name: string;
  category: string;
  description?: string;
  is_popular: boolean;
  value?: number; // For quantity-based placements like social posts
}

export interface SponsorshipOffer {
  id: string;
  title: string;
  user_id: string;
  team_profile_id?: string;
  fundraising_goal: number;
  duration: string;
  impact: string;
  status: string;
  packages: SponsorshipPackage[];
  created_at: string;
  updated_at: string;
}

export interface ActivationTask {
  id: string;
  task_name: string;
  due_date: string;
  package_name: string;
  sponsor_name: string;
  description: string;
  status: "in-progress" | "stuck" | "complete";
  created_at: string;
}

export interface ActiveSponsor {
  id: string;
  name: string;
  logo_url?: string;
  bio?: string;
  website?: string;
  social_links: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  package_type: string;
  creative_assets: string[];
}

export interface BusinessSponsorship {
  id: string;
  team: string;
  status: 'Active' | 'Activation' | 'Inactive';
  teamType: string;
  location: string;
  sport: string;
  amount: string;
  exposure: string;
  clicks: number;
  conversions: number;
  packageName: string;
  teamId: string;
  packageId: string;
}
