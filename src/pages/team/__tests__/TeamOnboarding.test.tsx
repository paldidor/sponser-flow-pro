import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TeamOnboarding from '../TeamOnboarding';

// Mock hooks and dependencies
vi.mock('@/hooks/useOnboardingState', () => ({
  useOnboardingState: vi.fn(() => ({
    currentStep: 'create-profile',
    setCurrentStep: vi.fn(),
    teamData: null,
    setTeamData: vi.fn(),
    isManualEntry: false,
    setIsManualEntry: vi.fn(),
    isInitializing: false,
    isCheckingProfile: false,
    verifyTeamProfile: vi.fn(),
  })),
}));

vi.mock('@/hooks/useProfileSubmission', () => ({
  useProfileSubmission: vi.fn(() => ({
    handleProfileApprove: vi.fn(),
    completeOnboarding: vi.fn(),
  })),
}));

vi.mock('@/hooks/useOfferCreation', () => ({
  useOfferCreation: vi.fn(() => ({
    currentOfferId: null,
    offerData: null,
    isLoading: false,
    loadingMessage: '',
    loadOfferData: vi.fn(),
    loadLatestQuestionnaireOffer: vi.fn(),
    publishOffer: vi.fn(),
  })),
}));

vi.mock('@/hooks/usePDFAnalysisPolling', () => ({
  usePDFAnalysisPolling: vi.fn(() => ({
    startPolling: vi.fn(),
  })),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

// Mock child components
vi.mock('../onboarding/ProfileCreationStep', () => ({
  ProfileCreationStep: () => <div data-testid="profile-creation-step">Profile Creation Step</div>,
}));

vi.mock('../onboarding/OfferCreationStep', () => ({
  OfferCreationStep: () => <div data-testid="offer-creation-step">Offer Creation Step</div>,
}));

vi.mock('../onboarding/ReviewStep', () => ({
  ReviewStep: () => <div data-testid="review-step">Review Step</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TeamOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should render loading state when initializing', () => {
      const { useOnboardingState } = require('@/hooks/useOnboardingState');
      useOnboardingState.mockReturnValue({
        currentStep: 'create-profile',
        isInitializing: true,
        isCheckingProfile: false,
      });

      const { getByText } = renderWithRouter(<TeamOnboarding />);
      
      expect(getByText('Loading Your Profile')).toBeInTheDocument();
    });

    it('should render profile verification state when checking profile', () => {
      const { useOnboardingState } = require('@/hooks/useOnboardingState');
      useOnboardingState.mockReturnValue({
        currentStep: 'create-profile',
        isInitializing: false,
        isCheckingProfile: true,
      });

      const { getByText } = renderWithRouter(<TeamOnboarding />);
      
      expect(getByText('Verifying Profile')).toBeInTheDocument();
    });
  });

  describe('Step Rendering', () => {
    it('should render ProfileCreationStep when on create-profile step', () => {
      const { useOnboardingState } = require('@/hooks/useOnboardingState');
      useOnboardingState.mockReturnValue({
        currentStep: 'create-profile',
        isInitializing: false,
        isCheckingProfile: false,
      });

      const { getByTestId } = renderWithRouter(<TeamOnboarding />);
      
      expect(getByTestId('profile-creation-step')).toBeInTheDocument();
    });

    it('should render ProfileCreationStep when on profile-review step', () => {
      const { useOnboardingState } = require('@/hooks/useOnboardingState');
      useOnboardingState.mockReturnValue({
        currentStep: 'profile-review',
        isInitializing: false,
        isCheckingProfile: false,
      });

      const { getByTestId } = renderWithRouter(<TeamOnboarding />);
      
      expect(getByTestId('profile-creation-step')).toBeInTheDocument();
    });

    it('should render OfferCreationStep when on select-method step', () => {
      const { useOnboardingState } = require('@/hooks/useOnboardingState');
      useOnboardingState.mockReturnValue({
        currentStep: 'select-method',
        isInitializing: false,
        isCheckingProfile: false,
      });

      const { getByTestId } = renderWithRouter(<TeamOnboarding />);
      
      expect(getByTestId('offer-creation-step')).toBeInTheDocument();
    });

    it('should render ReviewStep when on review step', () => {
      const { useOnboardingState } = require('@/hooks/useOnboardingState');
      useOnboardingState.mockReturnValue({
        currentStep: 'review',
        isInitializing: false,
        isCheckingProfile: false,
      });

      const { useOfferCreation } = require('@/hooks/useOfferCreation');
      useOfferCreation.mockReturnValue({
        offerData: { id: '123', title: 'Test Offer' },
        isLoading: false,
      });

      const { getByTestId } = renderWithRouter(<TeamOnboarding />);
      
      expect(getByTestId('review-step')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should have proper component structure', () => {
      const { useOnboardingState } = require('@/hooks/useOnboardingState');
      useOnboardingState.mockReturnValue({
        currentStep: 'create-profile',
        isInitializing: false,
        isCheckingProfile: false,
      });

      const { container } = renderWithRouter(<TeamOnboarding />);
      
      expect(container.querySelector('.min-h-\\[calc\\(100vh-4rem\\)\\]')).toBeInTheDocument();
    });
  });
});
