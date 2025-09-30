import { supabase } from "@/integrations/supabase/client";
import { MultiStepOfferData, EnhancedSponsorshipPackage } from "@/types/flow";

export interface QuestionnaireServiceError {
  message: string;
  code?: string;
  isNetworkError?: boolean;
}

/**
 * Get or create a draft sponsorship offer for the current user
 */
export async function getOrCreateDraftOffer(userId: string): Promise<{ offerId: string; data: MultiStepOfferData | null; error?: QuestionnaireServiceError }> {
  try {
    // Check for existing draft
    const { data: existingDrafts, error: fetchError } = await supabase
      .from('sponsorship_offers')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'draft')
      .eq('source', 'questionnaire')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      throw fetchError;
    }

    // If draft exists, return it
    if (existingDrafts && existingDrafts.length > 0) {
      const draft = existingDrafts[0];
      
      // Transform database format back to form data
      const formData: MultiStepOfferData = {
        currentStep: 1,
        fundraisingGoal: draft.fundraising_goal?.toString(),
        impactTags: draft.impact ? draft.impact.split(', ') : undefined,
        supportedPlayers: draft.supported_players || undefined,
        duration: draft.duration || undefined,
        packages: undefined, // Will be loaded separately if needed
      };

      return { offerId: draft.id, data: formData };
    }

    // Create new draft
    const { data: newDraft, error: createError } = await supabase
      .from('sponsorship_offers')
      .insert({
        user_id: userId,
        title: 'Draft Sponsorship Offer',
        fundraising_goal: 0,
        impact: 'In progress...',
        duration: 'TBD',
        status: 'draft',
        source: 'questionnaire',
        supported_players: 0,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return { offerId: newDraft.id, data: null };
  } catch (error: any) {
    console.error('Error in getOrCreateDraftOffer:', error);
    return {
      offerId: '',
      data: null,
      error: {
        message: error.message || 'Failed to initialize draft',
        code: error.code,
        isNetworkError: error.message?.includes('network') || error.message?.includes('fetch'),
      },
    };
  }
}

/**
 * Update draft offer with current step data
 */
export async function updateDraftStep(
  offerId: string,
  stepData: Partial<MultiStepOfferData>
): Promise<{ success: boolean; error?: QuestionnaireServiceError }> {
  try {
    const updateData: any = {};

    if (stepData.fundraisingGoal !== undefined) {
      updateData.fundraising_goal = parseFloat(stepData.fundraisingGoal) || 0;
    }

    if (stepData.impactTags !== undefined) {
      updateData.impact = stepData.impactTags.join(', ');
    }

    if (stepData.supportedPlayers !== undefined) {
      updateData.supported_players = stepData.supportedPlayers;
    }

    if (stepData.duration !== undefined) {
      updateData.duration = stepData.duration;
    }

    // Always update title based on available data
    updateData.title = `Sponsorship Offer - Draft`;

    const { error } = await supabase
      .from('sponsorship_offers')
      .update(updateData)
      .eq('id', offerId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in updateDraftStep:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Failed to save progress',
        code: error.code,
        isNetworkError: error.message?.includes('network') || error.message?.includes('fetch'),
      },
    };
  }
}

/**
 * Get user's team profile
 */
export async function getUserTeamProfile(userId: string): Promise<{ 
  teamProfileId: string | null; 
  error?: QuestionnaireServiceError 
}> {
  try {
    const { data, error } = await supabase
      .from('team_profiles')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return { teamProfileId: data?.id || null };
  } catch (error: any) {
    console.error('Error fetching team profile:', error);
    return {
      teamProfileId: null,
      error: {
        message: error.message || 'Failed to fetch team profile',
        code: error.code,
        isNetworkError: error.message?.includes('network') || error.message?.includes('fetch'),
      },
    };
  }
}

/**
 * Finalize and publish the sponsorship offer
 */
export async function finalizeOffer(
  offerId: string,
  teamProfileId: string | null,
  packages: EnhancedSponsorshipPackage[]
): Promise<{ success: boolean; error?: QuestionnaireServiceError }> {
  try {
    // First, update the offer status
    const { error: updateError } = await supabase
      .from('sponsorship_offers')
      .update({
        status: 'published',
        team_profile_id: teamProfileId,
      })
      .eq('id', offerId);

    if (updateError) {
      throw updateError;
    }

    // Then, create packages and their placements
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      
      // Create package
      const { data: packageData, error: packageError } = await supabase
        .from('sponsorship_packages')
        .insert({
          sponsorship_offer_id: offerId,
          name: pkg.name,
          price: pkg.price,
          package_order: i + 1,
          benefits: [], // Empty array as we don't collect benefits in questionnaire
        })
        .select()
        .single();

      if (packageError) {
        throw packageError;
      }

      // Create placements for this package
      if (pkg.placementIds && pkg.placementIds.length > 0) {
        const placements = pkg.placementIds.map(placementId => ({
          package_id: packageData.id,
          placement_option_id: placementId,
        }));

        const { error: placementError } = await supabase
          .from('package_placements')
          .insert(placements);

        if (placementError) {
          throw placementError;
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in finalizeOffer:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Failed to finalize offer',
        code: error.code,
        isNetworkError: error.message?.includes('network') || error.message?.includes('fetch'),
      },
    };
  }
}

/**
 * Delete a draft offer (cleanup)
 */
export async function deleteDraftOffer(offerId: string): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('sponsorship_offers')
      .delete()
      .eq('id', offerId)
      .eq('status', 'draft');

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting draft:', error);
    return { success: false };
  }
}
