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

    // Enhanced validation: Accept null for missing numbers, empty strings for missing text
    console.log('Raw parsed data:', JSON.stringify(parsedData, null, 2));
    
    // Normalize funding_goal
    let normalizedFundingGoal: number | null = null;
    if (parsedData.funding_goal !== undefined && parsedData.funding_goal !== null && parsedData.funding_goal !== "") {
      if (typeof parsedData.funding_goal === 'number') {
        normalizedFundingGoal = parsedData.funding_goal >= 0 ? parsedData.funding_goal : null;
      } else if (typeof parsedData.funding_goal === 'string') {
        // Strip $, commas, and convert to number
        const cleaned = String(parsedData.funding_goal).replace(/[$,\s]/g, '');
        const parsed = parseFloat(cleaned);
        normalizedFundingGoal = !isNaN(parsed) && parsed >= 0 ? parsed : null;
      }
    }
    
    // Normalize sponsorship_term (preserve AI format, accept empty string)
    const normalizedTerm = typeof parsedData.sponsorship_term === 'string' 
      ? parsedData.sponsorship_term.trim() 
      : "";
    
    // Normalize sponsorship_impact (preserve AI format, accept empty string)
    const normalizedImpact = typeof parsedData.sponsorship_impact === 'string' 
      ? parsedData.sponsorship_impact.trim() 
      : "";
    
    // Normalize total_players_supported (accept null for missing/approximate)
    let normalizedPlayersSupported: number | null = null;
    if (parsedData.total_players_supported !== undefined && parsedData.total_players_supported !== null) {
      if (typeof parsedData.total_players_supported === 'number') {
        normalizedPlayersSupported = parsedData.total_players_supported >= 0 ? parsedData.total_players_supported : null;
      } else if (typeof parsedData.total_players_supported === 'string') {
        const parsed = parseInt(String(parsedData.total_players_supported).replace(/[^0-9]/g, ''));
        normalizedPlayersSupported = !isNaN(parsed) && parsed >= 0 ? parsed : null;
      }
    }
    
    // Validate and normalize packages array
    let normalizedPackages: Array<{name: string, cost: number | null, placements: string[]}> = [];
    if (Array.isArray(parsedData.packages)) {
      normalizedPackages = parsedData.packages
        .filter((pkg: any) => pkg && typeof pkg === 'object' && pkg.name)
        .map((pkg: any) => {
          // Normalize package cost
          let normalizedCost: number | null = null;
          if (pkg.cost !== undefined && pkg.cost !== null && pkg.cost !== "") {
            if (typeof pkg.cost === 'number') {
              normalizedCost = pkg.cost >= 0 ? pkg.cost : null;
            } else if (typeof pkg.cost === 'string') {
              const cleaned = String(pkg.cost).replace(/[$,\s]/g, '');
              const parsed = parseFloat(cleaned);
              normalizedCost = !isNaN(parsed) && parsed >= 0 ? parsed : null;
            }
          }
          
          // Normalize placements (ensure short labels, remove full sentences)
          let normalizedPlacements: string[] = [];
          if (Array.isArray(pkg.placements)) {
            normalizedPlacements = pkg.placements
              .filter((p: any) => typeof p === 'string' && p.trim().length > 0)
              .map((p: string) => {
                // Keep short labels, truncate if too long (likely a full sentence)
                const trimmed = p.trim();
                return trimmed.length > 100 ? trimmed.substring(0, 100) + '...' : trimmed;
              });
          }
          
          return {
            name: String(pkg.name).trim(),
            cost: normalizedCost,
            placements: normalizedPlacements
          };
        });
    }
    
    console.log('Normalized data:', {
      funding_goal: normalizedFundingGoal,
      sponsorship_term: normalizedTerm,
      sponsorship_impact: normalizedImpact,
      total_players_supported: normalizedPlayersSupported,
      packages_count: normalizedPackages.length
    });
    
    // Check if we have at least packages (most important data)
    if (normalizedPackages.length === 0) {
      console.error('No valid packages found in AI response');
      throw new Error('PDF analysis did not extract any sponsorship packages. Please ensure your PDF contains clearly labeled package tiers with pricing information, or try manual entry.');
    }

    // Generate title based on normalized data
    let offerTitle = 'Sponsorship Offer';
    if (normalizedFundingGoal && normalizedFundingGoal > 0) {
      offerTitle = `Sponsorship Offer - $${normalizedFundingGoal.toLocaleString()} Goal`;
    } else if (normalizedTerm) {
      offerTitle = `Sponsorship Offer - ${normalizedTerm}`;
    } else if (normalizedPackages.length > 0) {
      offerTitle = `Sponsorship Offer - ${normalizedPackages.length} Package${normalizedPackages.length > 1 ? 's' : ''}`;
    }
    
    // Update the sponsorship offer with normalized extracted data
    // Status set to 'draft' to require review before publishing
    console.log('Updating sponsorship offer in database...');
    const { error: updateError } = await supabase
      .from('sponsorship_offers')
      .update({
        fundraising_goal: normalizedFundingGoal,
        duration: normalizedTerm || 'Not specified',
        impact: normalizedImpact || 'Details pending review',
        supported_players: normalizedPlayersSupported,
        analysis_status: 'completed',
        title: offerTitle,
        team_profile_id: teamProfileId,
        status: 'draft',  // Changed from 'published' to require review
      })
      .eq('id', offerId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to update offer: ${updateError.message}`);
    }

    console.log('Offer saved as draft - ready for review before publishing');

    // Fetch all available placement options to match against
    console.log('Fetching placement options...');
    const { data: placementOptions, error: placementError } = await supabase
      .from('placement_options')
      .select('id, name, category');

    if (placementError) {
      console.error('Failed to fetch placement options:', placementError);
      throw new Error(`Failed to fetch placement options: ${placementError.message}`);
    }

    // Create sponsorship packages and their placements using normalized data
    console.log(`Creating ${normalizedPackages.length} sponsorship packages...`);
    for (let i = 0; i < normalizedPackages.length; i++) {
      const pkg = normalizedPackages[i];
      
      // Generate package description from placements
      const placementsList = pkg.placements.length > 0 
        ? pkg.placements.join(', ') 
        : 'various benefits';
      
      // Insert package with normalized data
      const { data: packageData, error: packageError } = await supabase
        .from('sponsorship_packages')
        .insert({
          sponsorship_offer_id: offerId,
          name: pkg.name,
          price: pkg.cost,  // Can be null if not specified
          description: `Package includes: ${placementsList}`,
          benefits: [],
          package_order: i + 1,
        })
        .select()
        .single();

      if (packageError) {
        console.error(`Failed to create package ${pkg.name}:`, packageError);
        continue; // Continue with other packages
      }

      console.log(`Created package: ${pkg.name} (cost: ${pkg.cost !== null ? '$' + pkg.cost : 'TBD'})`);

      // Match placements to placement_options and create links
      if (pkg.placements.length > 0) {
        let matchedCount = 0;
        let unmatchedPlacements: string[] = [];
        
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
              matchedCount++;
              console.log(`✓ Linked placement: "${placementName}" -> ${matchedOption.name}`);
            }
          } else {
            unmatchedPlacements.push(placementName);
            console.log(`✗ No match found for placement: "${placementName}"`);
          }
        }
        
        console.log(`Package "${pkg.name}": ${matchedCount}/${pkg.placements.length} placements matched`);
        if (unmatchedPlacements.length > 0) {
          console.log(`Unmatched placements for review:`, unmatchedPlacements);
        }
      }
    }

    console.log('Analysis completed successfully');
    
    // Return normalized data for logging/debugging
    return { 
      success: true, 
      data: {
        funding_goal: normalizedFundingGoal,
        sponsorship_term: normalizedTerm,
        sponsorship_impact: normalizedImpact,
        total_players_supported: normalizedPlayersSupported,
        packages: normalizedPackages
      }
    };

  } catch (error) {
    console.error('Error in performAnalysis:', error);

    // Enhanced error categorization and user-friendly messaging
    let errorMessage = 'PDF analysis failed';
    let errorCategory = 'unknown';
    let suggestedAction = 'Please try again or use manual entry';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorDetails = error.stack || '';
      const originalMessage = error.message;
      
      // Categorize errors and provide specific guidance
      
      // 1. PDF Download Issues
      if (originalMessage.includes('abort') || originalMessage.includes('Failed to download')) {
        errorCategory = 'download';
        errorMessage = 'Unable to download the PDF file';
        suggestedAction = 'Please ensure the file URL is accessible and try uploading again. If the file is very large (>10MB), try compressing it first.';
      } 
      
      // 2. Text Extraction Issues
      else if (originalMessage.includes('little to no text') || originalMessage.includes('text content') || originalMessage.includes('no pages')) {
        errorCategory = 'no_text';
        errorMessage = 'PDF appears to contain no readable text';
        suggestedAction = 'Your PDF may be a scanned image or contain only graphics. Try:\n1. Converting scanned PDFs to text using OCR software\n2. Ensuring your PDF has selectable text (not just images)\n3. Using manual entry instead';
      } 
      
      // 3. AI Service Issues
      else if (originalMessage.includes('Rate limit') || originalMessage.includes('429')) {
        errorCategory = 'rate_limit';
        errorMessage = 'AI analysis service is temporarily at capacity';
        suggestedAction = 'Please wait 30-60 seconds and try again. Peak usage times may require a brief wait.';
      } 
      else if (originalMessage.includes('OpenAI API') || originalMessage.includes('API failed')) {
        errorCategory = 'api_error';
        errorMessage = 'AI analysis service is temporarily unavailable';
        suggestedAction = 'The AI service encountered an issue. Please try again in a few minutes. If the problem persists, use manual entry.';
      }
      
      // 4. Structure/Content Issues
      else if (originalMessage.includes('No valid packages found') || originalMessage.includes('did not extract any')) {
        errorCategory = 'no_packages';
        errorMessage = 'Could not identify sponsorship packages in the PDF';
        suggestedAction = 'Your PDF may not contain clearly labeled package tiers with pricing. Please ensure your PDF includes:\n• Package names (Bronze, Silver, Gold, etc.)\n• Price for each package\n• List of benefits/placements\n\nOr use manual entry to create your packages.';
      }
      else if (originalMessage.includes('parse') || originalMessage.includes('JSON') || originalMessage.includes('understand')) {
        errorCategory = 'unclear_structure';
        errorMessage = 'Unable to interpret the PDF structure';
        suggestedAction = 'The PDF format is unclear or non-standard. Try:\n1. Using a PDF with clearly labeled sections\n2. Ensuring package information is in tables or lists\n3. Using manual entry for better control';
      }
      
      // 5. Timeout Issues
      else if (originalMessage.includes('timeout') || originalMessage.includes('TIMEOUT') || originalMessage.includes('took too long')) {
        errorCategory = 'timeout';
        errorMessage = 'PDF analysis exceeded the time limit';
        suggestedAction = 'The PDF may be too large or complex. Try:\n1. Using a PDF with fewer pages (under 20 pages is ideal)\n2. Removing unnecessary content/images\n3. Breaking into multiple smaller offers\n4. Using manual entry instead';
      }
      
      // 6. Database/System Issues
      else if (originalMessage.includes('Database') || originalMessage.includes('Failed to update') || originalMessage.includes('Failed to create')) {
        errorCategory = 'database';
        errorMessage = 'Failed to save the analysis results';
        suggestedAction = 'A system error occurred while saving. Please try again. If this persists, contact support.';
      }
      
      // 7. Generic/Unknown Issues
      else {
        errorCategory = 'unknown';
        errorMessage = originalMessage.length > 100 ? originalMessage.substring(0, 100) + '...' : originalMessage;
        suggestedAction = 'An unexpected error occurred. Please try:\n1. Reuploading the PDF\n2. Using a different PDF format\n3. Manual entry\n4. Contacting support if the issue persists';
      }
      
      console.error(`[Error Category: ${errorCategory}] ${errorMessage}`);
      console.error('Suggested action:', suggestedAction);
      console.error('Error details:', errorDetails);
    }

    // Update status to error with helpful message
    try {
      await supabase
        .from('sponsorship_offers')
        .update({ 
          analysis_status: 'error',
          impact: `Analysis incomplete: ${errorMessage}. ${suggestedAction}`
        })
        .eq('id', offerId)
        .eq('user_id', userId);
      
      console.log('Updated offer status to error with user-friendly message');
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }

    return { 
      success: false, 
      error: errorMessage,
      category: errorCategory,
      suggestion: suggestedAction
    };
  }
}

// Handle function shutdown
addEventListener('beforeunload', (ev) => {
  console.log('Function shutdown');
});
