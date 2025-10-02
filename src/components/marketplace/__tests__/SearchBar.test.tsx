import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('should render with placeholder text', () => {
    const { container } = render(<SearchBar value="" onChange={vi.fn()} />);
    const input = container.querySelector('input[placeholder*="Search opportunities"]');
    expect(input).toBeInTheDocument();
  });

  it('should display the current value', () => {
    const { container } = render(<SearchBar value="soccer" onChange={vi.fn()} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('soccer');
  });

  it('should call onChange when input changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<SearchBar value="" onChange={handleChange} />);
    
    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, 'basketball');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should show clear button when value is not empty', () => {
    const { container } = render(<SearchBar value="test query" onChange={vi.fn()} />);
    const clearButton = container.querySelector('button[aria-label*="Clear"]');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    const { container } = render(<SearchBar value="" onChange={vi.fn()} />);
    const clearButton = container.querySelector('button[aria-label*="Clear"]');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should clear input when clear button is clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<SearchBar value="test query" onChange={handleChange} />);
    
    const clearButton = container.querySelector('button[aria-label*="Clear"]') as HTMLButtonElement;
    await user.click(clearButton);
    
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('should have correct autocomplete attributes for mobile', () => {
    const { container } = render(<SearchBar value="" onChange={vi.fn()} />);
    const input = container.querySelector('input') as HTMLInputElement;
    
    expect(input).toHaveAttribute('autoComplete', 'off');
    expect(input).toHaveAttribute('autoCorrect', 'off');
    expect(input).toHaveAttribute('autoCapitalize', 'off');
    expect(input).toHaveAttribute('spellCheck', 'false');
  });

  it('should have search icon', () => {
    const { container } = render(<SearchBar value="" onChange={vi.fn()} />);
    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should have minimum touch target size for mobile', () => {
    const { container } = render(<SearchBar value="test" onChange={vi.fn()} />);
    const clearButton = container.querySelector('button[aria-label*="Clear"]') as HTMLButtonElement;
    
    // Check that button has appropriate size classes
    expect(clearButton.className).toContain('h-11');
    expect(clearButton.className).toContain('w-11');
  });
});
