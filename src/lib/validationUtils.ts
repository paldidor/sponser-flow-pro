import { TeamProfile, SponsorshipData } from "@/types/flow";

export const validateTeamProfile = (profile: Partial<TeamProfile>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!profile.team_name || profile.team_name.trim().length === 0) {
    errors.push("Team name is required");
  }

  if (!profile.sport || profile.sport.trim().length === 0) {
    errors.push("Sport is required");
  }

  if (!profile.location || profile.location.trim().length === 0) {
    errors.push("Location is required");
  }

  if (!profile.level_of_play) {
    errors.push("Level of play is required");
  }

  if (!profile.competition_scope) {
    errors.push("Competition scope is required");
  }

  if (!profile.organization_status) {
    errors.push("Organization status is required");
  }

  if (!profile.main_values || profile.main_values.length === 0) {
    errors.push("At least one main value is required");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePDFFile = (file: File): { isValid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Only PDF files are allowed"
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: "File size must be less than 10MB"
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: "File is empty"
    };
  }

  return { isValid: true };
};

export const validateSponsorshipData = (data: Partial<SponsorshipData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.fundraisingGoal || parseFloat(data.fundraisingGoal) <= 0) {
    errors.push("Fundraising goal must be greater than 0");
  }

  if (!data.duration || data.duration.trim().length === 0) {
    errors.push("Duration is required");
  }

  if (!data.packages || data.packages.length === 0) {
    errors.push("At least one sponsorship package is required");
  }

  if (data.packages) {
    data.packages.forEach((pkg, index) => {
      if (!pkg.name || pkg.name.trim().length === 0) {
        errors.push(`Package ${index + 1}: Name is required`);
      }
      if (!pkg.price || pkg.price <= 0) {
        errors.push(`Package ${index + 1}: Price must be greater than 0`);
      }
      if (!pkg.benefits || pkg.benefits.length === 0) {
        errors.push(`Package ${index + 1}: At least one benefit is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateSocialMediaURL = (url: string, platform: string): { isValid: boolean; error?: string } => {
  if (!url || url.trim().length === 0) {
    return { isValid: true }; // Optional field
  }

  if (!validateURL(url)) {
    return {
      isValid: false,
      error: `Invalid ${platform} URL format`
    };
  }

  const platformPatterns: Record<string, RegExp> = {
    instagram: /instagram\.com/i,
    facebook: /facebook\.com|fb\.com/i,
    twitter: /twitter\.com|x\.com/i,
    linkedin: /linkedin\.com/i,
    youtube: /youtube\.com|youtu\.be/i,
    tiktok: /tiktok\.com/i,
  };

  const pattern = platformPatterns[platform.toLowerCase()];
  if (pattern && !pattern.test(url)) {
    return {
      isValid: false,
      error: `URL does not appear to be a valid ${platform} link`
    };
  }

  return { isValid: true };
};
