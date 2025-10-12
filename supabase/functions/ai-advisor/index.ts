import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ✅ Helper function to extract zip code from user message
function extractZipCode(text: string): string | null {
  // Match 5-digit zip codes or 9-digit (12345-6789)
  const zipMatch = text.match(/\b\d{5}(?:-\d{4})?\b/);
  return zipMatch ? zipMatch[0] : null;
}

// ✅ Helper function to geocode and update profile
async function geocodeAndUpdateProfile(
  supabaseClient: any,
  businessProfileId: string,
  zipCode: string,
  city?: string,
  state?: string
) {
  try {
    console.log('🗺️ Geocoding zip code:', zipCode);
    
    // Call geocode-location function
    const { data: geoData, error: geoError } = await supabaseClient.functions.invoke(
      'geocode-location',
      {
        body: { 
          city: city || '', 
          state: state || '', 
          zipCode 
        }
      }
    );

    if (geoError || !geoData?.latitude) {
      console.error('Geocoding failed:', geoError);
      return null;
    }

    console.log('✅ Geocoded successfully:', geoData);

    // Update business profile with coordinates
    const { error: updateError } = await supabaseClient
      .from('business_profiles')
      .update({
        location_lat: geoData.latitude,
        location_lon: geoData.longitude,
        zip_code: zipCode,
      })
      .eq('id', businessProfileId);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      return null;
    }

    console.log('✅ Updated business profile with coordinates');

    return {
      latitude: geoData.latitude,
      longitude: geoData.longitude,
    };
  } catch (error) {
    console.error('Error in geocodeAndUpdateProfile:', error);
    return null;
  }
}

const ADVISOR_SYSTEM_PROMPT = `You are a proactive personal sponsorship marketing manager helping businesses succeed with youth sports sponsorships. You're enthusiastic, results-oriented, and remember past conversations and interactions.

**Your Personality:**
- Enthusiastic and encouraging about sponsorship opportunities
- Proactive: suggest next steps, follow-ups, and actions
- Personal: remember and use saved preferences AND past interactions from previous conversations
- Results-oriented: focus on ROI, reach, and business outcomes
- Celebratory: acknowledge when they view or consider opportunities
- Smart: learn from their feedback (interested/not interested) to refine suggestions

**Your Role:**
- Help businesses discover sponsorships that maximize ROI
- Remember their preferences and use them automatically
- Recommend relevant opportunities from the database
- Drive action and help them make confident decisions

**Communication Style - CRITICAL:**
- Keep messages SHORT: 2-3 sentences maximum (50-100 words)
- Ask ONE question at a time - NEVER ask multiple questions in one message
- Sound natural and conversational, like texting a helpful friend
- No bullet points or lists in your responses
- No formal structures or lengthy explanations

**Using Saved Preferences:**
- If you see "Saved Preferences" in the context, USE them automatically
- Don't ask about things they've already told you (budget, sports, location radius)
- Reference their preferences: "Based on your $3-5K budget..." or "Looking at soccer teams like you mentioned..."
- Only ask clarifying questions about NEW information you don't have

**Using Past Interactions (CRITICAL):**
- Review "Past Interactions" to see what they liked/disliked
- 👁️ Viewed = they explored it, follow up: "Still considering [Team]?"
- 👍 Interested = strong signal, prioritize: "You marked [Team] as interested! Want to reach out?"
- 🔖 Saved = warm lead, remind: "You saved [Team] earlier. Ready to explore?"
- 👎 Not interested = avoid similar teams, learn: "I'll avoid teams like that"
- Reference their taste: "Based on your interest in soccer teams..."
- Never suggest teams they marked "not interested"

**Conversation Flow:**
1. **First contact**: Welcome them and check if you have saved preferences
2. **With saved preferences**: "Welcome back! Still looking for [sport] sponsorships around $[budget]?"
3. **Without preferences**: Ask about budget, location preference, or sport type
4. **Build understanding**: Wait for their answer before asking next question
5. **When enough info**: Automatically search and present recommendations
6. **After recommendations**: Ask what they think, encourage action

**When Recommending Offers:**
- Keep intro brief and exciting: "Found 3 amazing teams! The top one is [TeamName] - just [Distance]km away with [Reach] reach for $[Price]."
- Let the recommendation cards show details - don't repeat everything in text
- Show enthusiasm: Use words like "perfect", "great fit", "excellent ROI"
- Ask follow-up: "Which one interests you most?" or "Want to see full details?"
- If user previously clicked on teams, reference that: "These are similar to [TeamName] you checked out!"

**When Search Results Are Provided:**
- You'll receive team details in your context with marketplace URLs
- Present ONLY the TOP 1-2 results conversationally, not all of them
- Example: "Found 3 teams! The closest is Newark Youth Soccer - just 5km away with 1,200 reach for $4,500. That's excellent ROI! Interested in seeing details?"
- The UI will show recommendation cards with full details and images
- After presenting, encourage action: "Want to check out the full details?" or "Should I find more options?"

**CRITICAL ANTI-HALLUCINATION RULES:**
- NEVER EVER invent, fabricate, or make up team names, prices, or sponsorship details
- If no recommendations are in your system context, they DO NOT EXIST
- When you receive "0 results found", you MUST say: "I couldn't find any teams matching those criteria right now. Want to try a different location, budget, or sport?"
- If location is missing, ask IMMEDIATELY: "To find teams near you, what's your zip code?"
- After receiving zip code, briefly acknowledge and proceed with recommendations
- NEVER suggest teams that aren't explicitly provided in your system context
- If uncertain whether recommendations exist, ask a clarifying question instead
- Example WRONG response: "Try Newark Soccer Club for $3,000" (when not in database)
- Example CORRECT response: "I couldn't find matches. Want to adjust your budget or try a different sport?"

**Critical Rules:**
- NEVER say you're "searching" unless search results are in your context
- NEVER repeat system messages or show JSON data
- If you don't have results yet, ask ONE clarifying question
- When you have results, present them enthusiastically
- NEVER ask about things covered in saved preferences
- Always reference saved preferences when making recommendations

**Important Rules:**
- ALWAYS use search/recommendation tools when suggesting offers
- Never make up offers - only show real database results
- If they mention budget, use it in your search
- Keep responses under 150 words - shorter is better

**Example Good Responses:**
- "Hi! What's your budget range for sponsorship?"
- "Got it! Are you interested in soccer, basketball, or other sports?"
- "Perfect! Want to see teams within 50 miles or cast a wider net?"
- "Found 3 great options! The closest is a soccer team with 800 reach for $3,500. Interested?"

Remember: Short, natural, ONE question at a time. You're having a conversation, not giving a presentation.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, filters } = await req.json();

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get or create conversation
    let activeConversationId = conversationId;
    let savedPreferences: any = {};
    let newOffersContext = '';
    
    if (!activeConversationId) {
      // NEW CONVERSATION: Load persistent user preferences first
      const { data: userPrefs } = await supabaseClient
        .from('ai_user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userPrefs) {
        savedPreferences = {
          sports: userPrefs.preferred_sports || undefined,
          budgetMin: userPrefs.budget_range 
            ? parseFloat(userPrefs.budget_range.replace(/[\[\]]/g, '').split(',')[0]) 
            : undefined,
          budgetMax: userPrefs.budget_range 
            ? parseFloat(userPrefs.budget_range.replace(/[\[\]]/g, '').split(',')[1]) 
            : undefined,
          radiusKm: userPrefs.interaction_patterns?.last_radius_km || undefined,
        };
        console.log('📚 Loaded persistent user preferences:', savedPreferences);

        // PHASE 3: Check for new offers since last visit
        const lastChecked = userPrefs.interaction_patterns?.last_checked_at;
        if (lastChecked) {
          console.log('🔍 Checking for new offers since:', lastChecked);
          try {
            const { data: newOffers, error: offersError } = await supabaseClient
              .from('sponsorship_offers')
              .select(`
                id,
                title,
                created_at,
                team_profiles!inner(team_name, sport)
              `)
              .eq('status', 'published')
              .gte('created_at', lastChecked)
              .limit(5);

            if (offersError) {
              console.error('❌ Error checking new offers:', offersError);
            } else if (newOffers && newOffers.length > 0) {
              console.log(`🎉 Found ${newOffers.length} new offers since last visit`);
              
              // Filter by user's preferred sports if available
              const relevantOffers = savedPreferences.sports?.length > 0
                ? newOffers.filter((offer: any) => savedPreferences.sports.includes(offer.team_profiles.sport))
                : newOffers;

              if (relevantOffers.length > 0) {
                newOffersContext = `\n\n📢 **NEW OPPORTUNITIES ALERT**: Since this user's last visit, ${relevantOffers.length} new sponsorship ${relevantOffers.length === 1 ? 'opportunity has' : 'opportunities have'} been added that may interest them:\n` +
                  relevantOffers.map((offer: any) => `- "${offer.title}" from ${offer.team_profiles.team_name} (${offer.team_profiles.sport})`).join('\n') +
                  '\n\n**IMPORTANT**: Proactively mention these new opportunities in your greeting to welcome them back! Keep it natural and exciting.';
                console.log('💬 New offers context prepared for AI');
              }
            } else {
              console.log('ℹ️ No new offers since last visit');
            }
          } catch (error) {
            console.error('❌ Exception checking new offers:', error);
          }
        }
      } else {
        savedPreferences = filters || {};
        console.log('🆕 New user - no saved preferences');
      }

      const { data: businessProfile } = await supabaseClient
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data: conv, error: convError } = await supabaseClient
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          business_profile_id: businessProfile?.id,
          channel: 'in-app',
          metadata: { preferences: savedPreferences },
        })
        .select()
        .single();

      if (convError) throw convError;
      activeConversationId = conv.id;
    } else {
      // EXISTING CONVERSATION: Verify it exists, otherwise create new
      const { data: existingConv, error: convError } = await supabaseClient
        .from('ai_conversations')
        .select('id, metadata')
        .eq('id', activeConversationId)
        .maybeSingle();
      
      if (convError || !existingConv) {
        console.warn('⚠️ Conversation ID provided but not found, creating new conversation');
        
        // Create new conversation
        const { data: businessProfile } = await supabaseClient
          .from('business_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // Load persistent user preferences
        const { data: userPrefs } = await supabaseClient
          .from('ai_user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (userPrefs) {
          savedPreferences = {
            sports: userPrefs.preferred_sports || undefined,
            budgetMin: userPrefs.budget_range 
              ? parseFloat(userPrefs.budget_range.replace(/[\[\]]/g, '').split(',')[0]) 
              : undefined,
            budgetMax: userPrefs.budget_range 
              ? parseFloat(userPrefs.budget_range.replace(/[\[\]]/g, '').split(',')[1]) 
              : undefined,
            radiusKm: userPrefs.interaction_patterns?.last_radius_km || undefined,
          };
          console.log('📚 Loaded persistent user preferences for new conversation:', savedPreferences);
        }

        const { data: newConv, error: newConvError } = await supabaseClient
          .from('ai_conversations')
          .insert({
            user_id: user.id,
            business_profile_id: businessProfile?.id,
            channel: 'in-app',
            metadata: { preferences: savedPreferences },
          })
          .select()
          .single();

        if (newConvError) throw newConvError;
        activeConversationId = newConv.id;
        console.log('✅ Created new conversation:', activeConversationId);
      } else {
        savedPreferences = existingConv.metadata?.preferences || {};
      }
    }

    // Store user message
    await supabaseClient.from('ai_messages').insert({
      conversation_id: activeConversationId,
      role: 'user',
      content: message,
    });

    // Build context from business profile and conversation history
    const { data: businessProfile } = await supabaseClient
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // ✅ STEP 1: Check if location data is missing
    const needsZipCode = !businessProfile?.location_lat || !businessProfile?.location_lon;
    const hasZipCode = businessProfile?.zip_code;
    
    console.log('📍 Location check:', {
      needsZipCode,
      hasZipCode,
      hasLatLon: !!businessProfile?.location_lat
    });

    // Fetch full conversation history (increase limit for better context)
    const { data: messages } = await supabaseClient
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Extract preferences from current conversation
    const conversationText = messages?.map(m => m.content).join(' ').toLowerCase() || '';
    const userMessage = message.toLowerCase();
    
    // Extract budget preferences
    const budgetMatch = userMessage.match(/\$?(\d{1,3}(?:,?\d{3})*)\s*(?:to|-)\s*\$?(\d{1,3}(?:,?\d{3})*)/);
    if (budgetMatch) {
      savedPreferences.budgetMin = parseInt(budgetMatch[1].replace(/,/g, ''));
      savedPreferences.budgetMax = parseInt(budgetMatch[2].replace(/,/g, ''));
    } else {
      const singleBudget = userMessage.match(/\$?(\d{1,3}(?:,?\d{3})*)/);
      if (singleBudget && (userMessage.includes('budget') || userMessage.includes('spend'))) {
        savedPreferences.budgetMax = parseInt(singleBudget[1].replace(/,/g, ''));
      }
    }
    
    // Extract sport preferences
    const sports = ['soccer', 'basketball', 'baseball', 'volleyball', 'football', 'hockey'];
    const mentionedSports = sports.filter(sport => 
      userMessage.includes(sport) || conversationText.includes(sport)
    );
    if (mentionedSports.length > 0) {
      savedPreferences.sports = mentionedSports.map(s => 
        s.charAt(0).toUpperCase() + s.slice(1)
      );
    }
    
    // Extract location/radius preferences
    const radiusMatch = userMessage.match(/(\d+)\s*(?:km|kilometers?|miles?)/i);
    if (radiusMatch) {
      const value = parseInt(radiusMatch[1]);
      savedPreferences.radiusKm = userMessage.includes('mile') ? value * 1.6 : value;
    }
    
    // Save updated preferences to BOTH conversation metadata AND persistent user preferences
    if (Object.keys(savedPreferences).length > 0) {
      // Update conversation metadata (temporary)
      await supabaseClient
        .from('ai_conversations')
        .update({ 
          metadata: { preferences: savedPreferences },
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', activeConversationId);

      // ALSO save to user preferences (persistent across conversations)
      try {
        const upsertData: any = {
          user_id: user.id,
        };

        // Only add fields that exist in savedPreferences
        if (savedPreferences.sports && savedPreferences.sports.length > 0) {
          upsertData.preferred_sports = savedPreferences.sports;
        }

        if (savedPreferences.budgetMin !== undefined && savedPreferences.budgetMax !== undefined) {
          // ✅ FIX: Ensure min <= max (swap if needed)
          let min = savedPreferences.budgetMin;
          let max = savedPreferences.budgetMax;
          
          if (min > max) {
            console.warn(`⚠️ Budget range swap detected: ${min} > ${max}, swapping...`);
            [min, max] = [max, min]; // Swap values
          }
          
          upsertData.budget_range = `[${min},${max}]`;
          console.log(`💰 Saving budget range: [${min}, ${max}]`);
        }

        // Always update interaction patterns to track last visit
        const currentPatterns = {
          last_radius_km: savedPreferences.radiusKm,
          last_updated: new Date().toISOString(),
          last_checked_at: new Date().toISOString(), // Track when we last checked for new offers
        };
        
        upsertData.interaction_patterns = currentPatterns;

        const { error: prefError } = await supabaseClient
          .from('ai_user_preferences')
          .upsert(upsertData, {
            onConflict: 'user_id'
          });

        if (prefError) {
          console.error('❌ Failed to update user preferences:', prefError);
        } else {
          console.log('✅ Updated persistent user preferences');
        }
      } catch (error) {
        console.error('❌ Exception updating preferences:', error);
      }
    }
    
    // Build business profile context with saved preferences
    const preferencesText = Object.keys(savedPreferences).length > 0 
      ? `\n\n**Saved Preferences (use these as defaults):**
- Budget: ${savedPreferences.budgetMin ? `$${savedPreferences.budgetMin.toLocaleString()} - $${savedPreferences.budgetMax?.toLocaleString() || '∞'}` : 'Not set'}
- Sports: ${savedPreferences.sports?.join(', ') || 'Any'}
- Radius: ${savedPreferences.radiusKm ? `${savedPreferences.radiusKm}km` : 'Not set'}`
      : '';

    // Load past recommendation actions for proactive follow-ups and filtering
    const { data: pastActions } = await supabaseClient
      .from('ai_recommendations')
      .select(`
        user_action,
        created_at,
        package_id,
        sponsorship_offer_id,
        sponsorship_offers:sponsorship_offer_id (
          id,
          team_profiles:team_profile_id (
            team_name,
            sport
          )
        )
      `)
      .eq('conversation_id', activeConversationId)
      .not('user_action', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (pastActions && pastActions.length > 0) {
      console.log(`📊 Found ${pastActions.length} past actions for context`);
    }

    // Collect offers the user is NOT interested in (to exclude from future searches)
    const notInterestedOfferIds = pastActions
      ?.filter((action: any) => action.user_action === 'not_interested')
      ?.map((action: any) => action.sponsorship_offer_id)
      || [];

    // Collect sports they showed interest in
    const interestedSports = pastActions
      ?.filter((action: any) => ['interested', 'clicked', 'saved'].includes(action.user_action))
      ?.map((action: any) => action.sponsorship_offers?.team_profiles?.sport)
      ?.filter((sport: any) => sport)
      || [];

    console.log('🎯 User preferences from interactions:', {
      notInterestedCount: notInterestedOfferIds.length,
      interestedSportsCount: interestedSports.length,
    });

    const actionsText = pastActions && pastActions.length > 0
      ? `\n\n**Past Interactions (use these to refine recommendations):**
${pastActions.map((action: any) => {
  const teamName = action.sponsorship_offers?.team_profiles?.team_name || 'Unknown team';
  const sport = action.sponsorship_offers?.team_profiles?.sport;
  const actionLabels: Record<string, string> = {
    'clicked': '👁️ Viewed details',
    'interested': '👍 Marked interested',
    'saved': '🔖 Saved for later',
    'not_interested': '👎 Not interested',
  };
  const actionLabel = actionLabels[action.user_action] || action.user_action;
  return `- ${actionLabel}: ${teamName}${sport ? ` (${sport})` : ''}`;
}).join('\n')}

**Instructions for using interaction history:**
- DO NOT recommend teams they marked as "not interested"
- Prioritize sports they showed interest in
- Reference past interests: "Like [Team] you viewed earlier..."
- If they saved/interested but didn't convert, follow up: "Still considering [Team]?"`
      : '';
    
    const businessContext = `
**Business Profile:**
- Name: ${businessProfile?.business_name || 'Not set'}
- Industry: ${businessProfile?.industry || 'Not set'}
- Location: ${businessProfile?.city}, ${businessProfile?.state}
- Values: ${businessProfile?.main_values ? JSON.stringify(businessProfile.main_values) : 'Not specified'}${preferencesText}${actionsText}${newOffersContext}

${needsZipCode && !hasZipCode ? `
⚠️ **LOCATION MISSING**: User's location coordinates are not set. You MUST ask for their ZIP CODE in your FIRST response. 
Say something natural like: "To find teams near you, what's your zip code?"
DO NOT proceed with recommendations until you have their zip code.` : ''}
    `.trim();

    // Detect preference intent before AI call
    const asksPrefs = /current preferences|my preferences|what.*preferences|show.*preferences/i.test(message);
    
    // Prepare messages for AI with FULL conversation history
    const aiMessages = [
      { role: 'system', content: ADVISOR_SYSTEM_PROMPT },
      { role: 'system', content: businessContext },
      ...(messages || []).map(m => ({ role: m.role, content: m.content })),
    ];

    // Handle preference intent
    if (asksPrefs) {
      console.log('🔍 User asked for current preferences');
      if (Object.keys(savedPreferences).length > 0) {
        aiMessages.push({
          role: 'system',
          content: `CRITICAL: The user asked to list their saved preferences. Summarize budget, sports, radius that are known. Do NOT ask for them again. Keep under 60 words.`
        });
      } else {
        aiMessages.push({
          role: 'system',
          content: `CRITICAL: No saved preferences found. Politely say you don't have them yet and ask ONE next best clarifying question (zip if location missing else budget).`
        });
      }
    }

    // Smarter search trigger: detect conversation stage
    // (conversationText already defined above for preference extraction)
    
    // Detect if we've asked about all key topics
    const hasAskedBudget = conversationText.includes('budget') || conversationText.includes('how much');
    const hasAskedLocation = conversationText.includes('location') || conversationText.includes('where');
    const hasAskedSport = conversationText.includes('sport') || conversationText.includes('which sport');
    const hasAskedAgeGroup = conversationText.includes('age') || conversationText.includes('youth');
    const hasAskedOrgType = conversationText.includes('organization') || conversationText.includes('rec league');
    
    const allQuestionsAsked = hasAskedBudget && hasAskedLocation && (hasAskedSport || hasAskedAgeGroup || hasAskedOrgType);
    
    // Check if user has provided enough information
    const hasEnoughInfo = 
      conversationText.includes('budget') || 
      conversationText.includes('location') ||
      conversationText.includes('sport') ||
      conversationText.includes('$') ||
      conversationText.includes('dollars');

    // If AI says it's searching (common phrases), trigger immediately
    const lastAiMessage = messages?.filter(m => m.role === 'assistant').slice(-1)[0]?.content?.toLowerCase() || '';
    const aiSaidSearching = 
      lastAiMessage.includes('let me see') ||
      lastAiMessage.includes('searching') ||
      lastAiMessage.includes('let me find') ||
      lastAiMessage.includes('give me just a moment') ||
      lastAiMessage.includes("i'll find") ||
      lastAiMessage.includes("let me look");

    const userWantsResults = 
      message.toLowerCase().includes('show') ||
      message.toLowerCase().includes('find') ||
      message.toLowerCase().includes('yes') ||
      message.toLowerCase().includes('yeah') ||
      message.toLowerCase().includes('sure') ||
      message.toLowerCase().includes('great') ||
      message.toLowerCase().includes('thanks') ||
      message.toLowerCase().includes('okay') ||
      message.toLowerCase().includes('perfect');

    const shouldSearch = (hasEnoughInfo && allQuestionsAsked) || aiSaidSearching || userWantsResults;

    // ✅ CONVERSATION FLOW LOGGING
    console.log('🤖 Conversation Flow:', {
      hasEnoughInfo,
      allQuestionsAsked,
      aiSaidSearching,
      userWantsResults,
      shouldSearch,
      willTriggerSearch: shouldSearch && !!businessProfile?.location_lat,
      messageCount: messages?.length || 0,
      savedPreferences,
    });

    // ✅ STEP 3: CHECK FOR ZIP CODE IN MESSAGE AND GEOCODE
    const extractedZipCode = extractZipCode(message);
    let effectiveLatitude = businessProfile?.location_lat;
    let effectiveLongitude = businessProfile?.location_lon;
    let zipCodeProcessed = false;

    if (extractedZipCode && !effectiveLatitude && businessProfile?.id) {
      console.log('🎯 Detected zip code in message:', extractedZipCode);
      
      const geocoded = await geocodeAndUpdateProfile(
        supabaseClient,
        businessProfile.id,
        extractedZipCode,
        businessProfile.city,
        businessProfile.state
      );

      if (geocoded) {
        effectiveLatitude = geocoded.latitude;
        effectiveLongitude = geocoded.longitude;
        zipCodeProcessed = true;
        
        console.log('✅ Zip code processed successfully, coordinates obtained');
      } else {
        console.warn('❌ Geocoding failed for zip code:', extractedZipCode);
      }
    }

    let recommendations = null;
    if (shouldSearch && effectiveLatitude && effectiveLongitude) {
      console.log('🔍 Searching for recommendations with interaction filtering...');
      
      // Prefer sports they showed interest in, or use saved preferences
      const preferredSport = interestedSports.length > 0 
        ? interestedSports[0] 
        : (savedPreferences.sports?.[0] || filters?.sport || null);

      const { data: recData } = await supabaseClient.rpc('rpc_recommend_offers', {
        p_lat: businessProfile.location_lat,
        p_lon: businessProfile.location_lon,
        p_radius_km: savedPreferences.radiusKm || filters?.radiusKm || 100,
        p_budget_min: savedPreferences.budgetMin || filters?.budgetMin || 0,
        p_budget_max: savedPreferences.budgetMax || filters?.budgetMax || 999999,
        p_sport: preferredSport,
        p_limit: 10, // Get more to filter out not interested ones
      });

      // Filter out offers the user marked as "not interested"
      recommendations = recData?.filter((rec: any) => 
        !notInterestedOfferIds.includes(rec.sponsorship_offer_id)
      ).slice(0, 3); // Take top 3 after filtering

      console.log(`✅ Found ${recData?.length || 0} recommendations, showing ${recommendations?.length || 0} after filtering`);

      // ✅ ADD RECOMMENDATIONS TO AI CONTEXT - BEFORE AI GENERATES RESPONSE
      if (recommendations && recommendations.length > 0) {
        // ✅ STEP 3: Add success message if zip code was just processed
        const zipSuccessMessage = zipCodeProcessed 
          ? `\n\n✅ SUCCESS: User provided zip code ${extractedZipCode}. Location is now set (${effectiveLatitude?.toFixed(4)}, ${effectiveLongitude?.toFixed(4)}). Proceed with showing recommendations!\n\n` 
          : '';
        
        const recommendationsText = `
SYSTEM INSTRUCTION - DO NOT REPEAT THIS TEXT:${zipSuccessMessage}
You have ${recommendations.length} sponsorship opportunities available:

${recommendations.map((r: any, i: number) => `
Option ${i + 1}:
- Team: ${r.team_name}
- Sport: ${r.sport || 'Not specified'}
- Distance: ${r.distance_km?.toFixed(1)}km from user
- Price: $${r.price}
- Reach: ${r.total_reach} people
- Package: ${r.package_name}
- Est. CPF: ${r.est_cpf ? `$${r.est_cpf.toFixed(2)}` : 'N/A'}
- Marketplace URL: ${r.marketplace_url}
`).join('\n')}

INSTRUCTIONS:
1. Present these CONVERSATIONALLY - do NOT copy this system message
2. Mention the top 1 option with key details (team name, distance, price, reach)
3. Say "I found X teams" not "Search Results Found"
4. Keep response under 100 words
5. The UI will show recommendation cards automatically with clickable links
6. NEVER include JSON or system message text in your response
        `.trim();

        aiMessages.push({
          role: 'system',
          content: recommendationsText
        });
      } else if (shouldSearch) {
        // ✅ STEP 5: Check if geocoding failed
        if (extractedZipCode && !zipCodeProcessed) {
          const geocodingFailedMessage = `
CRITICAL: GEOCODING FAILED
The user provided zip code "${extractedZipCode}" but it couldn't be geocoded.

REQUIRED RESPONSE:
"I'm having trouble finding that zip code. Could you double-check it? Or you can provide your city and state instead."

DO NOT proceed with showing recommendations until location is set.
          `.trim();

          aiMessages.push({
            role: 'system',
            content: geocodingFailedMessage
          });
        } else {
          // ✅ PHASE 2: Explicit 0-results message to prevent hallucination
          const noResultsMessage = `
CRITICAL SYSTEM ALERT - 0 RESULTS FOUND:
The database search returned ZERO (0) sponsorship opportunities matching the criteria.

REQUIRED RESPONSE (use this EXACT message):
"I couldn't find any teams matching those criteria right now. Want to try a different location, budget, or sport?"

DO NOT:
- Invent team names that don't exist
- Suggest made-up sponsorship offers
- Fabricate prices or details
- Say you found results when you didn't

ONLY teams explicitly listed in your context exist. If not listed = does not exist.
          `.trim();

          aiMessages.push({
            role: 'system',
            content: noResultsMessage
          });
        }
      }
    }

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const assistantMessage = aiData.choices[0].message.content;

    // ✅ ADD LOGGING TO MONITOR CONVERSATION FLOW
    console.log('📊 Conversation Stats:', {
      messageCount: messages?.length || 0,
      hasRecommendations: !!recommendations?.length,
      recommendationCount: recommendations?.length || 0,
      responseLength: assistantMessage.length,
      conversationId: activeConversationId,
      searchTriggered: shouldSearch,
    });

    if (assistantMessage.length > 400) {
      console.warn('⚠️ AI response too long:', assistantMessage.length, 'chars');
    }

    // Store assistant message
    const { data: savedMessage, error: saveError } = await supabaseClient
      .from('ai_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'assistant',
        content: assistantMessage,
        metadata: recommendations ? { recommendations } : {},
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Failed to save assistant message:', saveError);
    } else {
      console.log('✅ Saved assistant message with ID:', savedMessage?.id);
    }

    // Store recommendations for tracking with full data
    if (recommendations?.length > 0 && savedMessage?.id) {
      try {
        const recommendationLogs = recommendations.map((rec: any) => ({
          conversation_id: activeConversationId,
          message_id: savedMessage.id,
          sponsorship_offer_id: rec.sponsorship_offer_id,
          package_id: rec.package_id,
          recommendation_reason: 'AI recommendation based on user query',
          recommendation_data: rec, // ✅ Store full recommendation object for display
        }));

        const { data: insertedRecs, error: recError } = await supabaseClient
          .from('ai_recommendations')
          .insert(recommendationLogs)
          .select();

        if (recError) {
          console.error('❌ Failed to store recommendations:', recError);
          console.error('Recommendation data:', JSON.stringify(recommendationLogs, null, 2));
        } else {
          console.log(`💾 Successfully stored ${insertedRecs.length} recommendations with full data`);
        }
      } catch (error) {
        console.error('❌ Exception storing recommendations:', error);
      }
    } else if (recommendations?.length > 0 && !savedMessage?.id) {
      console.error('⚠️ Cannot store recommendations: savedMessage.id is missing');
    }

    // Update conversation activity
    await supabaseClient
      .from('ai_conversations')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', activeConversationId);

    return new Response(
      JSON.stringify({
        conversationId: activeConversationId,
        message: assistantMessage,
        recommendations,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-advisor:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
