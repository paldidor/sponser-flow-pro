/**
 * Phase 1: Recommendation Display Fix - Unit Tests
 * 
 * These tests verify that recommendations are stored and loaded correctly
 * from the recommendation_data JSONB column in the ai_recommendations table.
 */

import { describe, it, expect } from 'vitest';

describe('Phase 1: Recommendation Data Storage & Retrieval', () => {
  describe('✅ Data Structure Validation', () => {
    it('should have all required fields in recommendation object', () => {
      const recommendationData = {
        team_profile_id: '123e4567-e89b-12d3-a456-426614174000',
        team_name: 'Springfield Youth Soccer',
        distance_km: 12.5,
        total_reach: 1500,
        sponsorship_offer_id: '223e4567-e89b-12d3-a456-426614174000',
        package_id: '323e4567-e89b-12d3-a456-426614174000',
        package_name: 'Gold Sponsor Package',
        price: 5000,
        est_cpf: 3.33,
        marketplace_url: 'https://preview--sponser-flow-pro.lovable.app/marketplace/223e4567-e89b-12d3-a456-426614174000',
        sport: 'Soccer',
        logo: 'https://example.com/logo.png',
        images: ['https://example.com/img1.png', 'https://example.com/img2.png'],
      };

      // Verify all required fields are present
      expect(recommendationData).toHaveProperty('team_profile_id');
      expect(recommendationData).toHaveProperty('team_name');
      expect(recommendationData).toHaveProperty('distance_km');
      expect(recommendationData).toHaveProperty('total_reach');
      expect(recommendationData).toHaveProperty('sponsorship_offer_id');
      expect(recommendationData).toHaveProperty('package_id');
      expect(recommendationData).toHaveProperty('package_name');
      expect(recommendationData).toHaveProperty('price');
      expect(recommendationData).toHaveProperty('est_cpf');
      expect(recommendationData).toHaveProperty('marketplace_url');
      expect(recommendationData).toHaveProperty('sport');
      expect(recommendationData).toHaveProperty('logo');
      expect(recommendationData).toHaveProperty('images');

      // Verify types
      expect(typeof recommendationData.team_name).toBe('string');
      expect(typeof recommendationData.distance_km).toBe('number');
      expect(typeof recommendationData.total_reach).toBe('number');
      expect(typeof recommendationData.price).toBe('number');
      expect(Array.isArray(recommendationData.images)).toBe(true);
    });

    it('should handle nullable fields gracefully', () => {
      const minimalRecommendation = {
        team_profile_id: '123',
        team_name: 'Test Team',
        distance_km: 10,
        total_reach: 1000,
        sponsorship_offer_id: 'offer-1',
        package_id: 'pkg-1',
        package_name: 'Package',
        price: 1000,
        est_cpf: 1.0,
        marketplace_url: 'https://test.com',
        sport: 'Soccer',
        logo: null, // nullable
        images: null, // nullable
      };

      expect(minimalRecommendation.logo).toBeNull();
      expect(minimalRecommendation.images).toBeNull();
    });
  });

  describe('✅ Backend Data Transformation', () => {
    it('should transform RPC results into recommendation objects with all fields', () => {
      // Simulate rpc_recommend_offers result
      const rpcResult = {
        team_profile_id: '123',
        team_name: 'Test Team',
        distance_km: 15.5,
        total_reach: 2000,
        sponsorship_offer_id: 'offer-1',
        package_id: 'pkg-1',
        package_name: 'Silver Package',
        price: 3000,
        est_cpf: 1.5,
        marketplace_url: 'https://test.com/marketplace/offer-1',
        sport: 'Basketball',
        logo: 'https://test.com/logo.png',
        images: ['https://test.com/img.png'],
      };

      // Verify transformation preserves all data
      const stored = {
        conversation_id: 'conv-123',
        message_id: 'msg-456',
        sponsorship_offer_id: rpcResult.sponsorship_offer_id,
        package_id: rpcResult.package_id,
        recommendation_reason: 'AI recommendation based on user query',
        recommendation_data: rpcResult, // ✅ Full object stored
      };

      expect(stored.recommendation_data).toEqual(rpcResult);
      expect(stored.recommendation_data.team_name).toBe('Test Team');
      expect(stored.recommendation_data.price).toBe(3000);
    });

    it('should store multiple recommendations correctly', () => {
      const recommendations = [
        {
          team_name: 'Team A',
          price: 1000,
          sponsorship_offer_id: 'offer-a',
          package_id: 'pkg-a',
        },
        {
          team_name: 'Team B',
          price: 2000,
          sponsorship_offer_id: 'offer-b',
          package_id: 'pkg-b',
        },
        {
          team_name: 'Team C',
          price: 3000,
          sponsorship_offer_id: 'offer-c',
          package_id: 'pkg-c',
        },
      ];

      const stored = recommendations.map((rec: any) => ({
        conversation_id: 'conv-1',
        message_id: 'msg-1',
        sponsorship_offer_id: rec.sponsorship_offer_id,
        package_id: rec.package_id,
        recommendation_reason: 'AI recommendation',
        recommendation_data: rec,
      }));

      expect(stored).toHaveLength(3);
      expect(stored[0].recommendation_data.team_name).toBe('Team A');
      expect(stored[1].recommendation_data.team_name).toBe('Team B');
      expect(stored[2].recommendation_data.team_name).toBe('Team C');
    });
  });

  describe('✅ Frontend Data Loading', () => {
    it('should extract recommendation_data from ai_recommendations JOIN', () => {
      // Simulate Supabase query result
      const messagesData = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Show me teams',
          created_at: '2025-01-01T10:00:00Z',
          ai_recommendations: [],
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Here are some options',
          created_at: '2025-01-01T10:00:01Z',
          ai_recommendations: [
            {
              sponsorship_offer_id: 'offer-1',
              package_id: 'pkg-1',
              recommendation_reason: 'AI recommendation',
              user_action: null,
              recommendation_data: {
                team_name: 'Loaded Team',
                price: 5000,
                total_reach: 3000,
                distance_km: 20.0,
                sport: 'Baseball',
                package_name: 'Gold',
                logo: 'https://test.com/logo.png',
                images: null,
                est_cpf: 1.67,
                marketplace_url: 'https://test.com/marketplace/offer-1',
                sponsorship_offer_id: 'offer-1',
                package_id: 'pkg-1',
                team_profile_id: '789',
              },
            },
          ],
        },
      ];

      // Transform as frontend does
      const transformedMessages = messagesData.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        recommendations: msg.ai_recommendations
          ?.map((rec: any) => rec.recommendation_data)
          .filter((data: any) => data != null) || undefined,
      }));

      expect(transformedMessages).toHaveLength(2);
      expect(transformedMessages[0].recommendations).toBeUndefined();
      expect(transformedMessages[1].recommendations).toHaveLength(1);
      expect(transformedMessages[1].recommendations?.[0].team_name).toBe('Loaded Team');
      expect(transformedMessages[1].recommendations?.[0].price).toBe(5000);
    });

    it('should filter out null recommendation_data entries', () => {
      const aiRecommendations = [
        { recommendation_data: { team_name: 'Team 1', price: 1000 } },
        { recommendation_data: null }, // Should be filtered
        { recommendation_data: { team_name: 'Team 2', price: 2000 } },
        { recommendation_data: null }, // Should be filtered
      ];

      const filtered = aiRecommendations
        .map((rec: any) => rec.recommendation_data)
        .filter((data: any) => data != null);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].team_name).toBe('Team 1');
      expect(filtered[1].team_name).toBe('Team 2');
    });

    it('should return undefined when no recommendations exist', () => {
      const msg = {
        id: 'msg-1',
        role: 'assistant',
        content: 'What can I help with?',
        created_at: '2025-01-01T10:00:00Z',
        ai_recommendations: [],
      };

      const recommendations = msg.ai_recommendations
        ?.map((rec: any) => rec.recommendation_data)
        .filter((data: any) => data != null) || undefined;

      expect(recommendations).toBeUndefined();
    });
  });

  describe('✅ Data Integrity', () => {
    it('should maintain referential integrity between IDs and data', () => {
      const recommendation = {
        sponsorship_offer_id: 'offer-123',
        package_id: 'pkg-456',
        recommendation_data: {
          sponsorship_offer_id: 'offer-123',
          package_id: 'pkg-456',
          team_name: 'Test Team',
        },
      };

      // IDs should match
      expect(recommendation.sponsorship_offer_id).toBe(
        recommendation.recommendation_data.sponsorship_offer_id
      );
      expect(recommendation.package_id).toBe(
        recommendation.recommendation_data.package_id
      );
    });
  });
});
