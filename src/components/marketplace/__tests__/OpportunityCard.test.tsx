import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpportunityCard } from '../OpportunityCard';
import type { Opportunity } from '@/types/marketplace';

const mockOpportunity: Opportunity = {
  id: '1',
  sport: 'Soccer',
  title: 'Youth Soccer Team Sponsorship',
  organization: 'Boston United FC',
  team: 'U15 Elite Team',
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
  imageUrl: 'https://picsum.photos/seed/100/640/256',
  saved: false,
};

describe('OpportunityCard', () => {
  it('should render opportunity details correctly', () => {
    render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('Youth Soccer Team Sponsorship')).toBeInTheDocument();
    expect(screen.getByText('Boston United FC')).toBeInTheDocument();
    expect(screen.getByText('U15 Elite Team')).toBeInTheDocument();
    expect(screen.getByText('Boston, MA')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Elite')).toBeInTheDocument();
  });

  it('should display stats correctly', () => {
    render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('3 packages')).toBeInTheDocument();
    expect(screen.getByText('~2,500/wk')).toBeInTheDocument();
    expect(screen.getByText('12mo')).toBeInTheDocument();
  });

  it('should display pricing information', () => {
    render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText(/starting at/i)).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={handleClick}
      />
    );

    const card = screen.getByRole('article');
    await user.click(card);

    expect(handleClick).toHaveBeenCalledWith('1');
  });

  it('should call onSave when bookmark button is clicked', async () => {
    const handleSave = vi.fn();
    const user = userEvent.setup();
    render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={handleSave}
        onClick={vi.fn()}
      />
    );

    const bookmarkButton = screen.getByRole('button', { name: /save opportunity/i });
    await user.click(bookmarkButton);

    expect(handleSave).toHaveBeenCalledWith('1');
  });

  it('should prevent card click when bookmark is clicked', async () => {
    const handleClick = vi.fn();
    const handleSave = vi.fn();
    const user = userEvent.setup();
    
    render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={handleSave}
        onClick={handleClick}
      />
    );

    const bookmarkButton = screen.getByRole('button', { name: /save opportunity/i });
    await user.click(bookmarkButton);

    expect(handleSave).toHaveBeenCalledWith('1');
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show different bookmark icon when saved', () => {
    const savedOpportunity = { ...mockOpportunity, saved: true };
    
    const { rerender } = render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    let bookmarkButton = screen.getByRole('button', { name: /save opportunity/i });
    expect(bookmarkButton.className).toContain('text-muted-foreground');

    rerender(
      <OpportunityCard
        opportunity={savedOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    bookmarkButton = screen.getByRole('button', { name: /save opportunity/i });
    expect(bookmarkButton.className).toContain('text-primary');
  });

  it('should display image with correct src', () => {
    render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    const image = screen.getByRole('img') as HTMLImageElement;
    expect(image.src).toContain('picsum.photos');
  });

  it('should have View Details button', () => {
    render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
  });

  it('should have proper touch target size for mobile', () => {
    render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    const bookmarkButton = screen.getByRole('button', { name: /save opportunity/i });
    expect(bookmarkButton.className).toContain('h-11');
    expect(bookmarkButton.className).toContain('w-11');
  });

  it('should show progress bar with correct value', () => {
    render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    // Progress should be 30% (15000/50000)
    const progressText = screen.getByText('30% funded');
    expect(progressText).toBeInTheDocument();
  });
});
