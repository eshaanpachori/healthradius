import { activeProvider } from '../services/hospitalProviders/providerInterface.js';
import { calculateRecommendation } from '../utils/recommend.js';
import { calculateDistance } from '../utils/distance.js';
import { Report } from '../models/Report.js';

export const getNearbyHospitals = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      radius,
      minRating,
      openNow,
      emergency,
      ownershipType,
      specialty,
      wheelchairAccessible,
      page,
      limit,
      sort
    } = req.query;

    // Safety checks (Zod validator covers these, but redundant checks for robust controller)
    if (radius > 5000) {
      return res.status(400).json({ success: false, message: 'Radius must not exceed 5000 meters.' });
    }

    // Call active provider adapter (demo or google)
    const hospitals = await activeProvider.searchNearby({
      lat,
      lng,
      radius,
      minRating,
      openNow,
      emergency,
      ownershipType,
      specialty,
      wheelchairAccessible,
      sort,
      page,
      limit
    });

    // Calculate mean rating for recommendation formula (C)
    const ratedHospitals = hospitals.filter(h => h.externalRating > 0);
    const sumRatings = ratedHospitals.reduce((sum, h) => sum + h.externalRating, 0);
    const meanRating = ratedHospitals.length > 0 ? sumRatings / ratedHospitals.length : 3.5;

    // Apply recommendation score
    let scoredHospitals = hospitals.map(h => {
      const rec = calculateRecommendation(h, {
        minReviews: 20,
        meanRating,
        maxRadius: radius
      });
      return {
        ...h,
        recommendationScore: rec.recommendationScore,
        recommendationReasons: rec.recommendationReasons
      };
    });

    // Sort matching results
    if (sort === 'recommended') {
      scoredHospitals.sort((a, b) => b.recommendationScore - a.recommendationScore);
    } else if (sort === 'nearest') {
      scoredHospitals.sort((a, b) => a.distanceMeters - b.distanceMeters);
    } else if (sort === 'highest-rated') {
      scoredHospitals.sort((a, b) => b.externalRating - a.externalRating);
    } else if (sort === 'most-reviewed') {
      scoredHospitals.sort((a, b) => b.externalReviewCount - a.externalReviewCount);
    } else if (sort === 'app-rating') {
      scoredHospitals.sort((a, b) => b.appRating - a.appRating);
    } else if (sort === 'name') {
      scoredHospitals.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Paginate results in memory (essential for uniform multi-provider output formatting)
    const totalResults = scoredHospitals.length;
    const startIndex = (page - 1) * limit;
    const paginatedHospitals = scoredHospitals.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      data: {
        hospitals: paginatedHospitals,
        pagination: {
          total: totalResults,
          page,
          limit,
          pages: Math.ceil(totalResults / limit)
        },
        search: {
          latitude: lat,
          longitude: lng,
          radiusMeters: radius,
          provider: activeProvider.getProviderMetadata().name
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getHospitalDetails = async (req, res, next) => {
  try {
    const { source, hospitalId } = req.params;
    const { lat, lng } = req.query;

    const details = await activeProvider.getHospitalDetails(hospitalId);
    if (!details || details.source !== source) {
      return res.status(404).json({ success: false, message: 'Hospital details not found or source mismatch.' });
    }

    // If client supplied user location coordinates, compute real-time distance
    if (lat && lng) {
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        details.location.latitude,
        details.location.longitude
      );
      details.distanceMeters = Math.round(distance);
      details.distanceKm = parseFloat((distance / 1000).toFixed(2));
    }

    res.json({
      success: true,
      data: {
        hospital: details
      }
    });
  } catch (error) {
    next(error);
  }
};

export const submitReport = async (req, res, next) => {
  try {
    const { source, hospitalId } = req.params;
    const { category, message } = req.body;

    const report = await Report.create({
      user: req.user ? req.user._id : null,
      source,
      hospitalId,
      category,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Administrators will review it.',
      data: report
    });
  } catch (error) {
    next(error);
  }
};
