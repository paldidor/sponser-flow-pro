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

    const { data: messages } = await supabaseClient
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    const conversationHistory = messages?.length 
      ? `\n\nRecent conversation:\n${messages.map(m => `[${m.role}]: ${m.content}`).join('\n')}`
      : '';

    const context = `
**Business Profile:**
- Name: ${businessProfile?.business_name || 'Not set'}
- Industry: ${businessProfile?.industry || 'Not set'}
- Location: ${businessProfile?.city}, ${businessProfile?.state}
- Values: ${businessProfile?.main_values ? JSON.stringify(businessProfile.main_values) : 'Not specified'}
${conversationHistory}
    `.trim();

    // Prepare messages for AI
    const aiMessages = [
      { role: 'system', content: ADVISOR_SYSTEM_PROMPT },
      { role: 'system', content: `Context:\n${context}` },
      { role: 'user', content: message },
    ];

    // Check if we should search for recommendations
    let recommendations = null;
    const shouldSearch = message.toLowerCase().includes('show') || 
                        message.toLowerCase().includes('find') ||
                        message.toLowerCase().includes('recommend') ||
                        message.toLowerCase().includes('suggest');

    if (shouldSearch && businessProfile?.location_lat && businessProfile?.location_lon) {
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
