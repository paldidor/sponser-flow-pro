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

    extractedText = cleanedText;

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
    if (!parsedData.funding_goal) missingFields.push('funding_goal');
    if (!parsedData.sponsorship_term) missingFields.push('sponsorship_term');
    if (!parsedData.sponsorship_impact) missingFields.push('sponsorship_impact');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields.join(', '));
      console.error('Partial data received:', parsedData);
      
      // Still save partial data if we have at least the basic info
      if (parsedData.funding_goal || parsedData.sponsorship_term) {
        console.log('Saving partial data...');
        await supabase
          .from('sponsorship_offers')
          .update({
            fundraising_goal: parsedData.funding_goal || 0,
            duration: parsedData.sponsorship_term || 'Not specified',
            impact: parsedData.sponsorship_impact || 'Analysis incomplete - please review manually',
            supported_players: parsedData.total_players_supported || null,
            analysis_status: 'completed',
            title: `Sponsorship Offer - Partial Data`,
          })
          .eq('id', offerId)
          .eq('user_id', userId);
      }
      
      throw new Error(`AI analysis incomplete. Missing: ${missingFields.join(', ')}. Please try again or enter information manually.`);
    }

    // Validate data types
    if (typeof parsedData.funding_goal !== 'number' || parsedData.funding_goal <= 0) {
      console.warn('Invalid funding_goal, attempting conversion');
      parsedData.funding_goal = parseFloat(String(parsedData.funding_goal).replace(/[^0-9.]/g, '')) || 0;
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

    // Determine error type for better user messages
    let errorMessage = 'An error occurred during PDF analysis';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || '';
      
      // Provide specific guidance based on error type
      if (errorMessage.includes('text content')) {
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

    // Try to update status to error if we have the offerId
    try {
      const requestData = await req.clone().json();
      const { offerId, userId } = requestData;
      
      if (offerId && userId && supabaseUrl && supabaseServiceRoleKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        await supabase
          .from('sponsorship_offers')
          .update({ 
            analysis_status: 'error',
            impact: `Analysis failed: ${errorMessage}`
          })
          .eq('id', offerId)
          .eq('user_id', userId);
      }
    } catch (statusUpdateError) {
      console.error('Failed to update error status:', statusUpdateError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: Deno.env.get('ENV') === 'development' ? errorDetails : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
