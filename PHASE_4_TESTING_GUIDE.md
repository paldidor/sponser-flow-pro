# Phase 4: Enhanced Recommendation Tracking - Testing Guide

## ✅ Implementation Summary

Phase 4 has been successfully implemented with the following enhancements:

### 1. **Granular Interaction Tracking**
- Added 4 interaction types: `clicked`, `interested`, `saved`, `not_interested`
- Each recommendation card now has quick action buttons for user feedback
- Real-time feedback stored in `ai_recommendations` table

### 2. **Smart Recommendation Filtering**
- Automatically excludes teams marked as "not interested"
- Prioritizes sports user showed interest in
- Learns from user behavior across conversations

### 3. **Enhanced AI Context**
- AI receives detailed interaction history with emoji indicators
- Instructions to avoid suggesting rejected teams
- Proactive follow-up on saved/interested items

### 4. **Visual Feedback**
- Interactive buttons on recommendation cards (thumbs up, bookmark, thumbs down)
- Visual confirmation when user provides feedback
- Toast notifications for user actions

---

## 🧪 Testing Checklist

### Test 1: Basic Interaction Tracking
**Steps:**
1. Open the AI Advisor chat (bottom right)
2. Have a conversation to get recommendations
3. Click the thumbs up (👍) button on a recommendation
4. Verify toast appears: "Marked as Interested"
5. Verify the button area shows "You're interested in this"

**Expected:** User action tracked in database, visual feedback shown

---

### Test 2: Not Interested Filtering
**Steps:**
1. Get initial recommendations from AI
2. Click thumbs down (👎) on a specific team
3. Start a new conversation (refresh or clear)
4. Request recommendations again with similar criteria
5. Verify the rejected team is NOT shown again

**Expected:** Teams marked "not interested" are filtered out from future recommendations

---

### Test 3: Saved for Later
**Steps:**
1. Get recommendations
2. Click bookmark (🔖) on a recommendation
3. Verify toast: "Saved for Later"
4. In a new conversation, AI should reference: "You saved [Team] earlier. Ready to explore?"

**Expected:** AI proactively follows up on saved items

---

### Test 4: View Details Tracking
**Steps:**
1. Get recommendations
2. Click "View Full Details" button
3. Verify navigation to marketplace detail page
4. Return to chat
5. In subsequent conversation, AI should mention: "I see you checked out [Team Name]"

**Expected:** Viewed items tracked and referenced by AI

---

### Test 5: Cross-Conversation Learning
**Steps:**
1. First conversation: Mark soccer team as "interested"
2. Close and reopen chat (new conversation)
3. Request recommendations
4. Verify AI prioritizes soccer teams
5. Verify AI references: "Based on your interest in soccer teams..."

**Expected:** Preferences persist across conversations

---

### Test 6: New Offers Detection (from Phase 3)
**Steps:**
1. Close AI chat
2. Wait or simulate time passing
3. Reopen chat
4. If new offers were added since last visit, AI should proactively mention them

**Expected:** AI welcomes back with "Since your last visit, 2 new opportunities..."

---

### Test 7: Persistent Preferences (from Phase 2)
**Steps:**
1. First conversation: Mention "$5000 budget" and "basketball"
2. Close chat
3. Reopen chat (new conversation)
4. Verify preferences badge shows: "💰 $5,000" and "🏆 Basketball"
5. AI should not re-ask about budget or sport

**Expected:** Preferences remembered and displayed

---

### Test 8: Interaction History Context
**Steps:**
1. Interact with 3+ recommendations (mix of interested, saved, not interested)
2. Request new recommendations
3. Check edge function logs for: "📊 Found X past actions for context"
4. Verify AI response references past interactions

**Expected:** AI uses interaction history to refine suggestions

---

## 📊 Database Verification

### Check `ai_recommendations` table:
```sql
SELECT 
  ar.user_action,
  ar.created_at,
  so.title as offer_title,
  tp.team_name
FROM ai_recommendations ar
JOIN sponsorship_offers so ON so.id = ar.sponsorship_offer_id
JOIN team_profiles tp ON tp.id = so.team_profile_id
WHERE ar.conversation_id = '<your_conversation_id>'
ORDER BY ar.created_at DESC;
```

**Expected columns:**
- `user_action`: Should be one of: `clicked`, `interested`, `saved`, `not_interested`
- Proper foreign key relationships

---

### Check `ai_user_preferences` table:
```sql
SELECT 
  preferred_sports,
  budget_range,
  interaction_patterns
FROM ai_user_preferences
WHERE user_id = auth.uid();
```

**Expected:**
- `preferred_sports`: Array of sports user showed interest in
- `budget_range`: Numeric range like `[3000,5000]`
- `interaction_patterns`: JSON with `last_checked_at`, `last_radius_km`

---

## 🔍 Edge Function Logs

Check logs for these key indicators:

```
✅ Expected Log Entries:
- "📚 Loaded persistent user preferences"
- "🎉 Found X new offers since last visit"
- "📊 Found X past actions for context"
- "🎯 User preferences from interactions"
- "✅ Found X recommendations, showing Y after filtering"
- "💾 Successfully stored X recommendations for tracking"

❌ Error Patterns to Watch:
- "❌ Failed to store recommendations"
- "❌ Error checking new offers"
- "⚠️ Cannot store recommendations: savedMessage.id is missing"
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Interactions not tracked
**Cause:** `conversationId` not passed to RecommendationCard
**Fix:** Verify `AIAdvisorChat` passes `conversationId` prop

### Issue 2: AI doesn't reference past interactions
**Cause:** Edge function not loading past actions
**Fix:** Check `ai_recommendations` table has RLS policy for SELECT

### Issue 3: Not interested filter not working
**Cause:** `notInterestedOfferIds` array empty
**Fix:** Verify `user_action` column properly updated

### Issue 4: Preferences not persisting
**Cause:** `ai_user_preferences` upsert failing
**Fix:** Check RLS policy allows INSERT/UPDATE for authenticated users

---

## ✨ Success Criteria

All phases working correctly when:
- ✅ User feedback buttons functional with visual confirmation
- ✅ Rejected teams excluded from future recommendations  
- ✅ AI references past interactions naturally
- ✅ Preferences persist across browser sessions
- ✅ New offers proactively mentioned
- ✅ No TypeScript or console errors
- ✅ Toast notifications appear for all actions
- ✅ Edge function logs show proper data flow

---

## 📝 Next Recommended Phases

**Phase 5: Smart Budget Optimization**
- Suggest package combinations to hit fundraising goals
- ROI comparison across similar teams
- Budget allocation recommendations

**Phase 6: Automated Outreach**
- Draft personalized sponsorship proposals
- Email templates based on business profile
- Follow-up reminders and tracking

**Phase 7: Analytics Dashboard**
- Track which recommendations convert
- A/B test different AI prompts
- User engagement metrics visualization
