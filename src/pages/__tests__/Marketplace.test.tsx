import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Marketplace from '../Marketplace';
import { useMarketplaceData } from '@/hooks/useMarketplaceData';
import type { Opportunity } from '@/types/marketplace';

// Mock the hooks and components
vi.mock('@/hooks/useMarketplaceData');
vi.mock('@/components/marketplace/HeaderBand', () => ({
  HeaderBand: ({ count }: { count: number }) => <div data-testid="header-band">Count: {count}</div>,
}));
vi.mock('@/components/marketplace/SearchBar', () => ({
  SearchBar: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input
      data-testid="search-bar"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search"
    />
  ),
}));
vi.mock('@/components/marketplace/FiltersButton', () => ({
  FiltersButton: ({ onClick, activeCount }: { onClick: () => void; activeCount: number }) => (
    <button data-testid="filters-button" onClick={onClick}>
      Filters ({activeCount})
    </button>
  ),
}));
vi.mock('@/components/marketplace/OpportunityCard', () => ({
  OpportunityCard: ({ opportunity, onClick }: { opportunity: Opportunity; onClick: (id: string) => void }) => (
    <div data-testid={`opportunity-${opportunity.id}`} onClick={() => onClick(opportunity.id)}>
      {opportunity.title}
    </div>
  ),
}));
vi.mock('@/components/marketplace/FiltersDrawer', () => ({
  FiltersDrawer: () => <div data-testid="filters-drawer" />,
}));
vi.mock('@/components/layout/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    sport: 'Soccer',
    title: 'Soccer Team Sponsorship',
    organization: 'Boston United FC',
    team: 'U15 Team',
    city: 'Boston',
    state: 'MA',
    players: 25,
    tier: 'Elite',
    packagesCount: 3,
    estWeekly: 2500,
    durationMonths: 12,
    raised: 15000,
    goal: 50000,
    startingAt: 5000,
    imageUrl: 'https://example.com/image.jpg',
    saved: false,
  },
  {
    id: '2',
    sport: 'Basketball',
    title: 'Basketball Team Sponsorship',
    organization: 'New York Hoops',
    team: 'U18 Team',
    city: 'New York',
    state: 'NY',
    players: 15,
    tier: 'Premier',
    packagesCount: 2,
    estWeekly: 1500,
    durationMonths: 6,
    raised: 5000,
    goal: 20000,
    startingAt: 2000,
    imageUrl: 'https://example.com/image2.jpg',
    saved: false,
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Helper to wait for async updates
const waitFor = (callback: () => void, timeout = 1000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      try {
        callback();
        clearInterval(interval);
        resolve();
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(error);
        }
      }
    }, 50);
  });
};

describe('Marketplace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(useMarketplaceData).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    const { container } = render(<Marketplace />, { wrapper: createWrapper() });
    
    const headerBand = container.querySelector('[data-testid="header-band"]');
    const searchBar = container.querySelector('[data-testid="search-bar"]');
    
    expect(headerBand).toBeInTheDocument();
    expect(searchBar).toBeInTheDocument();
  });

  it('should render opportunities when data is loaded', async () => {
    vi.mocked(useMarketplaceData).mockReturnValue({
      data: mockOpportunities,
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(<Marketplace />, { wrapper: createWrapper() });

    await waitFor(() => {
      const opp1 = container.querySelector('[data-testid="opportunity-1"]');
      const opp2 = container.querySelector('[data-testid="opportunity-2"]');
      expect(opp1).toBeInTheDocument();
      expect(opp2).toBeInTheDocument();
    });

    expect(container.textContent).toContain('Soccer Team Sponsorship');
    expect(container.textContent).toContain('Basketball Team Sponsorship');
  });

  it('should filter opportunities by search query', async () => {
    vi.mocked(useMarketplaceData).mockReturnValue({
      data: mockOpportunities,
      isLoading: false,
      error: null,
    } as any);

    const user = userEvent.setup();
    const { container } = render(<Marketplace />, { wrapper: createWrapper() });

    const searchInput = container.querySelector('[data-testid="search-bar"]') as HTMLInputElement;
    await user.type(searchInput, 'soccer');

    await waitFor(() => {
      const opp1 = container.querySelector('[data-testid="opportunity-1"]');
      const opp2 = container.querySelector('[data-testid="opportunity-2"]');
      expect(opp1).toBeInTheDocument();
      expect(opp2).not.toBeInTheDocument();
    });
  });

  it('should filter opportunities by location', async () => {
    vi.mocked(useMarketplaceData).mockReturnValue({
      data: mockOpportunities,
      isLoading: false,
      error: null,
    } as any);

    const user = userEvent.setup();
    const { container } = render(<Marketplace />, { wrapper: createWrapper() });

    const searchInput = container.querySelector('[data-testid="search-bar"]') as HTMLInputElement;
    await user.type(searchInput, 'New York');

    await waitFor(() => {
      const opp1 = container.querySelector('[data-testid="opportunity-1"]');
      const opp2 = container.querySelector('[data-testid="opportunity-2"]');
      expect(opp2).toBeInTheDocument();
      expect(opp1).not.toBeInTheDocument();
    });
  });

  it('should show empty state when no results match', async () => {
    vi.mocked(useMarketplaceData).mockReturnValue({
      data: mockOpportunities,
      isLoading: false,
      error: null,
    } as any);

    const user = userEvent.setup();
    const { container } = render(<Marketplace />, { wrapper: createWrapper() });

    const searchInput = container.querySelector('[data-testid="search-bar"]') as HTMLInputElement;
    await user.type(searchInput, 'nonexistent');

    await waitFor(() => {
      const opp1 = container.querySelector('[data-testid="opportunity-1"]');
      const opp2 = container.querySelector('[data-testid="opportunity-2"]');
      expect(opp1).not.toBeInTheDocument();
      expect(opp2).not.toBeInTheDocument();
    });
  });

  it('should show correct count in header', async () => {
    vi.mocked(useMarketplaceData).mockReturnValue({
      data: mockOpportunities,
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(<Marketplace />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(container.textContent).toContain('Count: 2');
    });
  });

  it('should render footer', async () => {
    vi.mocked(useMarketplaceData).mockReturnValue({
      data: mockOpportunities,
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(<Marketplace />, { wrapper: createWrapper() });

    const footer = container.querySelector('[data-testid="footer"]');
    expect(footer).toBeInTheDocument();
  });

  it('should debounce search input', async () => {
    vi.mocked(useMarketplaceData).mockReturnValue({
      data: mockOpportunities,
      isLoading: false,
      error: null,
    } as any);

    const user = userEvent.setup();
    const { container } = render(<Marketplace />, { wrapper: createWrapper() });

    const searchInput = container.querySelector('[data-testid="search-bar"]') as HTMLInputElement;
    
    // Type quickly
    await user.type(searchInput, 'soc');

    // Results should still show all initially
    const opp1 = container.querySelector('[data-testid="opportunity-1"]');
    const opp2 = container.querySelector('[data-testid="opportunity-2"]');
    expect(opp1).toBeInTheDocument();
    expect(opp2).toBeInTheDocument();

    // After debounce delay, filter should apply
    await new Promise(resolve => setTimeout(resolve, 500));
    await waitFor(() => {
      const opp1After = container.querySelector('[data-testid="opportunity-1"]');
      expect(opp1After).toBeInTheDocument();
    });
  });

  it('should handle opportunity click navigation', async () => {
    vi.mocked(useMarketplaceData).mockReturnValue({
      data: mockOpportunities,
      isLoading: false,
      error: null,
    } as any);

    const user = userEvent.setup();
    const { container } = render(<Marketplace />, { wrapper: createWrapper() });

    await waitFor(async () => {
      const opportunity = container.querySelector('[data-testid="opportunity-1"]') as HTMLElement;
      expect(opportunity).toBeInTheDocument();
      await user.click(opportunity);
    });

    // Navigation would be tested with proper router mocking
  });
});
