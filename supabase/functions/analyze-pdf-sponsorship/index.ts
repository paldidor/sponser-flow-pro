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
    const { pdfUrl, offerId, userId, teamProfileId } = await req.json();

    if (!pdfUrl || !offerId || !userId) {
      throw new Error('Missing required parameters: pdfUrl, offerId, or userId');
    }

    console.log(`Processing PDF from: ${pdfUrl} for offer: ${offerId}`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

    // Fetch team profile if not provided
    let finalTeamProfileId = teamProfileId;
    if (!finalTeamProfileId) {
      console.log('Fetching team profile for user:', userId);
      const { data: teamProfile } = await supabase
        .from('team_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      finalTeamProfileId = teamProfile?.id || null;
      console.log('Team profile ID:', finalTeamProfileId);
    }

    // Update status to analyzing immediately
    await supabase
      .from('sponsorship_offers')
      .update({ analysis_status: 'analyzing' })
      .eq('id', offerId)
      .eq('user_id', userId);

    // Start background task for heavy processing
    const analysisPromise = performAnalysis(pdfUrl, offerId, userId, finalTeamProfileId, supabase);
    
    // Start analysis asynchronously (fire and forget)
    analysisPromise.catch((err) => {
      console.error('Background analysis error:', err);
    });

    // Return immediate response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analysis started',
        offerId: offerId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error starting PDF analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to start analysis';
    
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

// Main analysis function that runs in background
async function performAnalysis(
  pdfUrl: string,
  offerId: string,
  userId: string,
  teamProfileId: string | null,
  supabase: any
) {

  try {
    // Download PDF content with timeout
    console.log('Downloading PDF content...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const pdfResponse = await fetch(pdfUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.statusText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log(`PDF downloaded, size: ${pdfBuffer.byteLength} bytes`);

    // Extract text from PDF using pdfjs-serverless (designed for Deno/Edge Functions)
    console.log('Extracting text from PDF...');
    const pdfjsServerless = await import('https://esm.sh/pdfjs-serverless@0.5.0');
    
    // Resolve the PDF.js library (no worker setup needed with pdfjs-serverless)
    const pdfjsLib = await pdfjsServerless.resolvePDFJS();

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdfDoc = await loadingTask.promise;
    
    console.log(`PDF loaded, ${pdfDoc.numPages} pages`);

    if (pdfDoc.numPages === 0) {
      throw new Error('PDF has no pages');
    }

    if (pdfDoc.numPages > 50) {
      console.warn(`PDF has ${pdfDoc.numPages} pages, processing first 50 only`);
    }

    // Extract text from all pages (max 50)
    let extractedText = '';
    const maxPages = Math.min(pdfDoc.numPages, 50);
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      extractedText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
    }

    console.log(`Text extraction completed, ${extractedText.length} characters extracted`);

    // Validate extracted text
    const cleanedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (cleanedText.length < 100) {
      throw new Error('PDF appears to contain little to no text. Please ensure your PDF has extractable text content, not just images.');
    }

    // Chunk text for large PDFs to optimize token usage
    const maxChunkSize = 8000; // Conservative limit for context window
    let textToAnalyze = cleanedText;
    
    if (cleanedText.length > maxChunkSize) {
      console.log(`Large PDF detected (${cleanedText.length} chars), chunking for optimization`);
      
      // Extract the most relevant sections (first 60% and last 20%)
      const firstPart = cleanedText.substring(0, Math.floor(cleanedText.length * 0.6));
      const lastPart = cleanedText.substring(Math.floor(cleanedText.length * 0.8));
      
      textToAnalyze = firstPart + '\n\n[... content truncated for analysis ...]\n\n' + lastPart;
      console.log(`Chunked to ${textToAnalyze.length} characters for analysis`);
    }

    extractedText = textToAnalyze;

    // Prepare the AI analysis prompt with comprehensive extraction rules
    const systemPrompt = `You are a senior Sponsorship Manager (20+ yrs) and precision information-extraction specialist for U.S. youth sports organizations. Your mandate is to read one uploaded sponsorship PDF deck and return structured data—faithful to the document, free of guesses, and normalized for pricing/terms. You are cautious, fact-driven, and optimized for mixed-quality PDFs (letters, brochures, forms, menus, scanned).

Key behaviors:
- No hallucinations. If a value isn't explicitly present, leave numbers as null, strings as "", arrays as [].
- Concise & normalized. Prices are numbers (no symbols/commas). Terms are short, human-readable strings. Placements are short labels.
- Context-aware. Understand "per year/season" vs. "flat," multi-year minimums, and season language (Fall–Spring, etc.).
- Evidence first. Prefer explicit counts (players/participants/families) and clearly labeled packages.

EXTRACTION REQUIREMENTS:

1. funding_goal (number or null):
   - Capture a single explicit dollar target (e.g., "Goal: $25,000" → 25000)
   - Strip symbols/commas → $25,000 → 25000
   - If range, "about/over/~", or missing → return null
   - Keywords: goal, target, raise, campaign, capital improvements, project budget, "funds needed"
   - DON'T: Use sponsor package totals as goal, sum line items, or convert individual prices

2. sponsorship_term (string or ""):
   - Duration/cadence in plain language: "1 season (Fall–Spring)", "Per year; 2-year minimum", "Per season", "Per month (12-month term)"
   - If missing → return ""
   - Look in: fine print on package pages, scoreboard sections, order forms
   - If only specific packages have terms → keep cost as number and append to package name (e.g., "Scoreboard – Side Panel (per year, 2-year min)")
   - DON'T: Invent terms from website banner dates

3. sponsorship_impact (string or ""):
   - Comma-separated list of explicit fund uses: "equipment & uniforms, field/facility improvements, scholarships/financial aid, tournaments & travel, coaching/clinics, operations"
   - If missing → return ""
   - Prefer exact phrases ("pitching machines," "turf," "steel roofing") grouped into categories
   - DON'T: Add generic uses not in PDF

4. packages (array of {name, cost, placements[]}):
   - name: tier or opportunity (e.g., "Bronze", "Gold", "Homerun", "Scoreboard – Top Panel")
   - cost: number only (strip $ and commas); if missing → null; express cadence in term or name suffix
   - placements[]: short, noun-style labels for each benefit:
     * "3×5 field banner"
     * "website logo & link"
     * "social media spotlight"
     * "league newsletter mention"
     * "vendor table at Opening Day"
     * "thank-you plaque"
     * "scoreboard side panel"
     * "team name on jersey sleeve"
   - Keep placements short; remove filler ("includes", "plus…") and verbs
   - Include dimensions/quantities/duration if stated: "1 banner on fence (1 season)", "4×8 premium banner"
   - One package per named level with nearby price
   - Edge cases: if no price → cost: null; if limited ("Only 3 available") → ignore limit but keep placements
   - DON'T: Merge separate opportunities (e.g., "Scoreboard – Entire" vs "Top Panel"), copy full sentences into placements
   - Look in: tier tables (Bronze/Silver/Gold), menu pages (Single/Double/Triple/Homerun), special sections (Scoreboard/Field/Uniform), order forms

5. total_players_supported (number or null):
   - Prefer players; if only participants/families/teams → use that count
   - If approximate/adjectives ("about/over/~", "hundreds") → return null
   - Look in: "About us" page, first/last page, membership stats, letter text, sponsor form
   - DON'T: Convert families to players, sum age-group counts unless clearly stated

CROSS-FIELD RULES:
- No guesses. If not explicit → null for numbers, "" for strings, [] for arrays
- Currency: assume USD when $ appears; store numbers without symbols/commas
- Cadence & minimums: never in cost; express as text in sponsorship_term or name suffix
- OCR/cleaning: normalize whitespace, join hyphen-breaks, convert bullets to short labels, drop page headers/footers
- Priority: Packages are most important—ensure every priced tier/opportunity becomes one array item

Return ONLY valid JSON with this exact structure:
{
  "funding_goal": number or null,
  "sponsorship_term": "string or empty",
  "sponsorship_impact": "string or empty",
  "packages": [
    {
      "name": "string",
      "cost": number or null,
      "placements": ["string", "string"]
    }
  ],
  "total_players_supported": number or null
}`;

    const userPrompt = `PDF Content to analyze:\n\n${extractedText}`;

    // Call OpenAI API with retry logic
    console.log('Calling OpenAI API for analysis...');
    let openAIResponse;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-5-mini-2025-08-07',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: userPrompt
              }
            ],
            max_completion_tokens: 2000,
          }),
        });

        if (openAIResponse.ok) {
          break; // Success, exit retry loop
        }

        // Handle rate limits with exponential backoff
        if (openAIResponse.status === 429) {
          retryCount++;
          if (retryCount < maxRetries) {
            const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
            console.log(`Rate limited, waiting ${waitTime}ms before retry ${retryCount}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }

        throw new Error(`OpenAI API error: ${openAIResponse.statusText} (${openAIResponse.status})`);
      } catch (fetchError) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw fetchError;
        }
        console.log(`API call failed, retrying ${retryCount}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!openAIResponse || !openAIResponse.ok) {
      const errorData = await openAIResponse?.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API failed after ${maxRetries} retries`);
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

    // Validate required fields with detailed error messages
    const missingFields = [];
    // Allow 0 as valid value (means "not specified in PDF")
    if (parsedData.funding_goal === undefined || parsedData.funding_goal === null) {
      missingFields.push('funding_goal');
    }
    if (!parsedData.sponsorship_term) missingFields.push('sponsorship_term');
    if (!parsedData.sponsorship_impact) missingFields.push('sponsorship_impact');
    
    console.log('Validation check - funding_goal:', parsedData.funding_goal, 'missing:', missingFields);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields.join(', '));
      console.error('Partial data received:', JSON.stringify(parsedData, null, 2));
      
      // Still save partial data if we have at least the basic info
      if (parsedData.funding_goal !== undefined || parsedData.sponsorship_term) {
        console.log('Saving partial data with funding_goal:', parsedData.funding_goal);
        await supabase
          .from('sponsorship_offers')
          .update({
            fundraising_goal: parsedData.funding_goal || 0,
            duration: parsedData.sponsorship_term || 'Not specified',
            impact: parsedData.sponsorship_impact || 'Analysis incomplete - please review manually',
            supported_players: parsedData.total_players_supported || null,
            analysis_status: 'completed',
            title: parsedData.funding_goal ? `Sponsorship Offer - $${parsedData.funding_goal} Goal` : 'Sponsorship Offer - Goal TBD',
          })
          .eq('id', offerId)
          .eq('user_id', userId);
      }
      
      throw new Error(`AI analysis incomplete. Missing: ${missingFields.join(', ')}. Please try again or enter information manually.`);
    }

    // Validate data types (allow 0 as valid value)
    if (typeof parsedData.funding_goal !== 'number') {
      console.warn('Invalid funding_goal type, attempting conversion');
      parsedData.funding_goal = parseFloat(String(parsedData.funding_goal).replace(/[^0-9.]/g, '')) || 0;
    }
    
    // Ensure non-negative
    if (parsedData.funding_goal < 0) {
      console.warn('Negative funding_goal detected, setting to 0');
      parsedData.funding_goal = 0;
    }

    if (!Array.isArray(parsedData.packages)) {
      console.warn('Packages is not an array, converting');
      parsedData.packages = parsedData.packages ? [parsedData.packages] : [];
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
        title: parsedData.funding_goal > 0 ? `Sponsorship Offer - $${parsedData.funding_goal} Goal` : 'Sponsorship Offer - Goal TBD',
        team_profile_id: teamProfileId,
        status: 'published',
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
            benefits: [],
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
            const matchedOption = placementOptions?.find((opt: any) => 
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

    return { success: true, data: parsedData };

  } catch (error) {
    console.error('Error in performAnalysis:', error);

    // Determine error type for better user messages
    let errorMessage = 'An error occurred during PDF analysis';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || '';
      
      // Handle specific error types
      if (errorMessage.includes('abort')) {
        errorMessage = 'PDF download timed out. Please try with a smaller file.';
      } else if (errorMessage.includes('text content')) {
        errorMessage = 'PDF contains no extractable text. Please ensure your PDF is text-based, not scanned images.';
      } else if (errorMessage.includes('Rate limit') || errorMessage.includes('429')) {
        errorMessage = 'AI service is temporarily busy. Please try again in a moment.';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
        errorMessage = 'Analysis took too long. Please try with a smaller PDF or contact support.';
      } else if (errorMessage.includes('parse') || errorMessage.includes('JSON')) {
        errorMessage = 'Failed to understand PDF structure. Please ensure your PDF follows a standard sponsorship format.';
      }
    }

    console.error('Error details:', errorDetails);

    // Update status to error
    try {
      await supabase
        .from('sponsorship_offers')
        .update({ 
          analysis_status: 'error',
          impact: `Analysis failed: ${errorMessage}`
        })
        .eq('id', offerId)
        .eq('user_id', userId);
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }

    return { success: false, error: errorMessage };
  }
}

// Handle function shutdown
addEventListener('beforeunload', (ev) => {
  console.log('Function shutdown');
});
