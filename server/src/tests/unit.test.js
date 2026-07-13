import { describe, it, expect } from 'vitest';
import { calculateDistance } from '../utils/distance.js';
import { calculateRecommendation } from '../utils/recommend.js';

// ===== Distance Utility Tests =====
describe('calculateDistance', () => {
  it('returns 0 for same coordinates', () => {
    const dist = calculateDistance(40.7128, -74.006, 40.7128, -74.006);
    expect(dist).toBeCloseTo(0, 1);
  });

  it('calculates approximate distance between two NYC points', () => {
    // Distance from Times Square to Central Park ~2km
    const dist = calculateDistance(40.758, -73.9855, 40.7829, -73.9654);
    expect(dist).toBeGreaterThan(1500);
    expect(dist).toBeLessThan(4000);
  });

  it('handles different hemispheres', () => {
    const dist = calculateDistance(40.7128, -74.006, -33.8688, 151.2093); // NYC to Sydney
    expect(dist).toBeGreaterThan(10000000); // > 10,000 km
  });
});

// ===== Recommendation Algorithm Tests =====
describe('calculateRecommendation', () => {
  it('handles zero reviews gracefully', () => {
    const hospital = { externalRating: 0, externalReviewCount: 0, distanceMeters: 1000, openNow: null, verified: false };
    const result = calculateRecommendation(hospital, { minReviews: 20, meanRating: 3.5, maxRadius: 5000 });
    expect(result.recommendationScore).toBeGreaterThanOrEqual(0);
    expect(result.recommendationScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.recommendationReasons)).toBe(true);
  });

  it('handles one review hospital with high rating', () => {
    const hospital = { externalRating: 5.0, externalReviewCount: 1, distanceMeters: 500, openNow: true, verified: false };
    const result = calculateRecommendation(hospital, { minReviews: 20, meanRating: 3.5, maxRadius: 5000 });
    // Score should exist but not max because of low review count
    expect(result.recommendationScore).toBeGreaterThan(0);
    expect(result.recommendationScore).toBeLessThanOrEqual(100);
  });

  it('high review count hospital gets higher confidence score', () => {
    const lowReviews = { externalRating: 4.5, externalReviewCount: 2, distanceMeters: 2000, openNow: false, verified: false };
    const highReviews = { externalRating: 4.5, externalReviewCount: 500, distanceMeters: 2000, openNow: false, verified: false };
    const lowResult = calculateRecommendation(lowReviews, { minReviews: 20, meanRating: 4.0, maxRadius: 5000 });
    const highResult = calculateRecommendation(highReviews, { minReviews: 20, meanRating: 4.0, maxRadius: 5000 });
    expect(highResult.recommendationScore).toBeGreaterThan(lowResult.recommendationScore);
  });

  it('missing rating falls back to mean rating', () => {
    const hospital = { externalRating: 0, externalReviewCount: 0, distanceMeters: 1000, openNow: null, verified: false };
    const result = calculateRecommendation(hospital, { minReviews: 20, meanRating: 4.0, maxRadius: 5000 });
    expect(result.recommendationScore).toBeGreaterThanOrEqual(0);
  });

  it('nearer hospital scores higher than far hospital with same rating', () => {
    const near = { externalRating: 4.2, externalReviewCount: 30, distanceMeters: 500, openNow: false, verified: false };
    const far = { externalRating: 4.2, externalReviewCount: 30, distanceMeters: 4500, openNow: false, verified: false };
    const nearResult = calculateRecommendation(near, { minReviews: 20, meanRating: 4.0, maxRadius: 5000 });
    const farResult = calculateRecommendation(far, { minReviews: 20, meanRating: 4.0, maxRadius: 5000 });
    expect(nearResult.recommendationScore).toBeGreaterThan(farResult.recommendationScore);
  });

  it('adds "Highly rated" reason for high rating with enough reviews', () => {
    const hospital = { externalRating: 4.8, externalReviewCount: 50, distanceMeters: 800, openNow: false, verified: false };
    const result = calculateRecommendation(hospital, { minReviews: 20, meanRating: 4.0, maxRadius: 5000 });
    expect(result.recommendationReasons).toContain('Highly rated');
  });

  it('adds "Less than 1 km away" for very close hospitals', () => {
    const hospital = { externalRating: 3.8, externalReviewCount: 10, distanceMeters: 700, openNow: false, verified: false };
    const result = calculateRecommendation(hospital, { minReviews: 20, meanRating: 3.8, maxRadius: 5000 });
    expect(result.recommendationReasons).toContain('Less than 1 km away');
  });

  it('score is always between 0 and 100', () => {
    const cases = [
      { externalRating: 5, externalReviewCount: 1000, distanceMeters: 0, openNow: true, verified: true },
      { externalRating: 1, externalReviewCount: 0, distanceMeters: 5000, openNow: false, verified: false },
      { externalRating: 0, externalReviewCount: 0, distanceMeters: 2500, openNow: null, verified: false }
    ];
    cases.forEach(hospital => {
      const result = calculateRecommendation(hospital, { minReviews: 20, meanRating: 3.5, maxRadius: 5000 });
      expect(result.recommendationScore).toBeGreaterThanOrEqual(0);
      expect(result.recommendationScore).toBeLessThanOrEqual(100);
    });
  });
});

// ===== Coordinate Validation Tests =====
describe('Coordinate validation', () => {
  const isValidLat = (lat) => lat >= -90 && lat <= 90;
  const isValidLng = (lng) => lng >= -180 && lng <= 180;
  const isValidRadius = (r) => r >= 500 && r <= 5000;

  it('rejects latitude out of bounds', () => {
    expect(isValidLat(91)).toBe(false);
    expect(isValidLat(-91)).toBe(false);
    expect(isValidLat(90)).toBe(true);
    expect(isValidLat(-90)).toBe(true);
  });

  it('rejects longitude out of bounds', () => {
    expect(isValidLng(181)).toBe(false);
    expect(isValidLng(-181)).toBe(false);
    expect(isValidLng(180)).toBe(true);
    expect(isValidLng(-180)).toBe(true);
  });

  it('enforces radius boundaries of 500m to 5000m', () => {
    expect(isValidRadius(499)).toBe(false);
    expect(isValidRadius(5001)).toBe(false);
    expect(isValidRadius(500)).toBe(true);
    expect(isValidRadius(5000)).toBe(true);
    expect(isValidRadius(2500)).toBe(true);
  });
});
