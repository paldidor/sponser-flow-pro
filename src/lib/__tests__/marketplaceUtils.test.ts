import { describe, it, expect } from 'vitest';
import {
  mapSport,
  mapTier,
  parseLocation,
  parsePlayerCount,
  parseDuration,
  calculateEstWeekly,
  formatCurrency,
  getSportPlaceholder,
  transformToOpportunity,
  calculateProgress,
  formatDuration,
  formatLocation,
} from '../marketplaceUtils';

describe('marketplaceUtils', () => {
  describe('mapSport', () => {
    it('should map known sports correctly', () => {
      expect(mapSport('soccer')).toBe('Soccer');
      expect(mapSport('BASKETBALL')).toBe('Basketball');
      expect(mapSport('baseball')).toBe('Baseball');
      expect(mapSport('softball')).toBe('Baseball');
      expect(mapSport('volleyball')).toBe('Volleyball');
      expect(mapSport('football')).toBe('Football');
      expect(mapSport('hockey')).toBe('Hockey');
    });

    it('should return "Other" for unknown or null sports', () => {
      expect(mapSport('cricket')).toBe('Other');
      expect(mapSport(null)).toBe('Other');
      expect(mapSport('')).toBe('Other');
    });
  });

  describe('mapTier', () => {
    it('should map to Elite tier', () => {
      expect(mapTier('elite', null)).toBe('Elite');
      expect(mapTier(null, 'national')).toBe('Elite');
      expect(mapTier('Elite Level', 'National Championship')).toBe('Elite');
    });

    it('should map to Premier tier', () => {
      expect(mapTier('premier', null)).toBe('Premier');
      expect(mapTier(null, 'regional')).toBe('Premier');
    });

    it('should map to Competitive tier', () => {
      expect(mapTier('competitive', null)).toBe('Competitive');
    });

    it('should map to Travel tier', () => {
      expect(mapTier('travel', null)).toBe('Travel');
      expect(mapTier(null, 'state')).toBe('Travel');
    });

    it('should map to Recreational tier', () => {
      expect(mapTier('recreational', null)).toBe('Recreational');
      expect(mapTier(null, 'local')).toBe('Recreational');
    });

    it('should default to Local for unknown tiers', () => {
      expect(mapTier(null, null)).toBe('Local');
      expect(mapTier('unknown', 'unknown')).toBe('Local');
    });
  });

  describe('parseLocation', () => {
    it('should parse "City, State" format', () => {
      expect(parseLocation('Boston, MA')).toEqual({ city: 'Boston', state: 'MA' });
      expect(parseLocation('New York, NY')).toEqual({ city: 'New York', state: 'NY' });
    });

    it('should handle "City, State, Country" format', () => {
      expect(parseLocation('Toronto, ON, Canada')).toEqual({ city: 'Toronto', state: 'ON' });
    });

    it('should handle null or empty location', () => {
      expect(parseLocation(null)).toEqual({ city: 'Unknown', state: 'N/A' });
      expect(parseLocation('')).toEqual({ city: 'Unknown', state: 'N/A' });
    });

    it('should handle single value', () => {
      expect(parseLocation('Boston')).toEqual({ city: 'Boston', state: 'N/A' });
    });
  });

  describe('parsePlayerCount', () => {
    it('should parse range format', () => {
      expect(parsePlayerCount('20-30')).toBe(25);
      expect(parsePlayerCount('15-25')).toBe(20);
    });

    it('should parse single number', () => {
      expect(parsePlayerCount('20')).toBe(20);
      expect(parsePlayerCount('50 players')).toBe(50);
    });

    it('should return 0 for invalid input', () => {
      expect(parsePlayerCount(null)).toBe(0);
      expect(parsePlayerCount('abc')).toBe(0);
      expect(parsePlayerCount('')).toBe(0);
    });
  });

  describe('parseDuration', () => {
    it('should parse months format', () => {
      expect(parseDuration('6 months')).toBe(6);
      expect(parseDuration('12 months')).toBe(12);
      expect(parseDuration('3 month')).toBe(3);
    });

    it('should parse years format', () => {
      expect(parseDuration('1 year')).toBe(12);
      expect(parseDuration('2 years')).toBe(24);
      expect(parseDuration('1-year')).toBe(12);
    });

    it('should parse "Season"', () => {
      expect(parseDuration('Season')).toBe(6);
      expect(parseDuration('season')).toBe(6);
    });

    it('should handle invalid duration', () => {
      expect(parseDuration('')).toBe(3); // default
      expect(parseDuration('invalid')).toBe(3);
    });

    it('should extract numbers from text', () => {
      expect(parseDuration('6')).toBe(6);
      expect(parseDuration('Campaign for 9')).toBe(9);
    });
  });

  describe('calculateEstWeekly', () => {
    it('should calculate estimated weekly reach from total reach', () => {
      const result = calculateEstWeekly(2000);
      expect(result).toBe(500); // 2000 / 4
    });

    it('should handle zero values', () => {
      const result = calculateEstWeekly(0);
      expect(result).toBe(0);
    });

    it('should round to nearest integer', () => {
      const result = calculateEstWeekly(1000);
      expect(result).toBe(250);
    });
  });

  describe('formatCurrency', () => {
    it('should format numbers as USD currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(50000)).toBe('$50,000');
      expect(formatCurrency(500)).toBe('$500');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should not show decimals', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
    });
  });

  describe('getSportPlaceholder', () => {
    it('should return picsum.photos URL with correct seed', () => {
      const url = getSportPlaceholder('Soccer');
      expect(url).toContain('picsum.photos/seed/100');
      expect(url).toContain('640/256');
    });

    it('should have unique seeds for different sports', () => {
      const soccerUrl = getSportPlaceholder('Soccer');
      const basketballUrl = getSportPlaceholder('Basketball');
      expect(soccerUrl).not.toBe(basketballUrl);
    });
  });

  describe('transformToOpportunity', () => {
    it('should transform complete offer data', () => {
      const offer = {
        id: 'test-123',
        title: 'Test Sponsorship',
        fundraising_goal: 50000,
        duration: '12 months',
        team_profile_id: 'team-456',
        team_profile: {
          team_name: 'Test Team',
          location: 'Boston, MA',
          sport: 'soccer',
          number_of_players: '20-30',
          level_of_play: 'elite',
          competition_scope: 'national',
          instagram_followers: 5000,
          facebook_followers: 3000,
          twitter_followers: 2000,
          reach: 10025, // Total reach includes followers + players
        },
        packages: [
          { id: 'pkg-1', price: 5000 },
          { id: 'pkg-2', price: 10000 },
        ],
        sponsors: [{ id: 'sp-1' }, { id: 'sp-2' }],
      };

      const result = transformToOpportunity(offer);

      expect(result.id).toBe('test-123');
      expect(result.title).toBe('Test Sponsorship');
      expect(result.sport).toBe('Soccer');
      expect(result.city).toBe('Boston');
      expect(result.state).toBe('MA');
      expect(result.players).toBe(25);
      expect(result.tier).toBe('Elite');
      expect(result.packagesCount).toBe(2);
      expect(result.durationMonths).toBe(12);
      expect(result.goal).toBe(50000);
      expect(result.startingAt).toBe(5000);
      expect(result.raised).toBe(2000); // 2 sponsors * $1000
    });

    it('should handle missing team profile', () => {
      const offer = {
        id: 'test-123',
        title: 'Test Sponsorship',
        fundraising_goal: 50000,
        duration: '6 months',
        team_profile_id: null,
        team_profile: null,
        packages: [],
        sponsors: [],
      };

      const result = transformToOpportunity(offer);

      expect(result.organization).toBe('Unknown Organization');
      expect(result.city).toBe('Unknown');
      expect(result.state).toBe('N/A');
      expect(result.players).toBe(0);
      expect(result.sport).toBe('Other');
    });

    it('should calculate minimum package price', () => {
      const offer = {
        id: 'test-123',
        title: 'Test',
        fundraising_goal: 10000,
        duration: '3 months',
        team_profile_id: 'team-1',
        packages: [
          { id: 'pkg-1', price: 1000 },
          { id: 'pkg-2', price: 500 },
          { id: 'pkg-3', price: 2000 },
        ],
      };

      const result = transformToOpportunity(offer);
      expect(result.startingAt).toBe(500);
    });

    it('should handle empty packages array', () => {
      const offer = {
        id: 'test-123',
        title: 'Test',
        fundraising_goal: 10000,
        duration: '6 months',
        team_profile_id: 'team-1',
        packages: [],
      };

      const result = transformToOpportunity(offer);
      expect(result.startingAt).toBe(0);
      expect(result.packagesCount).toBe(0);
    });
  });

  describe('calculateProgress', () => {
    it('should calculate correct percentage', () => {
      expect(calculateProgress(5000, 10000)).toBe(50);
      expect(calculateProgress(7500, 10000)).toBe(75);
      expect(calculateProgress(2500, 10000)).toBe(25);
    });

    it('should cap at 100%', () => {
      expect(calculateProgress(15000, 10000)).toBe(100);
      expect(calculateProgress(20000, 10000)).toBe(100);
    });

    it('should return 0 for zero or negative goal', () => {
      expect(calculateProgress(5000, 0)).toBe(0);
      expect(calculateProgress(5000, -10000)).toBe(0);
    });

    it('should handle zero raised', () => {
      expect(calculateProgress(0, 10000)).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('should format months with "mo" suffix', () => {
      expect(formatDuration(6)).toBe('6mo');
      expect(formatDuration(12)).toBe('12mo');
      expect(formatDuration(1)).toBe('1mo');
    });
  });

  describe('formatLocation', () => {
    it('should format city and state', () => {
      expect(formatLocation('Boston', 'MA')).toBe('Boston, MA');
      expect(formatLocation('New York', 'NY')).toBe('New York, NY');
    });
  });
});
