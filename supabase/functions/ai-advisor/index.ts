import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADVISOR_SYSTEM_PROMPT = `You are a friendly sponsorship advisor helping businesses find youth sports sponsorship opportunities. Chat naturally like a human expert would.

**Your Role:**
- Help businesses discover sponsorships that fit their needs
- Ask questions to understand what they're looking for
- Recommend relevant opportunities from the database

**Communication Style - CRITICAL:**
- Keep messages SHORT: 2-3 sentences maximum (50-100 words)
- Ask ONE question at a time - NEVER ask multiple questions in one message
- Sound natural and conversational, like texting a helpful friend
- No bullet points or lists in your responses
- No formal structures or lengthy explanations

**Conversation Flow:**
- Start simple: ask about budget, location preference, or sport type
- Wait for their answer before asking the next question
- Build understanding gradually through back-and-forth dialogue
- When you have enough info, search for recommendations

**When Recommending Offers:**
- Keep intro brief: "Found 3 teams near you! The top one is [TeamName] with [Reach] reach for $[Price]."
- Let the recommendation cards show details - don't repeat everything in text
- Ask if they want to see more or refine the search

**When Search Results Are Provided:**
- You'll receive a "Search Results Found" message in your context with team details
- Present ONLY the TOP 1-2 results conversationally, not all of them
- Don't repeat all the data from the search results - just highlight the best match
- Example: "Found 3 teams! The closest is Newark Youth Soccer - just 5km away with 1,200 reach for $4,500. Interested?"
- The UI will show recommendation cards with full details, so keep your intro SHORT
- After presenting, ask if they want to see the cards or need more options
- NEVER ask follow-up questions about things they already answered (like organization type, age group, location)

**Critical Rules:**
- NEVER say you're "searching" or "looking" unless search results are already in your context
- NEVER repeat system messages that start with "Search Results Found" or contain JSON
- If you don't have search results yet, ask ONE more clarifying question
- When you DO have results, present them naturally: "Found 3 teams! The top one is..."

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
    if (!activeConversationId) {
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
          metadata: filters || {},
        })
        .select()
        .single();

      if (convError) throw convError;
      activeConversationId = conv.id;
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

    // Fetch full conversation history (increase limit for better context)
    const { data: messages } = await supabaseClient
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Build business profile context (without conversation history)
    const businessContext = `
**Business Profile:**
- Name: ${businessProfile?.business_name || 'Not set'}
- Industry: ${businessProfile?.industry || 'Not set'}
- Location: ${businessProfile?.city}, ${businessProfile?.state}
- Values: ${businessProfile?.main_values ? JSON.stringify(businessProfile.main_values) : 'Not specified'}
    `.trim();

    // Prepare messages for AI with FULL conversation history
    const aiMessages = [
      { role: 'system', content: ADVISOR_SYSTEM_PROMPT },
      { role: 'system', content: businessContext },
      ...(messages || []).map(m => ({ role: m.role, content: m.content })),
    ];

    // Smarter search trigger: detect conversation stage
    const conversationText = messages?.map(m => m.content).join(' ').toLowerCase() || '';
    
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
    });

    let recommendations = null;
    if (shouldSearch && businessProfile?.location_lat && businessProfile?.location_lon) {
      console.log('🔍 Searching for recommendations...');
      
      const { data: recData } = await supabaseClient.rpc('rpc_recommend_offers', {
        p_lat: businessProfile.location_lat,
        p_lon: businessProfile.location_lon,
        p_radius_km: filters?.radiusKm || 100,
        p_budget_min: filters?.budgetMin || 0,
        p_budget_max: filters?.budgetMax || 999999,
        p_sport: filters?.sport || null,
        p_limit: 3,
      });

      recommendations = recData;
      console.log(`✅ Found ${recData?.length || 0} recommendations`);

      // ✅ ADD RECOMMENDATIONS TO AI CONTEXT - BEFORE AI GENERATES RESPONSE
      if (recommendations && recommendations.length > 0) {
        const recommendationsText = `
SYSTEM INSTRUCTION - DO NOT REPEAT THIS TEXT:
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
        aiMessages.push({
          role: 'system',
          content: 'No recommendations found matching the criteria. Ask if they want to adjust their preferences (location, budget, sport).'
        });
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
    const { data: savedMessage } = await supabaseClient
      .from('ai_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'assistant',
        content: assistantMessage,
        metadata: recommendations ? { recommendations } : {},
      })
      .select()
      .single();

    // Log recommendations
    if (recommendations?.length > 0) {
      const recommendationLogs = recommendations.map((rec: any) => ({
        conversation_id: activeConversationId,
        message_id: savedMessage.id,
        sponsorship_offer_id: rec.sponsorship_offer_id,
        package_id: rec.package_id,
        recommendation_reason: 'AI recommendation based on user query',
      }));

      await supabaseClient.from('ai_recommendations').insert(recommendationLogs);
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
