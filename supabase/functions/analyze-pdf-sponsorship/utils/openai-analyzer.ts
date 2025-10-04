/**
 * OpenAI API integration for PDF analysis
 * Handles calling the OpenAI API and normalizing the response
 */

export interface AnalyzedPackage {
  name: string;
  cost: number | null;
  placements: string[];
}

export interface AnalysisResult {
  funding_goal: number | null;
  sponsorship_term: string;
  sponsorship_impact: string;
  total_players_supported: number | null;
  packages: AnalyzedPackage[];
}

/**
 * Analyzes extracted PDF text using OpenAI API
 * @param extractedText - Text content extracted from PDF
 * @param systemPrompt - System prompt defining extraction rules
 * @param apiKey - OpenAI API key
 * @returns Normalized analysis results
 * @throws Error if API call fails or response is invalid
 */
export async function analyzeWithOpenAI(
  extractedText: string,
  systemPrompt: string,
  apiKey: string
): Promise<AnalysisResult> {
  const userPrompt = `PDF Content to analyze:\n\n${extractedText}`;

  // Call OpenAI API with retry logic
  console.log('Calling OpenAI API for analysis...');
  let openAIResponse: Response | undefined;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      // Add 60-second timeout to prevent indefinite hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      try {
        openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
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
            max_completion_tokens: 4000, // Increased from 2000 to prevent JSON truncation
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('OpenAI API timeout after 60 seconds. The analysis took too long to complete.');
        }
        throw fetchError;
      }

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
  
  // Validation logging for debugging
  const finishReason = aiResult.choices[0].finish_reason;
  const analysisText = aiResult.choices[0].message.content;
  
  if (finishReason === "length") {
    console.warn('⚠️ AI response may be truncated due to token limit. Consider increasing max_completion_tokens.');
  }
  
  console.log(`Response length: ${analysisText.length} characters, finish_reason: ${finishReason}`);
  
  // Parse the JSON response
  let parsedData;
  try {
    // Remove markdown code blocks if present
    const jsonText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsedData = JSON.parse(jsonText);
    console.log('Successfully parsed AI response:', parsedData);
    
    // Log package extraction success
    const packageCount = parsedData.packages?.length || 0;
    console.log(`✓ Extracted ${packageCount} sponsorship packages from PDF`);
    
    if (packageCount === 0) {
      console.warn('⚠️ No packages were extracted - this may indicate parsing issues');
    }
  } catch (parseError) {
    console.error('Failed to parse AI response:', analysisText);
    const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown error';
    throw new Error(`Failed to parse AI response: ${errorMessage}`);
  }

  // Normalize the parsed data
  return normalizeAnalysisData(parsedData);
}

/**
 * Normalizes raw AI response data into a consistent format
 * Handles type conversions, null values, and data cleaning
 */
function normalizeAnalysisData(parsedData: any): AnalysisResult {
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
  let normalizedPackages: AnalyzedPackage[] = [];
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

  return {
    funding_goal: normalizedFundingGoal,
    sponsorship_term: normalizedTerm,
    sponsorship_impact: normalizedImpact,
    total_players_supported: normalizedPlayersSupported,
    packages: normalizedPackages
  };
}
