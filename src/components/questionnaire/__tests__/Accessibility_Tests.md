# Accessibility Testing Guide - Questionnaire Flow

## Overview
This document provides detailed testing procedures to ensure the multi-step questionnaire meets WCAG 2.1 Level AA compliance standards.

---

## 1. Screen Reader Testing

### 1.1 VoiceOver (macOS/iOS)

#### Setup
1. Enable VoiceOver: `Cmd + F5` (macOS) or Settings > Accessibility > VoiceOver (iOS)
2. Open Safari browser
3. Navigate to questionnaire

#### Test Script

**Step 1: Initial Load**
```
Expected Announcements:
- "Multi-step questionnaire, main"
- "Step 1 of 5: Setting your fundraising goal"
- "Progress bar, 20 percent complete"
```

**Step 2: Navigate Through Form**
```
VoiceOver Commands:
- VO + Right Arrow: Next element
- VO + Left Arrow: Previous element
- VO + Space: Activate button

Expected for Fundraising Goal Input:
- "Fundraising goal input field, required"
- "Enter amount in dollars"
- "Custom Amount, edit text"
```

**Step 3: Quick Select Buttons**
```
Expected:
- "Quick select 5000 dollars, Starter, button"
- "Quick select 10000 dollars, Standard, button"
- When activated: "Selected 5000 dollars"
```

**Step 4: Navigation Buttons**
```
Expected:
- "Continue to step 2, button, dimmed" (when disabled)
- "Continue to step 2, button" (when enabled)
- "Go back to step 1, button"
```

**Step 5: Validation Messages**
```
When entering invalid amount:
- "Error, Please enter a valid amount greater than $0"
- Message announced automatically via aria-live region
```

---

### 1.2 NVDA (Windows)

#### Setup
1. Install NVDA from https://www.nvaccess.org/
2. Start NVDA
3. Open questionnaire in Firefox or Chrome

#### Test Commands
- `Tab`: Navigate to next focusable element
- `Shift + Tab`: Navigate to previous element
- `Insert + Down Arrow`: Say all
- `Insert + T`: Read title
- `Insert + B`: Read buttons

#### Expected Behavior
```
Forms Mode Activation:
- Should automatically enter forms mode on input fields
- Announce: "Forms mode on"

Reading Order:
- Heading level 1: "Set Your Fundraising Goal"
- Paragraph: "Choose a realistic target..."
- Button: "Quick select 5000 dollars"
- Edit text: "Custom Amount"
```

---

### 1.3 TalkBack (Android)

#### Setup
1. Settings > Accessibility > TalkBack > Enable
2. Open Chrome on Android
3. Navigate to questionnaire

#### Test Gestures
- Swipe right: Next element
- Swipe left: Previous element
- Double tap: Activate element
- Swipe down then right: Read all

#### Expected Behavior
```
Step Progress:
- "Step 1 of 5, heading"
- "20 percent complete"

Touch exploration:
- Touch and hold: Reads element under finger
- "Continue button, double tap to activate"
```

---

## 2. Keyboard Navigation Testing

### 2.1 Tab Order Test

#### Test Procedure
1. Open questionnaire
2. Press Tab repeatedly
3. Document tab stops in order
4. Verify logical flow

#### Expected Tab Order - Step 1 (Fundraising Goal)
```
1. [Skip to main content] (if implemented)
2. [Back button]
3. [Quick Select: $5k]
4. [Quick Select: $10k]
5. [Quick Select: $25k]
6. [Quick Select: $50k]
7. [Custom Amount Input]
8. [Continue Button]
```

#### Test Cases
- ✅ **All interactive elements reachable**: Every button, input, link is in tab order
- ✅ **Logical order**: Top to bottom, left to right
- ✅ **No tab traps**: Can tab through entire page
- ✅ **Hidden elements skipped**: Collapsed sections not in tab order

---

### 2.2 Keyboard Shortcuts Test

#### Enter Key
```
Test: Press Enter on Continue button
Expected: Advances to next step

Test: Press Enter while focused in text input
Expected: Does NOT submit form (normal input behavior)

Test: Press Enter when Continue button disabled
Expected: No action
```

#### Escape Key
```
Test: Press Escape in modal/dialog (if any)
Expected: Closes modal

Test: Press Escape on main questionnaire
Expected: No action (or defined behavior)
```

#### Arrow Keys
```
Test: Up/Down arrows in radio group (Duration Selection)
Expected: Changes selection between options

Test: Left/Right arrows on range slider (if any)
Expected: Adjusts value
```

---

### 2.3 Focus Management Test

#### Step Transition Focus
```
Scenario: Complete Step 1, click Continue
Expected: Focus moves to first interactive element of Step 2

Scenario: Click Back from Step 2 to Step 1
Expected: Focus returns to Continue button (or first element)
```

#### Modal Focus
```
Scenario: Open submission modal
Expected: 
- Focus trapped within modal
- Focus moves to first element in modal
- Escape closes modal and returns focus

Scenario: Close modal
Expected: Focus returns to trigger element
```

---

### 2.4 Focus Indicators Test

#### Visual Focus Test
```
Elements to Test:
- All buttons (Back, Continue, Quick Select)
- All input fields
- Radio buttons
- Checkboxes
- Badge selections

Test Procedure:
1. Tab to element
2. Verify visible focus indicator
3. Check contrast ratio of focus indicator

Expected:
- Clear, visible outline or ring
- Minimum 2px thickness
- 3:1 contrast ratio with background
- Doesn't obscure content
```

#### Custom Focus Styles
```
CSS to Verify:
.focus-visible:focus {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

Check on:
- Light backgrounds
- Dark backgrounds
- Primary colored backgrounds
```

---

## 3. ARIA Attributes Testing

### 3.1 Required ARIA Landmarks

```html
Expected Structure:

<div role="main" aria-label="Multi-step questionnaire">
  <!-- Main content -->
</div>

<div role="progressbar" 
     aria-valuenow="20" 
     aria-valuemin="0" 
     aria-valuemax="100"
     aria-label="Questionnaire progress">
  <!-- Progress bar -->
</div>
```

#### Test with Accessibility Insights
1. Install browser extension
2. Run "Assessment" test
3. Check landmarks are properly labeled

---

### 3.2 Form ARIA Attributes

```html
Expected Patterns:

<!-- Input with error -->
<label for="goal">Fundraising Goal</label>
<input 
  id="goal"
  type="text"
  aria-required="true"
  aria-invalid="true"
  aria-describedby="goal-error"
/>
<div id="goal-error" role="alert">
  Please enter a valid amount
</div>

<!-- Button state -->
<button 
  aria-label="Continue to step 2"
  aria-disabled="true"
>
  Continue
</button>
```

#### Test Checklist
- ✅ All inputs have associated labels
- ✅ Required fields have `aria-required="true"`
- ✅ Invalid fields have `aria-invalid="true"`
- ✅ Error messages linked with `aria-describedby`
- ✅ Buttons have descriptive `aria-label`

---

### 3.3 Live Regions Test

```html
Expected Live Regions:

<!-- Auto-save status -->
<div aria-live="polite" aria-atomic="true">
  Saved at 2:30 PM
</div>

<!-- Step announcements -->
<div role="status" aria-live="polite" aria-atomic="true">
  Step 2 of 5: Defining impact areas
</div>

<!-- Validation messages -->
<div role="alert" aria-live="assertive">
  Minimum fundraising goal is $500
</div>
```

#### Test Procedure
1. Enable screen reader
2. Trigger state changes (save, navigation, validation)
3. Verify announcements without moving focus

---

## 4. Color and Contrast Testing

### 4.1 Text Contrast Ratios

#### Tool: WebAIM Contrast Checker
https://webaim.org/resources/contrastchecker/

#### Elements to Test

**Normal Text (4.5:1 minimum)**
```
Primary text on background:
- Foreground: hsl(222.2 84% 4.9%) [#020817]
- Background: hsl(0 0% 100%) [#FFFFFF]
- Expected: ✅ Pass (21:1 ratio)

Muted text on background:
- Foreground: hsl(215.4 16.3% 46.9%) [#64748b]
- Background: hsl(0 0% 100%) [#FFFFFF]
- Expected: ✅ Pass (4.5:1+ ratio)
```

**Large Text (3:1 minimum)**
```
Heading text (18px+):
- All headings should meet 3:1 minimum
- Better to meet 4.5:1 for consistency
```

**UI Components (3:1 minimum)**
```
Button borders:
- Border color vs background: 3:1 minimum

Focus indicators:
- Focus ring vs background: 3:1 minimum
```

---

### 4.2 Color Blindness Testing

#### Tools
- Chrome DevTools: Rendering > Emulate vision deficiencies
- Color Oracle (desktop app)
- Sim Daltonism (macOS)

#### Deficiencies to Test
1. **Protanopia** (red-blind)
2. **Deuteranopia** (green-blind)
3. **Tritanopia** (blue-blind)
4. **Achromatopsia** (complete color blindness)

#### Test Cases
```
Test: Success indicators (green checkmarks)
Verify: Icon + text, not color alone
✅ "Selected" badge has checkmark icon + text

Test: Error messages (red text)
Verify: Icon + text, not color alone
✅ Error has "⚠️" icon + descriptive text

Test: Quick select cards (selected state)
Verify: Not relying on color only
✅ Selected state has ring + different shade + checkmark

Test: Progress bar
Verify: Visible in grayscale
✅ Progress bar has visible fill in all modes
```

---

### 4.3 High Contrast Mode Testing

#### Windows High Contrast Mode
```
Enable: Windows Settings > Ease of Access > High Contrast
Themes to test:
- High Contrast #1 (black background)
- High Contrast #2 (white background)
```

#### Test Checklist
- ✅ All text visible
- ✅ All borders visible
- ✅ Focus indicators visible
- ✅ Button states distinguishable
- ✅ Icons and images have proper fallbacks

---

## 5. Semantic HTML Testing

### 5.1 Heading Hierarchy

#### Expected Structure
```html
<h1>Set Your Fundraising Goal</h1>        <!-- Step title -->
  <h2>Quick Select</h2>                   <!-- Section heading (if used) -->
  <h2>Custom Amount</h2>                  <!-- Section heading (if used) -->
```

#### Test with HeadingsMap Extension
1. Install HeadingsMap browser extension
2. Open questionnaire
3. Verify logical heading outline

#### Rules
- ✅ Only one `<h1>` per page (step)
- ✅ No skipped levels (h1 → h2 → h3, not h1 → h3)
- ✅ Headings describe content
- ✅ Not used for styling (use CSS instead)

---

### 5.2 Form Structure

```html
Expected Pattern:

<form>
  <fieldset>
    <legend>Fundraising Goal</legend>
    
    <label for="goal">Amount</label>
    <input id="goal" type="text" />
  </fieldset>
</form>

For Radio Groups:
<fieldset>
  <legend>Sponsorship Duration</legend>
  
  <label>
    <input type="radio" name="duration" value="season" />
    Season
  </label>
  
  <label>
    <input type="radio" name="duration" value="1-year" />
    1 Year
  </label>
</fieldset>
```

---

### 5.3 Button vs Link Semantics

#### Rules
```
<button>: For actions (Continue, Back, Select)
<a href="...">: For navigation to different pages

Never:
<div onClick={...}>Click me</div>  ❌
<a href="#" onClick={...}>Submit</a>  ❌

Always:
<button onClick={...}>Submit</button>  ✅
<a href="/help">Help</a>  ✅
```

---

## 6. Responsive Text Testing

### 6.1 Text Scaling (200%)

#### Test Procedure
1. Open questionnaire
2. Browser zoom to 200%
3. Verify readability and functionality

#### Expected Behavior
- ✅ All text remains visible
- ✅ No overlapping elements
- ✅ No horizontal scrolling
- ✅ Interactive elements still usable
- ✅ Layout doesn't break

---

### 6.2 Font Size Requirements

```
Minimum Font Sizes:
- Body text: 16px (1rem)
- Small text: 14px (0.875rem)
- Tiny text: 12px (0.75rem) - use sparingly

Current Implementation:
✅ text-base: 16px
✅ text-sm: 14px
✅ text-xs: 12px
```

---

## 7. Motion and Animation Testing

### 7.1 Reduced Motion Test

#### Enable Reduced Motion
```
macOS: System Preferences > Accessibility > Display > Reduce Motion
Windows: Settings > Ease of Access > Display > Show animations
iOS: Settings > Accessibility > Motion > Reduce Motion
Android: Settings > Accessibility > Remove animations
```

#### CSS Implementation Check
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Test Cases
```
With Reduced Motion ON:

Step transitions:
- Should use simple fade instead of slide
- Duration should be minimal (<100ms)

Auto-save indicator:
- Should appear instantly
- No spinning animation

Progress bar:
- Should update instantly
- No gradual fill animation

Button hover:
- Instant color change
- No scale animation
```

---

### 7.2 Animation Duration Limits

```
Maximum Duration Guidelines:
- Micro-interactions: 100-200ms
- Step transitions: 200-300ms
- Loading animations: No limit (but closable)

Current Implementation:
✅ Button hover: 200ms
✅ Step fade-in: 300ms
✅ Progress bar: 500ms (might be too long - consider 300ms)
```

---

## 8. Forms and Input Testing

### 8.1 Autocomplete Attributes

```html
Expected Attributes:

<input 
  name="fundraising-goal"
  autocomplete="off"  <!-- For custom fields -->
/>

<input 
  name="email"
  autocomplete="email"
/>

<input 
  name="team-name"
  autocomplete="organization"
/>
```

---

### 8.2 Input Type and Inputmode

```html
Current Implementation Check:

Fundraising Goal:
<input 
  type="text"          ✅ Allows formatting
  inputMode="numeric"  ✅ Shows numeric keyboard on mobile
/>

Custom Impact:
<input 
  type="text"          ✅
  inputMode="text"     ✅ Default, shows full keyboard
/>
```

---

### 8.3 Error Handling

```
Test Scenarios:

1. Submit empty required field
   Expected: 
   - Error message appears
   - Focus moves to invalid field
   - Screen reader announces error

2. Submit invalid format
   Expected:
   - Specific error message
   - Example of correct format shown
   - Easy to correct

3. Multiple errors
   Expected:
   - All errors listed
   - Can navigate between errors
   - Each error linked to field
```

---

## 9. Mobile Accessibility Testing

### 9.1 Touch Target Size

```
WCAG 2.5.5 Target Size (AAA):
- Minimum 44x44 CSS pixels

Current Implementation:
✅ Buttons: min-h-[44px] on mobile
✅ Touch areas don't overlap
✅ Adequate spacing (8px minimum)
```

---

### 9.2 Mobile Screen Reader Testing

#### iOS VoiceOver Gestures
```
One-finger swipe right: Next element
One-finger swipe left: Previous element
Double-tap: Activate element
Two-finger double-tap: Magic Tap (context action)
Three-finger swipe left/right: Scroll
```

#### Android TalkBack Gestures
```
Swipe right: Next element
Swipe left: Previous element
Double-tap: Activate element
Swipe down then right: Read from top
Two-finger swipe down: Pass-through gesture
```

---

## 10. Automated Testing Tools

### 10.1 axe DevTools

#### Installation
1. Install axe DevTools browser extension
2. Open questionnaire
3. Click axe icon
4. Run "Scan All of My Page"

#### Expected Results
```
0 Critical Issues
0 Serious Issues
0 Moderate Issues

All issues should be minor or best practices
```

---

### 10.2 Lighthouse Accessibility Audit

#### Run Lighthouse
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Accessibility"
4. Click "Generate report"

#### Target Score
```
Accessibility Score: 95+ / 100

Common deductions to fix:
- Missing ARIA labels
- Insufficient contrast
- Missing alt text
- Improper heading hierarchy
```

---

### 10.3 WAVE Tool

#### URL
https://wave.webaim.org/

#### Process
1. Enter questionnaire URL
2. Review results
3. Fix all Errors
4. Address Alerts

---

## 11. Compliance Checklist

### WCAG 2.1 Level AA Requirements

#### Perceivable
- ✅ 1.1.1 Non-text Content: All images have alt text
- ✅ 1.3.1 Info and Relationships: Semantic HTML used
- ✅ 1.3.2 Meaningful Sequence: Logical reading order
- ✅ 1.3.3 Sensory Characteristics: Instructions don't rely on shape/color alone
- ✅ 1.4.1 Use of Color: Color not only means of conveying information
- ✅ 1.4.3 Contrast (Minimum): 4.5:1 for normal text, 3:1 for large text
- ✅ 1.4.4 Resize Text: Works at 200% zoom
- ✅ 1.4.10 Reflow: No horizontal scrolling at 320px width
- ✅ 1.4.11 Non-text Contrast: UI components have 3:1 contrast
- ✅ 1.4.12 Text Spacing: Works with increased spacing

#### Operable
- ✅ 2.1.1 Keyboard: All functionality available via keyboard
- ✅ 2.1.2 No Keyboard Trap: Can navigate away from all elements
- ✅ 2.1.4 Character Key Shortcuts: No conflicts with screen reader shortcuts
- ✅ 2.4.1 Bypass Blocks: Skip links or landmarks available
- ✅ 2.4.3 Focus Order: Logical tab order
- ✅ 2.4.6 Headings and Labels: Descriptive headings and labels
- ✅ 2.4.7 Focus Visible: Visible focus indicator
- ✅ 2.5.1 Pointer Gestures: No multi-point gestures required
- ✅ 2.5.2 Pointer Cancellation: Can cancel accidental activations
- ✅ 2.5.3 Label in Name: Accessible name matches visible label
- ✅ 2.5.4 Motion Actuation: No motion-required input

#### Understandable
- ✅ 3.1.1 Language of Page: lang attribute set
- ✅ 3.2.1 On Focus: No context change on focus
- ✅ 3.2.2 On Input: No unexpected context change on input
- ✅ 3.3.1 Error Identification: Errors clearly identified
- ✅ 3.3.2 Labels or Instructions: Form labels present
- ✅ 3.3.3 Error Suggestion: Helpful error messages
- ✅ 3.3.4 Error Prevention: Confirmation for important actions

#### Robust
- ✅ 4.1.1 Parsing: Valid HTML
- ✅ 4.1.2 Name, Role, Value: Proper ARIA attributes
- ✅ 4.1.3 Status Messages: Live regions for dynamic content

---

## 12. Sign-Off

### Test Completion Checklist

| Test Category | Pass | Fail | N/A | Tester | Date |
|---------------|------|------|-----|--------|------|
| Screen Reader (VoiceOver) | ☐ | ☐ | ☐ | | |
| Screen Reader (NVDA) | ☐ | ☐ | ☐ | | |
| Screen Reader (TalkBack) | ☐ | ☐ | ☐ | | |
| Keyboard Navigation | ☐ | ☐ | ☐ | | |
| Focus Management | ☐ | ☐ | ☐ | | |
| Focus Indicators | ☐ | ☐ | ☐ | | |
| ARIA Attributes | ☐ | ☐ | ☐ | | |
| Color Contrast | ☐ | ☐ | ☐ | | |
| Color Blindness | ☐ | ☐ | ☐ | | |
| Semantic HTML | ☐ | ☐ | ☐ | | |
| Text Scaling | ☐ | ☐ | ☐ | | |
| Reduced Motion | ☐ | ☐ | ☐ | | |
| Mobile Screen Reader | ☐ | ☐ | ☐ | | |
| Touch Target Size | ☐ | ☐ | ☐ | | |
| Axe DevTools | ☐ | ☐ | ☐ | | |
| Lighthouse Audit | ☐ | ☐ | ☐ | | |
| WAVE Tool | ☐ | ☐ | ☐ | | |

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
