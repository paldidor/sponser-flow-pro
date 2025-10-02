import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('should render with placeholder text', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText(/search opportunities/i)).toBeInTheDocument();
  });

  it('should display the current value', () => {
    render(<SearchBar value="soccer" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('soccer');
  });

  it('should call onChange when input changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'basketball');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should show clear button when value is not empty', () => {
    render(<SearchBar value="test query" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
  });

  it('should clear input when clear button is clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar value="test query" onChange={handleChange} />);
    
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    await user.click(clearButton);
    
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('should have correct autocomplete attributes for mobile', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    
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
    render(<SearchBar value="test" onChange={vi.fn()} />);
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    
    // Check that button has appropriate size classes
    expect(clearButton.className).toContain('h-11');
    expect(clearButton.className).toContain('w-11');
  });
});
