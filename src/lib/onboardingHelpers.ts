/**
 * Onboarding Helper Utilities
 * Step mapping, validation, and data transformation for team onboarding flow
 */

export type OnboardingStep =
  | 'create-profile'
  | 'profile-review'
  | 'select-method'
  | 'website-analysis'
  | 'pdf-upload'
  | 'questionnaire'
  | 'review';

export type DBOnboardingStep = 
  | 'account_created' 
  | 'team_profile' 
  | 'website_analyzed' 
  | 'packages' 
  | 'review' 
  | 'completed';

// Map UI steps to DB enum values for step tracking
export const STEP_TO_DB_ENUM: Record<OnboardingStep, DBOnboardingStep> = {
  'create-profile': 'account_created',
  'profile-review': 'team_profile',
  'select-method': 'team_profile',
  'website-analysis': 'website_analyzed',
  'pdf-upload': 'website_analyzed',
  'questionnaire': 'packages',
  'review': 'review',
};

// Map DB enum values back to UI steps for resume logic
export const DB_ENUM_TO_STEP: Record<DBOnboardingStep, OnboardingStep> = {
  'account_created': 'create-profile',
  'team_profile': 'profile-review',
  'website_analyzed': 'select-method',
  'packages': 'questionnaire',
  'review': 'review',
  'completed': 'review', // Should not happen, but safety net
};

/**
 * Determine the previous step in the onboarding flow
 */
export const getPreviousStep = (
  currentStep: OnboardingStep,
  hasAnalysisFileName: boolean
): OnboardingStep | null => {
  switch (currentStep) {
    case 'profile-review':
      return 'create-profile';
    case 'select-method':
      return 'profile-review';
    case 'website-analysis':
    case 'pdf-upload':
    case 'questionnaire':
      return 'select-method';
    case 'review':
      return hasAnalysisFileName ? 'pdf-upload' : 'questionnaire';
    default:
      return null;
  }
};

/**
 * Check if onboarding is fully completed based on profile data
 */
export const isOnboardingFullyCompleted = (profile: any): boolean => {
  return Boolean(
    profile?.onboarding_completed && 
    profile?.current_onboarding_step === 'completed'
  );
};

/**
 * Get the resume step from a DB profile
 */
export const getResumeStep = (dbStep: string): OnboardingStep => {
  return DB_ENUM_TO_STEP[dbStep as DBOnboardingStep] || 'create-profile';
};
