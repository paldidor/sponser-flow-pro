# Performance Testing Guide - Questionnaire Flow

## Overview
This document outlines performance testing procedures to ensure the multi-step questionnaire delivers excellent performance across all devices and network conditions.

---

## 1. Core Web Vitals Testing

### 1.1 Largest Contentful Paint (LCP)

**Target**: < 2.5 seconds

#### What is LCP?
Time until the largest content element becomes visible in the viewport.

#### How to Test
```
Tools:
1. Chrome DevTools Lighthouse
2. Web Vitals Extension
3. PageSpeed Insights
4. WebPageTest.org

Steps:
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Performance" + "Mobile"
4. Click "Generate report"
5. Find LCP metric
```

#### Elements to Monitor
```
Likely LCP candidates:
- Step heading (h1)
- First card (Quick Select or main card)
- Hero image (if any)

Current Implementation:
- Server-side rendering: No (SPA)
- Image optimization: Check if lazy loading affects LCP
- Font loading: Check if custom fonts delay LCP
```

#### Optimization Checklist
- ✅ Preload critical resources
- ✅ Optimize images (WebP, proper sizing)
- ✅ Minimize render-blocking resources
- ✅ Server-side render critical content (if applicable)

---

### 1.2 First Input Delay (FID)

**Target**: < 100ms

#### What is FID?
Time from when user first interacts to when browser can respond.

#### How to Test
```
Note: FID can only be measured in real user sessions, not lab tests.

Lab Equivalent: Total Blocking Time (TBT)
Target TBT: < 200ms

Test with Lighthouse:
1. Open Lighthouse
2. Check "Total Blocking Time"
3. Should be < 200ms
```

#### Common FID Issues
```
❌ Long JavaScript tasks blocking main thread
❌ Heavy event handlers
❌ Synchronous XHR requests
❌ Large JavaScript bundles

✅ Solutions:
- Code splitting
- Defer non-critical JS
- Optimize event handlers
- Use Web Workers for heavy computation
```

---

### 1.3 Cumulative Layout Shift (CLS)

**Target**: < 0.1

#### What is CLS?
Sum of all unexpected layout shifts during page lifetime.

#### How to Test
```
Chrome DevTools:
1. Open DevTools
2. Cmd+Shift+P (Mac) or Ctrl+Shift+P (Win)
3. Type "Show Rendering"
4. Enable "Layout Shift Regions"
5. Navigate questionnaire and watch for blue flashes
```

#### Common CLS Causes
```
❌ Images without dimensions
❌ Ads or embeds without reserved space
❌ Fonts causing text reflow (FOUT/FOIT)
❌ Dynamically injected content

Current Implementation Check:
✅ Loading skeletons maintain layout
✅ Images have width/height attributes
✅ Font loading optimized (font-display: swap)
```

#### Layout Shift Test Cases
```
Test: Navigate from Step 1 to Step 2
Expected: No visible layout shift (skeleton → content)

Test: Auto-save indicator appears
Expected: Positioned fixed, doesn't push content

Test: Error message appears
Expected: Space reserved or smooth animation

Test: Quick Select cards load
Expected: Dimensions set immediately
```

---

## 2. Bundle Size Analysis

### 2.1 JavaScript Bundle Size

**Target**: 
- Initial bundle: < 200KB (gzipped)
- Total JS: < 500KB (gzipped)

#### Analyze Bundle
```bash
# Build production bundle
npm run build

# Analyze bundle composition
npm run build -- --analyze
# or
npx vite-bundle-visualizer
```

#### Expected Bundles (with Code Splitting)
```
main.[hash].js                     ~150KB (framework + routing)
FundraisingGoalStep.[hash].js      ~15KB
ImpactSelectionStep.[hash].js      ~12KB
SupportedPlayersStep.[hash].js     ~10KB
DurationSelectionStep.[hash].js    ~10KB
PackageBuilderStep.[hash].js       ~45KB (largest step)
vendor.[hash].js                   ~180KB (React, UI libs)
```

#### Large Dependencies Check
```
Common culprits:
- @supabase/supabase-js: ~50KB
- date-fns: ~70KB (if entire library imported)
- lucide-react: ~5KB (tree-shaken)

Verify tree-shaking:
✅ import { Icon } from 'lucide-react' (good)
❌ import * as Icons from 'lucide-react' (bad)
```

---

### 2.2 CSS Bundle Size

**Target**: < 50KB (gzipped)

#### Analyze CSS
```bash
# Check CSS size
ls -lh dist/assets/*.css

# Should see:
main.[hash].css  ~30-40KB (gzipped: ~8-10KB)
```

#### Optimization Checklist
- ✅ Tailwind purge enabled (production)
- ✅ No unused CSS
- ✅ Critical CSS inlined (optional)

---

## 3. Loading Performance

### 3.1 Initial Page Load

#### Test Scenarios

**Desktop - Fast 3G**
```
Connection: Fast 3G (1.6Mbps down, 750Kbps up, 40ms RTT)

Metrics to Track:
- Time to First Byte (TTFB): < 600ms
- First Contentful Paint (FCP): < 1.8s
- Time to Interactive (TTI): < 3.5s
- LCP: < 2.5s
- CLS: < 0.1
```

**Mobile - Slow 3G**
```
Connection: Slow 3G (400Kbps down, 400Kbps up, 400ms RTT)

Metrics to Track:
- TTFB: < 1s
- FCP: < 3s
- TTI: < 5s
- LCP: < 4s
- CLS: < 0.1
```

---

### 3.2 Step Transition Performance

**Target**: < 300ms transition time

#### Test Procedure
```javascript
// Measure step transition time
console.time('step-transition');
// Click Continue button
// Wait for new step to render
console.timeEnd('step-transition');
// Expected: 50-150ms
```

#### Performance Budget
```
Breakdown:
- Click handler: < 5ms
- State update: < 10ms
- Component unmount: < 20ms
- Component mount: < 50ms
- Animation: 300ms (visual only, non-blocking)
- Total interactive: < 100ms
```

---

### 3.3 Auto-save Performance

**Target**: < 500ms save time (doesn't block UI)

#### Test Cases
```
Test 1: Fast Network
- Enter data in Step 1
- Wait 2 seconds (debounce)
- Monitor network request
- Expected: 100-300ms to complete

Test 2: Slow Network
- Throttle to Slow 3G
- Enter data
- Wait 2 seconds
- Expected: Save completes in background, UI not blocked

Test 3: Offline
- Disable network
- Enter data
- Wait 2 seconds
- Expected: Graceful failure, data kept in memory, retry on reconnect
```

#### Monitoring
```javascript
// Log save performance
const start = performance.now();
await updateDraftStep(offerId, formData);
const duration = performance.now() - start;
console.log(`Save took ${duration}ms`);
```

---

## 4. Runtime Performance

### 4.1 Frame Rate Testing

**Target**: 60fps (16.67ms per frame)

#### Tools
```
Chrome DevTools Performance:
1. Open DevTools > Performance tab
2. Click Record
3. Navigate through questionnaire
4. Stop recording
5. Analyze frame rates

Look for:
- Green bars: Good (< 16ms)
- Yellow bars: Warning (16-50ms)
- Red bars: Problem (> 50ms)
```

#### Test Scenarios
```
1. Scroll through Package Builder placements
   Expected: 60fps scrolling

2. Typing in search box (Package Builder)
   Expected: No frame drops

3. Expanding/collapsing categories
   Expected: Smooth animation (60fps)

4. Step transition animations
   Expected: Smooth fade-in (60fps)
```

---

### 4.2 JavaScript Execution Time

#### Long Tasks Audit
```
Chrome DevTools:
1. Performance tab > Record
2. Navigate questionnaire
3. Stop recording
4. Look for red triangles (Long Tasks > 50ms)

Expected:
- No single task > 50ms
- Total blocking time < 200ms
```

#### Expensive Operations to Profile
```javascript
// Profile expensive operations
console.profile('package-creation');
// User creates new package
console.profileEnd('package-creation');

// Check in DevTools > JavaScript Profiler
// Look for hot functions
```

---

### 4.3 Memory Usage

**Target**: Stable memory usage, no leaks

#### Test Procedure
```
Chrome DevTools Memory:
1. Take Heap Snapshot (initial)
2. Navigate through all steps
3. Go back to step 1
4. Repeat 3-5 times
5. Take Heap Snapshot (final)
6. Compare memory usage

Expected:
- Detached DOM nodes: 0
- Memory increase < 10MB after cycles
- Memory eventually garbage collected
```

#### Common Memory Leak Patterns
```javascript
❌ Event listeners not removed
useEffect(() => {
  window.addEventListener('resize', handler);
  // Missing cleanup!
}, []);

✅ Proper cleanup
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);

❌ Timers not cleared
useEffect(() => {
  const timer = setInterval(handler, 1000);
  // Missing cleanup!
}, []);

✅ Proper cleanup
useEffect(() => {
  const timer = setInterval(handler, 1000);
  return () => clearInterval(timer);
}, []);
```

---

## 5. Network Performance

### 5.1 Request Waterfall Analysis

#### Tool: Chrome DevTools Network Tab

```
Expected Request Order:
1. HTML document
2. Main JS bundle
3. CSS bundle
4. Supabase client JS (vendor chunk)
5. Step 1 component (lazy loaded)
6. Auto-save API call (after 2s)
7. Step 2 component (when navigating)

Optimization:
- Parallel requests where possible
- No chained requests
- API calls debounced
```

---

### 5.2 API Performance

#### Supabase Query Performance

```sql
-- Check query performance in Supabase dashboard

-- Get or create draft (should be < 100ms)
SELECT * FROM sponsorship_offers 
WHERE user_id = $1 AND status = 'draft' 
ORDER BY updated_at DESC 
LIMIT 1;

-- Update draft (should be < 100ms)
UPDATE sponsorship_offers 
SET draft_data = $1, updated_at = NOW() 
WHERE id = $2;

-- Get placement options (should be < 200ms)
SELECT * FROM placement_options 
WHERE is_active = true 
ORDER BY category, name;
```

#### Test Cases
```
Test 1: Cold start (no cache)
- Clear browser cache
- Load questionnaire
- Measure initial data fetch time
- Target: < 500ms

Test 2: Warm start (with cache)
- Navigate away and back
- Measure data fetch time
- Target: < 100ms (cache hit)

Test 3: Concurrent saves
- Make changes in multiple steps quickly
- Verify debouncing prevents request spam
- Should see only 1 request per 2 seconds max
```

---

### 5.3 Asset Caching

#### Cache Strategy
```
Expected Cache Headers:

Static assets (JS, CSS, images):
Cache-Control: public, max-age=31536000, immutable

API responses:
Cache-Control: no-cache (or appropriate caching)

HTML:
Cache-Control: no-cache
```

#### Test Cache Effectiveness
```
Chrome DevTools Network:
1. Load questionnaire
2. Note sizes (e.g., 150KB JS, 10KB CSS)
3. Refresh page (Cmd+R / Ctrl+R)
4. Check "Size" column
5. Should show "(disk cache)" or "(memory cache)"

Expected:
- JS bundles: Cached
- CSS: Cached
- Images: Cached
- API calls: Depends on strategy
```

---

## 6. Mobile Performance

### 6.1 Mobile-Specific Metrics

#### Tool: Lighthouse Mobile Audit

```
Target Scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

Key Mobile Metrics:
- FCP: < 1.8s
- Speed Index: < 3.4s
- LCP: < 2.5s
- TTI: < 3.8s
- TBT: < 200ms
- CLS: < 0.1
```

---

### 6.2 Touch Response Time

**Target**: < 100ms response to touch

#### Test Cases
```
1. Tap Continue button
   - Visual feedback: < 100ms
   - Action executes: < 100ms
   
2. Tap Quick Select card
   - Highlights: < 100ms
   - State updates: < 100ms

3. Swipe gesture
   - Visual feedback: Immediate
   - Action executes: < 100ms
```

#### Tools
```
Chrome DevTools:
1. Enable mobile emulation
2. Performance tab > Record
3. Simulate touch events
4. Check "Interaction" events in timeline
5. Verify < 100ms from touch to paint
```

---

### 6.3 Battery Usage

#### Test Procedure (Android)
```
1. Enable Developer Options on Android device
2. Settings > Battery > Battery Usage
3. Run questionnaire for 5 minutes
4. Check app's battery consumption

Expected:
- Moderate usage (animations, auto-save)
- Not in top consumers
- No unusual drain when idle
```

---

## 7. Optimization Tests

### 7.1 Lazy Loading Verification

#### Test: Step Components Lazy Loaded
```javascript
// Check in Network tab
// Steps should load only when needed

Expected Behavior:
1. Open questionnaire
   → Load: Main bundle, Step 1

2. Navigate to Step 2
   → Load: Step 2 bundle only

3. Go back to Step 1
   → No new load (already in memory)

4. Navigate to Step 3
   → Load: Step 3 bundle only
```

---

### 7.2 Debouncing Verification

#### Test: Auto-save Debouncing
```javascript
Test Procedure:
1. Type in Fundraising Goal input
2. Open Network tab
3. Type "5000" rapidly
4. Stop typing
5. Wait and observe

Expected:
- No network requests while typing
- Single network request 2 seconds after last keystroke
- If typing resumes before 2 seconds, timer resets
```

---

### 7.3 Memoization Verification

#### React DevTools Profiler

```
Steps:
1. Install React DevTools
2. Open Profiler tab
3. Start recording
4. Type in input field
5. Stop recording
6. Analyze re-renders

Expected:
- Only active step component re-renders
- MultiStepContainer doesn't re-render on input
- Sibling components don't re-render
```

---

## 8. Performance Budget

### 8.1 Size Budgets

```
Category          | Budget     | Warning   | Error
------------------|------------|-----------|----------
Initial JS        | 150KB      | 180KB     | 200KB
Total JS          | 400KB      | 450KB     | 500KB
CSS               | 40KB       | 45KB      | 50KB
Images            | 200KB      | 250KB     | 300KB
Fonts             | 50KB       | 60KB      | 75KB
Total Page        | 800KB      | 900KB     | 1MB
```

---

### 8.2 Timing Budgets

```
Metric            | Budget     | Warning   | Error
------------------|------------|-----------|----------
TTFB              | 200ms      | 400ms     | 600ms
FCP               | 1.0s       | 1.5s      | 1.8s
LCP               | 1.5s       | 2.0s      | 2.5s
TTI               | 2.5s       | 3.0s      | 3.5s
TBT               | 150ms      | 200ms     | 300ms
CLS               | 0.05       | 0.1       | 0.25
```

---

### 8.3 Runtime Budgets

```
Operation              | Budget     | Warning   | Error
-----------------------|------------|-----------|----------
Step transition        | 50ms       | 100ms     | 300ms
Auto-save             | 200ms      | 400ms     | 600ms
Search filter         | 50ms       | 100ms     | 200ms
Component render      | 16ms       | 33ms      | 50ms
API request           | 200ms      | 500ms     | 1000ms
```

---

## 9. Regression Testing

### 9.1 Performance Regression Checks

#### Before Deployment Checklist
```
Run these tests before each deploy:

✅ Lighthouse audit (score should not decrease by > 5 points)
✅ Bundle size check (should not increase by > 10%)
✅ LCP test (should remain < 2.5s)
✅ CLS test (should remain < 0.1)
✅ Step transition time (should remain < 300ms)
✅ Memory leak test (should remain stable)
```

---

### 9.2 Automated Performance Testing

#### Setup: Lighthouse CI

```yaml
# lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:5173"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1800}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    }
  }
}
```

---

## 10. Real User Monitoring (RUM)

### 10.1 Web Vitals Monitoring

```javascript
// Track Core Web Vitals in production
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

function sendToAnalytics({name, value, id}) {
  // Send to your analytics service
  console.log({name, value, id});
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

### 10.2 Custom Performance Marks

```javascript
// Mark important moments
performance.mark('questionnaire-start');
// ... user completes questionnaire
performance.mark('questionnaire-end');

// Measure duration
performance.measure(
  'questionnaire-completion',
  'questionnaire-start',
  'questionnaire-end'
);

// Get measurement
const measure = performance.getEntriesByName('questionnaire-completion')[0];
console.log(`User completed questionnaire in ${measure.duration}ms`);
```

---

## 11. Test Sign-Off

| Performance Test | Target | Actual | Pass/Fail | Tester | Date |
|------------------|--------|--------|-----------|--------|------|
| LCP | < 2.5s | | ☐ | | |
| FID (TBT) | < 100ms (200ms) | | ☐ | | |
| CLS | < 0.1 | | ☐ | | |
| Initial Bundle Size | < 200KB | | ☐ | | |
| Total Bundle Size | < 500KB | | ☐ | | |
| Step Transition | < 300ms | | ☐ | | |
| Auto-save Time | < 500ms | | ☐ | | |
| Mobile Performance Score | 90+ | | ☐ | | |
| Memory Leaks | None | | ☐ | | |
| Frame Rate | 60fps | | ☐ | | |

---

## Conclusion

Regular performance testing ensures:
- Fast loading times across devices
- Smooth interactions and animations
- Efficient resource usage
- Great user experience regardless of network conditions
- No performance regressions over time

All performance tests should be run before major releases and monitored continuously in production.
