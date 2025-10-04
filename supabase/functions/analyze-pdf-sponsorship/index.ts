import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { SYSTEM_PROMPT } from './prompts/system-prompt.ts';
import { extractTextFromPDF } from './utils/pdf-extractor.ts';
import { analyzeWithOpenAI, type AnalysisResult } from './utils/openai-analyzer.ts';
import { categorizeError } from './utils/error-handler.ts';

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
    // Step 1: Extract text from PDF
    const { text: extractedText } = await extractTextFromPDF(pdfUrl);

    // Step 2: Analyze with OpenAI
    const analysisResult: AnalysisResult = await analyzeWithOpenAI(
      extractedText,
      SYSTEM_PROMPT,
      openAIApiKey!
    );

    // Step 3: Generate title and save to database
    await saveAnalysisResults(analysisResult, offerId, userId, teamProfileId, supabase);

    console.log('Analysis completed successfully');
    
    return { 
      success: true, 
      data: analysisResult
    };

  } catch (error) {
    console.error('Error in performAnalysis:', error);

    // Categorize error and provide helpful message
    const categorized = categorizeError(error as Error);

    // Update status to error with helpful message
    try {
      await supabase
        .from('sponsorship_offers')
        .update({ 
          analysis_status: 'error',
          impact: `Analysis incomplete: ${categorized.message}. ${categorized.suggestedAction}`
        })
        .eq('id', offerId)
        .eq('user_id', userId);
      
      console.log('Updated offer status to error with user-friendly message');
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }

    return { 
      success: false, 
      error: categorized.message,
      category: categorized.category,
      suggestion: categorized.suggestedAction
    };
  }
}

/**
 * Saves analysis results to the database
 */
async function saveAnalysisResults(
  analysisResult: AnalysisResult,
  offerId: string,
  userId: string,
  teamProfileId: string | null,
  supabase: any
) {
  const { funding_goal, sponsorship_term, sponsorship_impact, total_players_supported, packages } = analysisResult;

  // Generate title based on normalized data
  let offerTitle = 'Sponsorship Offer';
  if (funding_goal && funding_goal > 0) {
    offerTitle = `Sponsorship Offer - $${funding_goal.toLocaleString()} Goal`;
  } else if (sponsorship_term) {
    offerTitle = `Sponsorship Offer - ${sponsorship_term}`;
  } else if (packages.length > 0) {
    offerTitle = `Sponsorship Offer - ${packages.length} Package${packages.length > 1 ? 's' : ''}`;
  }
  
  // Update the sponsorship offer with normalized extracted data
  // Status set to 'draft' to require review before publishing
  console.log('Updating sponsorship offer in database...');
  const { error: updateError } = await supabase
    .from('sponsorship_offers')
    .update({
      fundraising_goal: funding_goal,
      duration: sponsorship_term || 'Not specified',
      impact: sponsorship_impact || 'Details pending review',
      supported_players: total_players_supported,
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
  console.log(`Creating ${packages.length} sponsorship packages...`);
  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    
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
}

// Handle function shutdown
addEventListener('beforeunload', (ev) => {
  console.log('Function shutdown');
});
