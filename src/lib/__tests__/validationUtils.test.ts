import { describe, it, expect } from 'vitest';
import {
  validateTeamProfile,
  validatePDFFile,
  validateSponsorshipData,
  validateEmail,
  validateURL,
  validateSocialMediaURL,
} from '../validationUtils';
import type { TeamProfile, SponsorshipData } from '@/types/flow';

describe('validationUtils', () => {
  describe('validateTeamProfile', () => {
    it('should pass validation for complete profile', () => {
      const profile: Partial<TeamProfile> = {
        team_name: 'Test Team',
        sport: 'Soccer',
        location: 'New York',
        level_of_play: 'Professional',
        competition_scope: 'National',
        organization_status: 'Non-profit',
        main_values: ['Teamwork', 'Excellence'],
      };

      const result = validateTeamProfile(profile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing team_name', () => {
      const profile: Partial<TeamProfile> = {
        sport: 'Soccer',
        location: 'New York',
        level_of_play: 'Professional',
        competition_scope: 'National',
        organization_status: 'Non-profit',
        main_values: ['Teamwork'],
      };

      const result = validateTeamProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Team name is required');
    });

    it('should fail validation for empty main_values', () => {
      const profile: Partial<TeamProfile> = {
        team_name: 'Test Team',
        sport: 'Soccer',
        location: 'New York',
        level_of_play: 'Professional',
        competition_scope: 'National',
        organization_status: 'Non-profit',
        main_values: [],
      };

      const result = validateTeamProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one main value is required');
    });
  });

  describe('validatePDFFile', () => {
    it('should pass validation for valid PDF', () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      const result = validatePDFFile(file);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail validation for non-PDF file', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      const result = validatePDFFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Only PDF files are allowed');
    });

    it('should fail validation for file exceeding size limit', () => {
      const file = new File(['x'], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB

      const result = validatePDFFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File size must be less than 10MB');
    });

    it('should fail validation for empty file', () => {
      const file = new File([], 'empty.pdf', { type: 'application/pdf' });

      const result = validatePDFFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File is empty');
    });
  });

  describe('validateSponsorshipData', () => {
    it('should pass validation for complete sponsorship data', () => {
      const data: Partial<SponsorshipData> = {
        fundraisingGoal: '50000',
        duration: '12 months',
        packages: [
          {
            id: '1',
            name: 'Gold Package',
            price: 10000,
            benefits: ['Logo on jersey', 'Social media mentions'],
            placements: ['Jersey', 'Website'],
          },
        ],
      };

      const result = validateSponsorshipData(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for zero fundraising goal', () => {
      const data: Partial<SponsorshipData> = {
        fundraisingGoal: '0',
        duration: '12 months',
        packages: [
          {
            id: '1',
            name: 'Gold',
            price: 10000,
            benefits: ['Logo'],
            placements: ['Jersey'],
          },
        ],
      };

      const result = validateSponsorshipData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Fundraising goal must be greater than 0');
    });

    it('should fail validation for missing packages', () => {
      const data: Partial<SponsorshipData> = {
        fundraisingGoal: '50000',
        duration: '12 months',
        packages: [],
      };

      const result = validateSponsorshipData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one sponsorship package is required');
    });

    it('should fail validation for package with invalid data', () => {
      const data: Partial<SponsorshipData> = {
        fundraisingGoal: '50000',
        duration: '12 months',
        packages: [
          {
            id: '1',
            name: '',
            price: 0,
            benefits: [],
            placements: [],
          },
        ],
      };

      const result = validateSponsorshipData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
    });
  });

  describe('validateURL', () => {
    it('should validate correct URLs', () => {
      expect(validateURL('https://example.com')).toBe(true);
      expect(validateURL('http://example.com/path')).toBe(true);
      expect(validateURL('https://subdomain.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateURL('not a url')).toBe(false);
      expect(validateURL('example.com')).toBe(false);
      expect(validateURL('')).toBe(false);
    });
  });

  describe('validateSocialMediaURL', () => {
    it('should validate correct Instagram URL', () => {
      const result = validateSocialMediaURL('https://instagram.com/team', 'instagram');
      expect(result.isValid).toBe(true);
    });

    it('should validate correct Facebook URL', () => {
      const result = validateSocialMediaURL('https://facebook.com/team', 'facebook');
      expect(result.isValid).toBe(true);
    });

    it('should validate correct Twitter/X URL', () => {
      const result = validateSocialMediaURL('https://twitter.com/team', 'twitter');
      expect(result.isValid).toBe(true);
      const result2 = validateSocialMediaURL('https://x.com/team', 'twitter');
      expect(result2.isValid).toBe(true);
    });

    it('should reject mismatched platform URLs', () => {
      const result = validateSocialMediaURL('https://twitter.com/team', 'instagram');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not appear to be a valid instagram link');
    });

    it('should allow empty URLs for optional fields', () => {
      const result = validateSocialMediaURL('', 'instagram');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid URL format', () => {
      const result = validateSocialMediaURL('not a url', 'instagram');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid instagram URL format');
    });
  });
});
