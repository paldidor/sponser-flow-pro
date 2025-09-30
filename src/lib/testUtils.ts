/**
 * Testing Utilities for Integration Tests
 * 
 * Provides helper functions for testing database operations,
 * authentication flows, and data validation
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Test Authentication Helpers
 */
export const testAuth = {
  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  },

  /**
   * Get current user ID
   */
  async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  },

  /**
   * Get current user email
   */
  async getCurrentUserEmail(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email || null;
  },
};

/**
 * Test Database Helpers
 */
export const testDb = {
  /**
   * Check if draft offer exists for current user
   */
  async hasDraftOffer(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('sponsorship_offers')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .single();

    return !!data && !error;
  },

  /**
   * Get draft offer for current user
   */
  async getDraftOffer() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('sponsorship_offers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching draft offer:', error);
      return null;
    }

    return data;
  },

  /**
   * Get published offers for current user
   */
  async getPublishedOffers() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('sponsorship_offers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching published offers:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get packages for an offer
   */
  async getPackages(offerId: string) {
    const { data, error } = await supabase
      .from('sponsorship_packages')
      .select('*')
      .eq('sponsorship_offer_id', offerId)
      .order('package_order', { ascending: true });

    if (error) {
      console.error('Error fetching packages:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get placements for a package
   */
  async getPlacements(packageId: string) {
    const { data, error } = await supabase
      .from('package_placements')
      .select(`
        id,
        placement_option_id,
        placement_options (
          id,
          name,
          category,
          description,
          is_popular
        )
      `)
      .eq('package_id', packageId);

    if (error) {
      console.error('Error fetching placements:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get all available placement options
   */
  async getAllPlacementOptions() {
    const { data, error } = await supabase
      .from('placement_options')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching placement options:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get team profile for current user
   */
  async getTeamProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('team_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching team profile:', error);
      return null;
    }

    return data;
  },

  /**
   * Clean up test data (use with caution!)
   */
  async cleanupTestData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    // Delete draft offers and related data
    const { error } = await supabase
      .from('sponsorship_offers')
      .delete()
      .eq('user_id', user.id)
      .eq('status', 'draft');

    if (error) {
      console.error('Error cleaning up test data:', error);
    } else {
      console.log('Test data cleaned up successfully');
    }
  },
};

/**
 * Test Data Validators
 */
export const testValidators = {
  /**
   * Validate fundraising goal
   */
  validateFundraisingGoal(goal: string): { valid: boolean; error?: string } {
    const numericGoal = parseFloat(goal);
    
    if (goal === "" || isNaN(numericGoal)) {
      return { valid: false, error: "Please enter a valid amount" };
    }
    
    if (numericGoal < 500) {
      return { valid: false, error: "Minimum fundraising goal is $500" };
    }
    
    return { valid: true };
  },

  /**
   * Validate impact tags
   */
  validateImpactTags(tags: string[]): { valid: boolean; error?: string } {
    if (tags.length === 0) {
      return { valid: false, error: "Please select at least one impact area" };
    }
    
    return { valid: true };
  },

  /**
   * Validate supported players
   */
  validateSupportedPlayers(players: string): { valid: boolean; error?: string } {
    const numericPlayers = parseInt(players);
    
    if (players === "" || isNaN(numericPlayers)) {
      return { valid: false, error: "Please enter a valid number" };
    }
    
    if (numericPlayers < 1) {
      return { valid: false, error: "Must have at least 1 player" };
    }
    
    return { valid: true };
  },

  /**
   * Validate duration
   */
  validateDuration(duration: string): { valid: boolean; error?: string } {
    const validDurations = ["Season", "1-year", "Multi Year"];
    
    if (!validDurations.includes(duration)) {
      return { valid: false, error: "Please select a valid duration" };
    }
    
    return { valid: true };
  },

  /**
   * Validate package
   */
  validatePackage(pkg: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!pkg.name || pkg.name.trim() === "") {
      errors.push("Package name is required");
    }
    
    if (!pkg.price || parseFloat(pkg.price) <= 0) {
      errors.push("Package price must be greater than 0");
    }
    
    if (!pkg.placement_ids || pkg.placement_ids.length === 0) {
      errors.push("At least one placement is required");
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate complete offer data
   */
  validateOfferData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const goalValidation = this.validateFundraisingGoal(data.fundraisingGoal || "");
    if (!goalValidation.valid) {
      errors.push(goalValidation.error!);
    }
    
    const impactValidation = this.validateImpactTags(data.impactTags || []);
    if (!impactValidation.valid) {
      errors.push(impactValidation.error!);
    }
    
    const playersValidation = this.validateSupportedPlayers(data.supportedPlayers || "");
    if (!playersValidation.valid) {
      errors.push(playersValidation.error!);
    }
    
    const durationValidation = this.validateDuration(data.duration || "");
    if (!durationValidation.valid) {
      errors.push(durationValidation.error!);
    }
    
    if (!data.packages || data.packages.length === 0) {
      errors.push("At least one package is required");
    } else {
      data.packages.forEach((pkg: any, index: number) => {
        const pkgValidation = this.validatePackage(pkg);
        if (!pkgValidation.valid) {
          errors.push(`Package ${index + 1}: ${pkgValidation.errors.join(", ")}`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

/**
 * Test Performance Helpers
 */
export const testPerformance = {
  /**
   * Measure operation time
   */
  async measure<T>(
    operation: () => Promise<T>,
    label: string
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    
    console.log(`⏱️  ${label}: ${duration.toFixed(2)}ms`);
    
    return { result, duration };
  },

  /**
   * Test auto-save performance
   */
  async testAutoSave(offerId: string, data: any): Promise<number> {
    const { duration } = await this.measure(
      async () => {
        const { error } = await supabase
          .from('sponsorship_offers')
          .update({ draft_data: data, updated_at: new Date().toISOString() })
          .eq('id', offerId);
        
        if (error) throw error;
      },
      'Auto-save'
    );
    
    return duration;
  },

  /**
   * Test placement options fetch
   */
  async testPlacementFetch(): Promise<number> {
    const { duration } = await this.measure(
      async () => {
        const { data, error } = await supabase
          .from('placement_options')
          .select('*');
        
        if (error) throw error;
        return data;
      },
      'Placement options fetch'
    );
    
    return duration;
  },
};

/**
 * Test Console Logging Helpers
 */
export const testLog = {
  /**
   * Log test section
   */
  section(title: string) {
    console.log('\n' + '='.repeat(50));
    console.log(`🧪 ${title}`);
    console.log('='.repeat(50));
  },

  /**
   * Log success
   */
  success(message: string) {
    console.log(`✅ ${message}`);
  },

  /**
   * Log error
   */
  error(message: string, error?: any) {
    console.error(`❌ ${message}`);
    if (error) {
      console.error(error);
    }
  },

  /**
   * Log warning
   */
  warning(message: string) {
    console.warn(`⚠️  ${message}`);
  },

  /**
   * Log info
   */
  info(message: string) {
    console.log(`ℹ️  ${message}`);
  },

  /**
   * Log data
   */
  data(label: string, data: any) {
    console.log(`📊 ${label}:`, data);
  },
};

/**
 * Integration Test Runner
 * 
 * Usage in browser console:
 * 
 * import { runIntegrationTests } from '@/lib/testUtils';
 * await runIntegrationTests();
 */
export async function runIntegrationTests() {
  testLog.section('Integration Test Suite');

  // Test 1: Authentication
  testLog.section('Test 1: Authentication');
  const isAuth = await testAuth.isAuthenticated();
  if (isAuth) {
    testLog.success('User is authenticated');
    const userId = await testAuth.getCurrentUserId();
    const email = await testAuth.getCurrentUserEmail();
    testLog.data('User ID', userId);
    testLog.data('Email', email);
  } else {
    testLog.error('User is not authenticated - tests require authentication');
    return;
  }

  // Test 2: Draft Offer
  testLog.section('Test 2: Draft Offer');
  const hasDraft = await testDb.hasDraftOffer();
  if (hasDraft) {
    testLog.success('Draft offer exists');
    const draft = await testDb.getDraftOffer();
    testLog.data('Draft data', draft);
  } else {
    testLog.warning('No draft offer found - create one through the questionnaire');
  }

  // Test 3: Published Offers
  testLog.section('Test 3: Published Offers');
  const published = await testDb.getPublishedOffers();
  testLog.info(`Found ${published.length} published offer(s)`);
  if (published.length > 0) {
    testLog.data('Published offers', published);
  }

  // Test 4: Placement Options
  testLog.section('Test 4: Placement Options');
  const placements = await testDb.getAllPlacementOptions();
  testLog.success(`Loaded ${placements.length} placement options`);
  const categories = [...new Set(placements.map(p => p.category))];
  testLog.data('Categories', categories);

  // Test 5: Team Profile
  testLog.section('Test 5: Team Profile');
  const teamProfile = await testDb.getTeamProfile();
  if (teamProfile) {
    testLog.success('Team profile exists');
    testLog.data('Team profile', teamProfile);
  } else {
    testLog.warning('No team profile found');
  }

  // Test 6: Performance Tests
  testLog.section('Test 6: Performance Tests');
  const placementFetchTime = await testPerformance.testPlacementFetch();
  if (placementFetchTime < 500) {
    testLog.success(`Placement fetch time: ${placementFetchTime.toFixed(2)}ms`);
  } else {
    testLog.warning(`Placement fetch time slow: ${placementFetchTime.toFixed(2)}ms`);
  }

  testLog.section('Integration Tests Complete');
  testLog.success('All tests completed! Check results above.');
}
