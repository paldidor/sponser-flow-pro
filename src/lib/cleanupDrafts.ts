import { supabase } from "@/integrations/supabase/client";

/**
 * Cleanup abandoned draft offers
 * - Marks drafts as 'deleted' if they have 0 packages and are > 1 hour old
 * - Returns count of deleted drafts
 */
export async function cleanupAbandonedDrafts(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('⚠️ Cleanup skipped - no user authenticated');
      return 0;
    }

    // Find abandoned drafts (> 1 hour old, source: questionnaire)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: abandonedOffers, error: offersError } = await supabase
      .from('sponsorship_offers')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .eq('source', 'questionnaire')
      .lt('created_at', oneHourAgo);

    if (offersError) {
      console.error('❌ Error fetching abandoned offers:', offersError);
      return 0;
    }

    if (!abandonedOffers || abandonedOffers.length === 0) {
      console.log('✅ No abandoned drafts found');
      return 0;
    }

    console.log(`🔍 Found ${abandonedOffers.length} old draft(s), checking for packages...`);

    // Check which ones have 0 packages
    const offerIds = abandonedOffers.map(o => o.id);
    const { data: packages, error: packagesError } = await supabase
      .from('sponsorship_packages')
      .select('sponsorship_offer_id')
      .in('sponsorship_offer_id', offerIds);

    if (packagesError) {
      console.error('❌ Error checking packages:', packagesError);
      return 0;
    }

    const offerIdsWithPackages = new Set(
      (packages || []).map(p => p.sponsorship_offer_id)
    );

    // Delete offers with no packages
    const offersToDelete = abandonedOffers
      .filter(o => !offerIdsWithPackages.has(o.id))
      .map(o => o.id);

    if (offersToDelete.length === 0) {
      console.log('✅ All old drafts have packages, no cleanup needed');
      return 0;
    }

    console.log(`🧹 Cleaning up ${offersToDelete.length} empty draft(s)...`);

    const { error: deleteError } = await supabase
      .from('sponsorship_offers')
      .update({ status: 'deleted' })
      .in('id', offersToDelete);

    if (deleteError) {
      console.error('❌ Error cleaning up drafts:', deleteError);
      return 0;
    }

    console.log(`✅ Successfully cleaned up ${offersToDelete.length} abandoned draft(s)`);
    return offersToDelete.length;
  } catch (error) {
    console.error('❌ Unexpected error in cleanupAbandonedDrafts:', error);
    return 0;
  }
}
