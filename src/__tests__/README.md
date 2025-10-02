# Testing Documentation

## Overview

This project includes comprehensive testing for the team onboarding flow, covering:
- Unit tests for validation utilities
- Unit tests for custom hooks
- Integration test scenarios
- Manual testing checklists

## Running Tests

### Unit Tests

Run all unit tests:
```bash
npm run test
```

Run tests in watch mode (during development):
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests with UI:
```bash
npm run test:ui
```

### Test Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Test Structure

```
src/
├── __tests__/
│   ├── setup.ts                      # Test setup and configuration
│   ├── README.md                     # This file
│   ├── integration/
│   │   └── OnboardingFlow.test.md   # Integration test scenarios
│   └── manual/
│       └── TestingChecklist.md      # Manual testing checklist
├── lib/
│   └── __tests__/
│       └── validationUtils.test.ts  # Validation utility tests
└── hooks/
    └── __tests__/
        └── useOfferCreation.test.ts # Hook tests
```

## What's Tested

### Validation Utilities (`src/lib/__tests__/validationUtils.test.ts`)

✅ Team Profile Validation
- Required fields (team_name, sport, location, etc.)
- Main values array validation
- All validation error scenarios

✅ PDF File Validation
- File type checking (PDF only)
- File size limits (< 10MB)
- Empty file detection

✅ Sponsorship Data Validation
- Fundraising goal > 0
- Duration presence
- Package validation (name, price, benefits)

✅ Email Validation
- Valid email formats
- Invalid email rejection

✅ URL Validation
- Valid URL formats
- Protocol requirements

✅ Social Media URL Validation
- Platform-specific URL patterns
- Instagram, Facebook, Twitter, LinkedIn, YouTube
- Mismatch detection

### Custom Hooks (`src/hooks/__tests__/useOfferCreation.test.ts`)

✅ Initial State
- Correct default values

✅ Load Offer Data
- Loading state management
- Error handling
- Data formatting

✅ Load Latest Questionnaire Offer
- Authentication check
- Latest offer retrieval

✅ Publish Offer
- Success scenarios
- Error handling
- Missing ID handling

✅ Reset Offer
- State cleanup

## Integration Testing

See `src/__tests__/integration/OnboardingFlow.test.md` for detailed integration test scenarios covering:

1. **New User Profile Creation Flow**
2. **Returning User Navigation**
3. **Questionnaire-Based Offer Creation**
4. **PDF-Based Offer Creation**
5. **Profile Editing During Onboarding**
6. **Authentication Edge Cases**
7. **Loading States**

Each scenario includes:
- Setup steps
- Expected results
- Error cases
- Validation requirements

## Manual Testing

Use `src/__tests__/manual/TestingChecklist.md` for comprehensive manual testing.

The checklist covers:
- First-time user experience
- Questionnaire flow
- PDF upload flow
- Returning user flow
- Error handling
- Loading states
- Back navigation
- Validation
- Accessibility
- Mobile responsiveness
- Performance

## Writing New Tests

### Unit Tests

Example of adding a new validation test:

```typescript
import { describe, it, expect } from 'vitest';
import { myNewValidator } from '../myUtils';

describe('myNewValidator', () => {
  it('should validate correct input', () => {
    const result = myNewValidator('valid-input');
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid input', () => {
    const result = myNewValidator('invalid');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Hook Tests

Example of testing a custom hook:

```typescript
import { renderHook, act } from '@testing-library/react';
import { myCustomHook } from '../myCustomHook';

describe('myCustomHook', () => {
  it('should have correct initial state', () => {
    const { result } = renderHook(() => myCustomHook());
    expect(result.current.value).toBe(initialValue);
  });

  it('should update state correctly', async () => {
    const { result } = renderHook(() => myCustomHook());
    
    await act(async () => {
      await result.current.updateValue('new-value');
    });

    expect(result.current.value).toBe('new-value');
  });
});
```

## Coverage Goals

Target coverage levels:
- **Validation utilities**: 100% (critical business logic)
- **Custom hooks**: 90%+
- **Components**: 80%+ (focus on business logic)
- **Overall**: 80%+

## Continuous Integration

These tests should be run in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:coverage
```

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Mock External Dependencies**: Mock Supabase, auth, etc.
4. **Test Edge Cases**: Don't just test happy paths
5. **Keep Tests Fast**: Unit tests should run in milliseconds
6. **Avoid Implementation Details**: Test behavior, not implementation

## Common Issues

### Mock Not Working
Ensure mocks are set up before the component/hook is imported:
```typescript
vi.mock('@/integrations/supabase/client', () => ({...}));
// Then import the hook/component
```

### Async Tests Hanging
Always use `await` with `act()` for async operations:
```typescript
await act(async () => {
  await asyncFunction();
});
```

### Type Errors in Tests
Use `as any` sparingly for complex mocks, but prefer proper typing:
```typescript
vi.mocked(supabase.from).mockReturnValue({...} as any);
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Support

For testing questions or issues:
1. Check this README
2. Review existing test files for examples
3. Consult the manual testing checklist
4. Review integration test scenarios
