import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfUrl } = await req.json();

    if (!pdfUrl) {
      throw new Error('PDF URL is required');
    }

    console.log('Analyzing PDF from URL:', pdfUrl);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the PDF from storage using the full path
    console.log('Downloading PDF from path:', pdfUrl);
    const { data: pdfData, error: downloadError } = await supabase.storage
      .from('sponsorship-pdfs')
      .download(pdfUrl);

    if (downloadError) {
      console.error('Error downloading PDF from path:', pdfUrl, downloadError);
      throw new Error(`Failed to download PDF: ${downloadError.message}`);
    }

    console.log('PDF downloaded successfully, size:', pdfData.size);

    // Convert PDF to base64
    const arrayBuffer = await pdfData.arrayBuffer();
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log('Sending PDF to OpenAI for analysis...');

    // Call OpenAI API with vision model to analyze the PDF
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a sponsorship manager with over 20 years of experience building and crafting sponsorship offers and packages for youth sports teams. You specialize in creating emotional, effective sponsorship offers that resonate with potential sponsors.

Analyze the provided PDF sponsorship deck and extract information in this EXACT JSON format:

{
  "title": "extracted or inferred campaign title",
  "funding_goal": numeric_value_only,
  "duration": "sponsorship term like Annual, Season, or Monthly",
  "impact": "detailed description of what the money will be used for (scholarships, travel, equipment, etc.)",
  "supported_players": numeric_value_only,
  "packages": [
    {
      "name": "package name",
      "price": numeric_price_only,
      "benefits": ["benefit 1", "benefit 2"],
      "placements": ["placement 1", "placement 2"]
    }
  ]
}

Important:
- Extract all numerical values as numbers, not strings
- If a value is not found, use reasonable defaults based on context
- For packages, identify all tiers (Bronze, Silver, Gold, etc.) with their specific benefits and placement opportunities
- Focus on making the offer emotionally compelling and clear`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this sponsorship deck PDF and extract the structured information as specified.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let extractedData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      extractedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw content:', content);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    console.log('Successfully extracted data:', extractedData);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: extractedData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-pdf function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
