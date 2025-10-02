# Marketplace Component Tests

## Overview
This directory contains tests for the marketplace feature components.

## Test Files

### SearchBar.test.tsx
Tests for the search input component including:
- Rendering with placeholder text
- Value display and updates
- Clear button functionality
- Mobile-specific attributes (autocomplete, autocorrect, etc.)
- Touch target sizing for accessibility

### OpportunityCard.test.tsx
Tests for individual opportunity card components:
- Rendering opportunity details (title, organization, location, etc.)
- Stats display (packages, reach, duration)
- Pricing information
- Click handlers for card and bookmark
- Event propagation (preventing card click when bookmarking)
- Visual states (saved vs unsaved)
- Mobile touch targets
- Progress bar display

### Marketplace Integration Tests (../pages/__tests__/Marketplace.test.tsx)
Integration tests for the full marketplace page:
- Loading states
- Data fetching and display
- Search functionality with debouncing
- Filtering by multiple criteria
- Empty states
- Header count updates
- Footer rendering
- Navigation handling

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test SearchBar.test.tsx
```

## Coverage Goals
- Unit tests: 80%+ coverage for utilities
- Component tests: 70%+ coverage for UI components
- Integration tests: Key user flows covered

## Testing Patterns

### Component Testing
```tsx
import { render, screen, fireEvent } from '@testing-library/react';

render(<Component {...props} />);
const element = screen.getByRole('button');
fireEvent.click(element);
expect(element).toBeInTheDocument();
```

### Mocking Data
```tsx
const mockOpportunity: Opportunity = {
  id: '1',
  title: 'Test',
  // ... other required fields
};
```

### Async Testing
```tsx
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## Best Practices
1. Test user behavior, not implementation details
2. Use accessible queries (getByRole, getByLabelText)
3. Mock external dependencies (hooks, API calls)
4. Test error states and edge cases
5. Ensure mobile-specific features are tested
6. Keep tests focused and readable

## Future Enhancements
- Add E2E tests with Playwright
- Add visual regression tests
- Test performance metrics
- Add accessibility audits
