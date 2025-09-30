import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting PDF analysis request');

    // Get request data
    const { pdfUrl, offerId, userId } = await req.json();

    if (!pdfUrl || !offerId || !userId) {
      throw new Error('Missing required parameters: pdfUrl, offerId, or userId');
    }

    console.log(`Processing PDF from: ${pdfUrl} for offer: ${offerId}`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

    // Update status to analyzing
    await supabase
      .from('sponsorship_offers')
      .update({ analysis_status: 'analyzing' })
      .eq('id', offerId)
      .eq('user_id', userId);

    // Download PDF content
    console.log('Downloading PDF content...');
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.statusText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log(`PDF downloaded, size: ${pdfBuffer.byteLength} bytes`);

    // Extract text from PDF using pdfjs-dist
    console.log('Extracting text from PDF...');
    const pdfjsLib = await import('https://esm.sh/pdfjs-dist@4.0.379/build/pdf.mjs');
    
    // Set worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs';

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdfDoc = await loadingTask.promise;
    
    console.log(`PDF loaded, ${pdfDoc.numPages} pages`);

    // Extract text from all pages
    let extractedText = '';
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      extractedText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
    }

    console.log(`Text extraction completed, ${extractedText.length} characters extracted`);

    // Clean and preprocess text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Prepare the AI analysis prompt
    const prompt = `You are a sponsorship manager with over 20 years of experience crafting sponsorship offers and packages for youth sports teams. Your task is to act as a Sponsorship Agent that converts the content of an uploaded PDF deck into structured sponsorship package data.

Analyze the text of the PDF carefully and extract the following key information:

- Funding goal: The total amount of money the team aims to raise.
- Sponsorship term: Duration of the sponsorship agreement (e.g., number of months or seasons).
- Sponsorship impact: Detailed explanation of what the funding will be used for (scholarships, travel expenses, equipment, etc.).
- Sponsorship packages: For each package, list the package name, cost, and all benefits or placements included (e.g., logo placement, banner ads, event naming rights).
- Total players supported by the sponsorship.

Return the response as a structured JSON object with the following format:

{
  "funding_goal": "number",
  "sponsorship_term": "string",
  "sponsorship_impact": "string",
  "packages": [
    {
      "name": "string",
      "cost": "number",
      "placements": ["string", "string", "..."]
    }
  ],
  "total_players_supported": "number"
}

Ensure that the JSON is parseable and complete.

PDF Content:
${extractedText}`;

    // Call OpenAI API
    console.log('Calling OpenAI API for analysis...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a sponsorship analysis expert. Always return valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const aiResult = await openAIResponse.json();
    console.log('OpenAI analysis completed');

    const analysisText = aiResult.choices[0].message.content;
    
    // Parse the JSON response
    let parsedData;
    try {
      // Remove markdown code blocks if present
      const jsonText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(jsonText);
      console.log('Successfully parsed AI response:', parsedData);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown error';
      throw new Error(`Failed to parse AI response: ${errorMessage}`);
    }

    // Validate required fields
    if (!parsedData.funding_goal || !parsedData.sponsorship_term || !parsedData.sponsorship_impact) {
      throw new Error('Missing required fields in AI response');
    }

    // Update the sponsorship offer with extracted data
    console.log('Updating sponsorship offer in database...');
    const { error: updateError } = await supabase
      .from('sponsorship_offers')
      .update({
        fundraising_goal: parsedData.funding_goal,
        duration: parsedData.sponsorship_term,
        impact: parsedData.sponsorship_impact,
        supported_players: parsedData.total_players_supported || null,
        analysis_status: 'completed',
        title: `Sponsorship Offer - ${parsedData.funding_goal} Goal`,
      })
      .eq('id', offerId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to update offer: ${updateError.message}`);
    }

    // Fetch all available placement options to match against
    console.log('Fetching placement options...');
    const { data: placementOptions, error: placementError } = await supabase
      .from('placement_options')
      .select('id, name, category');

    if (placementError) {
      console.error('Failed to fetch placement options:', placementError);
      throw new Error(`Failed to fetch placement options: ${placementError.message}`);
    }

    // Create sponsorship packages and their placements
    console.log('Creating sponsorship packages...');
    if (parsedData.packages && Array.isArray(parsedData.packages)) {
      for (let i = 0; i < parsedData.packages.length; i++) {
        const pkg = parsedData.packages[i];
        
        // Insert package
        const { data: packageData, error: packageError } = await supabase
          .from('sponsorship_packages')
          .insert({
            sponsorship_offer_id: offerId,
            name: pkg.name,
            price: pkg.cost,
            description: `Package includes: ${pkg.placements?.join(', ') || 'various benefits'}`,
            benefits: pkg.placements || [],
            package_order: i + 1,
          })
          .select()
          .single();

        if (packageError) {
          console.error(`Failed to create package ${pkg.name}:`, packageError);
          continue; // Continue with other packages
        }

        console.log(`Created package: ${pkg.name}`);

        // Match placements to placement_options and create links
        if (pkg.placements && Array.isArray(pkg.placements)) {
          for (const placementName of pkg.placements) {
            // Find matching placement option (case-insensitive partial match)
            const matchedOption = placementOptions?.find(opt => 
              opt.name.toLowerCase().includes(placementName.toLowerCase()) ||
              placementName.toLowerCase().includes(opt.name.toLowerCase())
            );

            if (matchedOption) {
              const { error: linkError } = await supabase
                .from('package_placements')
                .insert({
                  package_id: packageData.id,
                  placement_option_id: matchedOption.id,
                });

              if (linkError) {
                console.error(`Failed to link placement ${placementName}:`, linkError);
              } else {
                console.log(`Linked placement: ${placementName} -> ${matchedOption.name}`);
              }
            } else {
              console.log(`No matching placement option found for: ${placementName}`);
            }
          }
        }
      }
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedData,
        message: 'PDF analysis completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-pdf-sponsorship function:', error);

    // Try to update status to error if we have the offerId
    try {
      const { offerId, userId } = await req.json();
      if (offerId && userId && supabaseUrl && supabaseServiceRoleKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        await supabase
          .from('sponsorship_offers')
          .update({ analysis_status: 'error' })
          .eq('id', offerId)
          .eq('user_id', userId);
      }
    } catch (statusUpdateError) {
      console.error('Failed to update error status:', statusUpdateError);
    }

    const errorMessage = error instanceof Error ? error.message : 'An error occurred during PDF analysis';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
