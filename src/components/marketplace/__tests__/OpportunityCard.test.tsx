import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
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
    const { container } = render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(container.textContent).toContain('Youth Soccer Team Sponsorship');
    expect(container.textContent).toContain('Boston United FC');
    expect(container.textContent).toContain('U15 Elite Team');
    expect(container.textContent).toContain('Boston, MA');
    expect(container.textContent).toContain('25');
    expect(container.textContent).toContain('Elite');
  });

  it('should display stats correctly', () => {
    const { container } = render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(container.textContent).toContain('3 packages');
    expect(container.textContent).toContain('~2,500/wk');
    expect(container.textContent).toContain('12mo');
  });

  it('should display pricing information', () => {
    const { container } = render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(container.textContent).toMatch(/starting at/i);
    expect(container.textContent).toContain('$5,000');
  });

  it('should call onClick when card is clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={handleClick}
      />
    );

    const card = container.querySelector('[role="article"]') as HTMLElement;
    await user.click(card);

    expect(handleClick).toHaveBeenCalledWith('1');
  });

  it('should call onSave when bookmark button is clicked', async () => {
    const handleSave = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={handleSave}
        onClick={vi.fn()}
      />
    );

    const bookmarkButton = container.querySelector('button[aria-label*="Save"]') as HTMLButtonElement;
    await user.click(bookmarkButton);

    expect(handleSave).toHaveBeenCalledWith('1');
  });

  it('should prevent card click when bookmark is clicked', async () => {
    const handleClick = vi.fn();
    const handleSave = vi.fn();
    const user = userEvent.setup();
    
    const { container } = render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={handleSave}
        onClick={handleClick}
      />
    );

    const bookmarkButton = container.querySelector('button[aria-label*="Save"]') as HTMLButtonElement;
    await user.click(bookmarkButton);

    expect(handleSave).toHaveBeenCalledWith('1');
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show different bookmark icon when saved', () => {
    const savedOpportunity = { ...mockOpportunity, saved: true };
    
    const { container, rerender } = render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    let bookmarkButton = container.querySelector('button[aria-label*="Save"]') as HTMLButtonElement;
    expect(bookmarkButton.className).toContain('text-muted-foreground');

    rerender(
      <OpportunityCard
        opportunity={savedOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    bookmarkButton = container.querySelector('button[aria-label*="Save"]') as HTMLButtonElement;
    expect(bookmarkButton.className).toContain('text-primary');
  });

  it('should display image with correct src', () => {
    const { container } = render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    const image = container.querySelector('img') as HTMLImageElement;
    expect(image.src).toContain('picsum.photos');
  });

  it('should have View Details button', () => {
    const { container } = render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    const button = container.querySelector('button');
    expect(button?.textContent).toMatch(/view details/i);
  });

  it('should have proper touch target size for mobile', () => {
    const { container } = render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    const bookmarkButton = container.querySelector('button[aria-label*="Save"]') as HTMLButtonElement;
    expect(bookmarkButton.className).toContain('h-11');
    expect(bookmarkButton.className).toContain('w-11');
  });

  it('should show progress bar with correct value', () => {
    const { container } = render(
      <OpportunityCard
        opportunity={mockOpportunity}
        onSave={vi.fn()}
        onClick={vi.fn()}
      />
    );

    // Progress should be 30% (15000/50000)
    expect(container.textContent).toContain('30% funded');
  });
});
