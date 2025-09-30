import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as pdfjs from 'https://esm.sh/pdfjs-dist@4.0.379/legacy/build/pdf.mjs';

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

    // Extract text from PDF
    console.log('Extracting text from PDF...');
    const arrayBuffer = await pdfData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;
    
    console.log(`PDF loaded, ${pdfDocument.numPages} pages`);
    
    // Extract text from all pages
    let pdfText = '';
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      pdfText += pageText + '\n';
    }
    
    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF');
    }
    
    console.log('Text extracted successfully, length:', pdfText.length);
    console.log('Sending text to OpenAI for analysis...');

    // Call OpenAI API with vision model to analyze the PDF
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are a sponsorship manager with over 20 years of experience building and crafting sponsorship offers and packages for youth sports teams. You specialize in creating emotional, effective sponsorship offers that resonate with potential sponsors.

Analyze the provided sponsorship deck text content and extract information in this EXACT JSON format:

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
- Focus on making the offer emotionally compelling and clear
- Parse through the text carefully to identify sponsorship levels, pricing, and benefits`
          },
          {
            role: 'user',
            content: `Please analyze this sponsorship deck text content and extract the structured information as specified.\n\nSPONSORSHIP DECK CONTENT:\n\n${pdfText}`
          }
        ],
        max_completion_tokens: 4096
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
    let parsedData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw content:', content);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    console.log('Successfully extracted data:', parsedData);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: parsedData 
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
