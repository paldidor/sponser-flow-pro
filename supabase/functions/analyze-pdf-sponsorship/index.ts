import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { SYSTEM_PROMPT } from './prompts/system-prompt.ts';
import { extractTextFromPDF } from './utils/pdf-extractor.ts';
import { analyzeWithOpenAI, type AnalysisResult } from './utils/openai-analyzer.ts';
import { categorizeError } from './utils/error-handler.ts';
import { batchMatchPlacements } from './utils/placement-matcher.ts';

// Declare EdgeRuntime for background task support
declare const EdgeRuntime: {
  waitUntil(promise: Promise<any>): void;
};

// DB Alias Mapping: Maps standardized names to database placement_options names
const DB_ALIASES: Record<string, string[]> = {
  "Scoreboard Panel": ["Scoreboard Sponsor"],
  "Fence Banner (Standard)": ["Fence/Wall Signage", "Banner at Games"],
  "Fence Banner (Premium)": ["Fence/Wall Signage", "Premium Banner"],
  "Event Booth Space": ["Tent Set-up", "Vendor Table"],
  "Social Media Announcement": ["Social Media Mentions", "Social Media Sponsor"],
  "Website Logo & Link": ["Website Logo", "Website Sponsor"],
  "Newsletter Feature": ["Email Newsletter Sponsor", "Newsletter Sponsor"],
  "Entrance/Welcome Sign": ["Entrance Banner"],
  "Dugout/Seating Branding": ["Dugout/Sideline Signage"],
  "Field Naming Rights": ["Field/Court Naming Rights"],
  "App Placement": ["Mobile App Sponsor"],
  "Plaque/Certificate": ["Recognition Plaque", "Certificate"],
  "Team Sponsorship": ["Team Sponsor Recognition"]
};

// Calculate token-overlap similarity for fuzzy matching
function calculateSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const tokens1 = new Set(normalize(str1).split(/\s+/));
  const tokens2 = new Set(normalize(str2).split(/\s+/));
  
  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

// Map standardized category to DB category
function getCategoryFilter(standardCategory: string): string[] {
  const map: Record<string, string[]> = {
    "Digital & Web": ["digital", "web"],
    "On-Site Signage": ["facility", "signage"],
    "Social Media": ["digital", "social"],
    "Email & CRM": ["digital", "email"],
    "Events & Activations": ["events", "activation"],
    "Uniforms & Apparel": ["uniform", "apparel"],
    "Community & Recognition": ["events", "custom", "recognition"]
  };
  
  return map[standardCategory] || ["custom"];
}

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
    // Use EdgeRuntime.waitUntil to keep function alive until analysis completes
    EdgeRuntime.waitUntil(
      performAnalysis(pdfUrl, offerId, userId, finalTeamProfileId, supabase)
        .catch((err) => {
          console.error('Background analysis error:', err);
        })
    );

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

    // Update status to error with helpful message - with retry logic
    let updateSuccess = false;
    const maxUpdateRetries = 3;
    
    for (let retry = 0; retry < maxUpdateRetries && !updateSuccess; retry++) {
      try {
        const { error: updateError } = await supabase
          .from('sponsorship_offers')
          .update({ 
            analysis_status: 'error',
            impact: `Analysis incomplete: ${categorized.message}. ${categorized.suggestedAction}`
          })
          .eq('id', offerId)
          .eq('user_id', userId);
        
        if (!updateError) {
          updateSuccess = true;
          console.log('Updated offer status to error with user-friendly message');
        } else {
          throw updateError;
        }
      } catch (updateError) {
        console.error(`Failed to update error status (attempt ${retry + 1}/${maxUpdateRetries}):`, updateError);
        if (retry < maxUpdateRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1)));
        }
      }
    }
    
    if (!updateSuccess) {
      console.error('CRITICAL: Failed to update error status after all retries. Offer may be stuck in analyzing state.');
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

  // Calculate intelligent default for funding_goal if not provided by AI
  let finalFundingGoal = funding_goal;
  
  if (!finalFundingGoal || finalFundingGoal === 0) {
    // Calculate total package value
    const totalPackageValue = packages.reduce((sum, pkg) => {
      return sum + (pkg.cost || 0);
    }, 0);
    
    if (totalPackageValue > 0) {
      // Use 2x total package value as suggested fundraising goal
      finalFundingGoal = totalPackageValue * 2;
      console.log(`📊 Calculated fundraising_goal: $${finalFundingGoal} (2x package total of $${totalPackageValue})`);
    } else {
      // Default to 0 if no packages have costs
      finalFundingGoal = 0;
      console.log('⚠️ No funding_goal found and no package costs available, defaulting to 0');
    }
  }

  // Generate title based on normalized data
  let offerTitle = 'Sponsorship Offer';
  if (finalFundingGoal && finalFundingGoal > 0) {
    offerTitle = `Sponsorship Offer - $${finalFundingGoal.toLocaleString()} Goal`;
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
      fundraising_goal: finalFundingGoal,
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

    // Match placements using enhanced placement matcher with DB linking
    if (pkg.placements.length > 0) {
      console.log(`\n🔍 Matching ${pkg.placements.length} placements for package "${pkg.name}"...`);
      
      // Use batch matcher for statistics
      const { matches, stats } = batchMatchPlacements(pkg.placements);
      
      let linkedCount = 0;
      const unmatchedPlacements: string[] = [];
      const lowConfidenceMatches: Array<{ raw: string; standardName: string }> = [];
      const displayBenefits: string[] = [];
      
      for (const { raw, match } of matches) {
        if (!match) {
          unmatchedPlacements.push(raw);
          displayBenefits.push(raw); // Fallback to raw placement
          console.log(`✗ No match found for: "${raw}"`);
          continue;
        }

        let matchedOption: any = null;
        let matchMethod = 'unknown';

        // Step 1: Try DB alias mapping first
        const aliases = DB_ALIASES[match.standardName] || [];
        for (const alias of aliases) {
          matchedOption = placementOptions?.find((opt: any) => 
            opt.name.toLowerCase() === alias.toLowerCase()
          );
          if (matchedOption) {
            matchMethod = `alias: "${alias}"`;
            break;
          }
        }

        // Step 2: Try exact/substring matching on standard name
        if (!matchedOption) {
          matchedOption = placementOptions?.find((opt: any) => 
            opt.name.toLowerCase() === match.standardName.toLowerCase() ||
            opt.name.toLowerCase().includes(match.standardName.toLowerCase()) ||
            match.standardName.toLowerCase().includes(opt.name.toLowerCase())
          );
          if (matchedOption) {
            matchMethod = 'exact/substring';
          }
        }

        // Step 3: Category-aware fuzzy matching as last resort
        if (!matchedOption) {
          const categoryFilters = getCategoryFilter(match.category);
          const filteredOptions = placementOptions?.filter((opt: any) => 
            categoryFilters.some(cat => opt.category.toLowerCase().includes(cat))
          ) || [];

          let bestScore = 0;
          let bestOption: any = null;

          for (const opt of filteredOptions) {
            const score = calculateSimilarity(match.standardName, opt.name);
            if (score > bestScore && score >= 0.4) {
              bestScore = score;
              bestOption = opt;
            }
          }

          if (bestOption) {
            matchedOption = bestOption;
            matchMethod = `fuzzy (score: ${bestScore.toFixed(2)})`;
          }
        }

        // Step 4: Link to DB or fallback
        if (matchedOption) {
          const { error: linkError } = await supabase
            .from('package_placements')
            .insert({
              package_id: packageData.id,
              placement_option_id: matchedOption.id,
            });

          if (linkError) {
            console.error(`Failed to link placement "${raw}":`, linkError);
            displayBenefits.push(match.standardName); // Fallback
          } else {
            linkedCount++;
            displayBenefits.push(matchedOption.name);
            const confidenceIcon = match.confidence === 'high' ? '✓✓' : match.confidence === 'medium' ? '✓' : '~';
            console.log(`${confidenceIcon} Linked "${raw}" -> ${matchedOption.name} [${match.category}] via ${matchMethod} (${match.confidence} confidence)`);
          }
        } else {
          // No DB match found, use standardized name for display
          displayBenefits.push(match.standardName);
          if (match.confidence === 'low') {
            lowConfidenceMatches.push({ raw, standardName: match.standardName });
          }
          console.log(`⚠ Matched "${raw}" to "${match.standardName}" but not found in placement_options table`);
        }
      }

      // Update package with displayBenefits for UI fallback
      if (displayBenefits.length > 0) {
        const { error: benefitsError } = await supabase
          .from('sponsorship_packages')
          .update({ benefits: displayBenefits })
          .eq('id', packageData.id);

        if (benefitsError) {
          console.error(`Failed to update benefits for package ${pkg.name}:`, benefitsError);
        } else {
          console.log(`✓ Updated displayBenefits: [${displayBenefits.join(', ')}]`);
        }
      }
      
      // Enhanced logging with statistics
      console.log(`\n📊 Package "${pkg.name}" Matching Results:`);
      console.log(`   Total placements: ${stats.total}`);
      console.log(`   Linked to DB: ${linkedCount}/${stats.total} (${Math.round(linkedCount/stats.total*100)}%)`);
      console.log(`   Match quality: ${stats.highConfidence} high, ${stats.mediumConfidence} medium, ${stats.lowConfidence} low confidence`);
      console.log(`   Unmatched: ${stats.unmatched}`);
      
      if (unmatchedPlacements.length > 0) {
        console.log(`\n❌ Unmatched placements (${unmatchedPlacements.length}):`);
        unmatchedPlacements.forEach(p => console.log(`   - "${p}"`));
      }
      
      if (lowConfidenceMatches.length > 0) {
        console.log(`\n⚠️ Low confidence matches (${lowConfidenceMatches.length}) - may need review:`);
        lowConfidenceMatches.forEach(({ raw, standardName }) => 
          console.log(`   - "${raw}" -> "${standardName}"`)
        );
      }
    }
  }
}

// Handle function shutdown
addEventListener('beforeunload', (ev) => {
  console.log('Function shutdown');
});
