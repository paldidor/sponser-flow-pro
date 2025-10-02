import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfferCreation } from '../useOfferCreation';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useOfferCreation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useOfferCreation());

      expect(result.current.currentOfferId).toBeNull();
      expect(result.current.offerData).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.loadingMessage).toBe('');
    });
  });

  describe('loadOfferData', () => {
    it('should set loading state while fetching', async () => {
      const mockOffer = {
        id: '123',
        fundraising_goal: 50000,
        duration: '12 months',
        description: 'Test offer',
        sponsorship_packages: [],
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockOffer,
              error: null,
            }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useOfferCreation());

      let loadPromise: Promise<any>;
      act(() => {
        loadPromise = result.current.loadOfferData('123', 'questionnaire');
      });

      // Check loading state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.loadingMessage).toBeTruthy();

      await act(async () => {
        await loadPromise;
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.offerData).toBeTruthy();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useOfferCreation());

      let data: any;
      await act(async () => {
        data = await result.current.loadOfferData('invalid-id');
      });

      expect(data).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('publishOffer', () => {
    it('should publish offer successfully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: {},
            error: null,
          }),
        }),
      } as any);

      const { result } = renderHook(() => useOfferCreation());

      // Set an offer ID first
      let success: boolean = false;
      await act(async () => {
        success = await result.current.publishOffer('test-offer-id');
      });

      expect(result.current.isLoading).toBe(false);
      expect(success).toBe(true);
    });

    it('should return false when no offer ID provided', async () => {
      const { result } = renderHook(() => useOfferCreation());

      const success = await result.current.publishOffer();

      expect(success).toBe(false);
    });
  });

  describe('resetOffer', () => {
    it('should reset all state', async () => {
      const { result } = renderHook(() => useOfferCreation());

      // Set some state
      await act(async () => {
        await result.current.loadOfferData('123');
      });

      // Reset
      act(() => {
        result.current.resetOffer();
      });

      expect(result.current.currentOfferId).toBeNull();
      expect(result.current.offerData).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.loadingMessage).toBe('');
    });
  });
});
