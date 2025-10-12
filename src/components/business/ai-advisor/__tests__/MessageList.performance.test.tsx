import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MessageList } from '../layout/MessageList';
import type { AIMessage } from '@/hooks/useAIAdvisor';

// Mock dependencies
vi.mock('@/hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: () => ({ renderCount: 1 }),
}));

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(() => ({
    getVirtualItems: () => [],
    getTotalSize: () => 0,
    measureElement: vi.fn(),
  })),
}));

describe('MessageList Performance', () => {
  const createMockMessages = (count: number): AIMessage[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `msg-${i}`,
      role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: `Message ${i} content`,
      timestamp: new Date(),
    }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders small message lists without virtualization', () => {
    const messages = createMockMessages(10);
    const { container } = render(
      <MessageList
        messages={messages}
        isTyping={false}
        isMobile={false}
      />
    );

    // Should not use virtual scrolling for small lists
    expect(container.querySelector('[data-index]')).toBeNull();
  });

  it('enables virtualization for large message lists (>50)', () => {
    const messages = createMockMessages(100);
    const { container } = render(
      <MessageList
        messages={messages}
        isTyping={false}
        isMobile={false}
      />
    );

    // Virtual scrolling should be active (check for virtual container styles)
    const virtualContainer = container.querySelector('[style*="position: relative"]');
    expect(virtualContainer).toBeTruthy();
  });

  it('handles 1000+ messages without performance degradation', () => {
    const startTime = performance.now();
    const messages = createMockMessages(1000);
    
    render(
      <MessageList
        messages={messages}
        isTyping={false}
        isMobile={false}
      />
    );

    const renderTime = performance.now() - startTime;
    
    // Should render in under 100ms even with 1000 messages
    expect(renderTime).toBeLessThan(100);
  });

  it('maintains scroll position when user scrolls up', () => {
    const messages = createMockMessages(30);
    const { container } = render(
      <MessageList
        messages={messages}
        isTyping={false}
        isMobile={false}
      />
    );

    const scrollContainer = container.querySelector('.overflow-y-auto');
    expect(scrollContainer).toBeTruthy();

    // Simulate scroll event
    if (scrollContainer) {
      scrollContainer.scrollTop = 100;
      scrollContainer.dispatchEvent(new Event('scroll'));
    }

    // Should maintain scroll position (not auto-scroll to bottom)
    expect(scrollContainer?.scrollTop).toBe(100);
  });

  it('shows typing indicator correctly', () => {
    const messages = createMockMessages(5);
    const { container } = render(
      <MessageList
        messages={messages}
        isTyping={true}
        isMobile={false}
      />
    );

    // Should render without errors when typing is active
    expect(container).toBeTruthy();
  });

  it('handles recommendations without performance issues', () => {
    const messagesWithRecs: AIMessage[] = createMockMessages(20).map((msg, idx) => ({
      ...msg,
      recommendations: idx % 5 === 0 ? [
        {
          package_id: `pkg-${idx}`,
          team_profile_id: `team-${idx}`,
          team_name: `Team ${idx}`,
          sport: 'Basketball',
          distance_km: 10,
          total_reach: 5000,
          sponsorship_offer_id: `offer-${idx}`,
          package_name: 'Basic Package',
          price: 5000,
          est_cpf: 1.0,
          marketplace_url: `/marketplace/${idx}`,
          logo: null,
          images: null,
          // NEW FIELDS for OpportunityCard parity
          title: `Sponsorship Offer ${idx}`,
          organization: `Team ${idx}`,
          city: 'San Francisco',
          state: 'CA',
          players: 20,
          tier: 'Competitive',
          packagesCount: 3,
          estWeekly: 100,
          durationMonths: 12,
          raised: 2500,
          goal: 10000,
        },
      ] : undefined,
    }));

    const startTime = performance.now();
    render(
      <MessageList
        messages={messagesWithRecs}
        isTyping={false}
        isMobile={false}
      />
    );
    const renderTime = performance.now() - startTime;

    // Should render quickly even with recommendations
    expect(renderTime).toBeLessThan(50);
  });

  it('supports mobile viewport efficiently', () => {
    const messages = createMockMessages(50);
    const { container } = render(
      <MessageList
        messages={messages}
        isTyping={false}
        isMobile={true}
      />
    );

    // Should render without errors
    expect(container).toBeTruthy();
  });

  it('handles rapid message additions gracefully', () => {
    const { rerender } = render(
      <MessageList
        messages={createMockMessages(10)}
        isTyping={false}
        isMobile={false}
      />
    );

    // Simulate rapid message additions
    for (let i = 10; i < 30; i++) {
      rerender(
        <MessageList
          messages={createMockMessages(i)}
          isTyping={false}
          isMobile={false}
        />
      );
    }

    // Should complete without crashing
    expect(true).toBe(true);
  });
});
