/**
 * Recommendation Score Calculator
 * 
 * Formula:
 * weightedRating = (v / (v + m)) * R + (m / (v + m)) * C
 * 
 * Where:
 * - R is external rating
 * - v is external review count
 * - m is confidence threshold (default 20)
 * - C is mean rating across search results (default 3.5 if no ratings)
 */
export const calculateRecommendation = (hospital, options = {}) => {
  const R = hospital.externalRating || 0;
  const v = hospital.externalReviewCount || 0;
  const m = options.minReviews || 20;
  const C = options.meanRating || 3.5;
  const distanceMeters = hospital.distanceMeters || 0;
  const maxRadiusMeters = options.maxRadius || 5000;
  const openNow = hospital.openNow;
  const verified = hospital.verified || false;

  // 1. Calculate Weighted Rating
  let weightedRating = C;
  if (v > 0 || R > 0) {
    weightedRating = (v / (v + m)) * R + (m / (v + m)) * C;
  }
  // Clamp weighted rating to 1.0 - 5.0
  weightedRating = Math.max(1, Math.min(5, weightedRating));

  // Scale 1-5 rating to 0-100
  const ratingComponent = ((weightedRating - 1) / 4) * 100;

  // 2. Review Confidence Component (0 to 100)
  // How confident we are in the rating based on number of reviews
  const reviewConfidenceComponent = Math.min(100, (v / (v + m)) * 100);

  // 3. Distance Component (0 to 100)
  // Scores 100 at 0m distance, decaying linearly to 0 at maxRadius
  const distanceComponent = Math.max(0, (1 - distanceMeters / maxRadiusMeters) * 100);

  // Weighted Combination
  // 70% weighted rating, 15% review confidence, 15% distance
  const score = 0.7 * ratingComponent + 0.15 * reviewConfidenceComponent + 0.15 * distanceComponent;
  const recommendationScore = Math.round(score);

  // Qualitative reasons
  const recommendationReasons = [];
  if (R >= 4.0 && v >= 5) {
    recommendationReasons.push('Highly rated');
  }
  if (v >= 50) {
    recommendationReasons.push('Large number of ratings');
  }
  if (distanceMeters < 1000) {
    recommendationReasons.push('Less than 1 km away');
  }
  if (openNow === true) {
    recommendationReasons.push('Currently open');
  }
  if (verified === true) {
    recommendationReasons.push('Verified information');
  }

  // Ensure reasons are not empty
  if (recommendationReasons.length === 0) {
    if (distanceMeters < 3000) {
      recommendationReasons.push('Convenient distance');
    } else {
      recommendationReasons.push('Informational matching');
    }
  }

  return {
    recommendationScore,
    recommendationReasons
  };
};
