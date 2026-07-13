import { DemoHospital } from '../../models/DemoHospital.js';
import { HospitalProfile } from '../../models/HospitalProfile.js';
import { Review } from '../../models/Review.js';
import { calculateDistance } from '../../utils/distance.js';

export const demoProvider = {
  getProviderMetadata() {
    return {
      name: 'demo',
      isDemo: true
    };
  },

  async searchNearby(options = {}) {
    const {
      lat,
      lng,
      radius = 5000,
      minRating = 0,
      emergency = false,
      ownershipType = '',
      specialty = '',
      wheelchairAccessible = false,
      openNow = false,
      page = 1,
      limit = 20,
      sort = 'recommended'
    } = options;

    const radiusInRadians = radius / 6371000;
    const query = {
      isActive: true,
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusInRadians]
        }
      }
    };

    // Filters
    if (minRating > 0) {
      query.externalRating = { $gte: parseFloat(minRating) };
    }
    if (emergency) {
      query.emergencyAvailable = true;
    }
    if (ownershipType) {
      query.ownershipType = ownershipType;
    }
    if (specialty) {
      query.specialties = specialty;
    }
    if (wheelchairAccessible) {
      query.wheelchairAccessible = true;
    }

    // Fetch all matching records (we need to compute distance and load profile integrations)
    let records = await DemoHospital.find(query);

    // Get extra HealthRadius profiles for these records
    const ids = records.map(r => r._id.toString());
    const profiles = await HospitalProfile.find({
      source: 'demo',
      externalId: { $in: ids }
    });
    const profileMap = new Map(profiles.map(p => [p.externalId, p]));

    // Get aggregated community reviews stats (community rating & count)
    const reviewsAgg = await Review.aggregate([
      { $match: { source: 'demo', hospitalId: { $in: ids }, status: 'published' } },
      { $group: { _id: '$hospitalId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const reviewsMap = new Map(reviewsAgg.map(r => [r._id, r]));

    // Map & Normalize
    let normalizedList = records.map(record => {
      const idStr = record._id.toString();
      const profile = profileMap.get(idStr);
      const reviews = reviewsMap.get(idStr);
      
      const distance = calculateDistance(lat, lng, record.location.coordinates[1], record.location.coordinates[0]);

      // Determine openNow (simulate based on seed hours if needed)
      // For simplicity, demo data is openNow unless specified otherwise, or we can parse it
      const openStatus = true; // default demo status

      const normalized = {
        id: idStr,
        source: 'demo',
        name: record.name,
        address: record.address,
        location: {
          latitude: record.location.coordinates[1],
          longitude: record.location.coordinates[0]
        },
        distanceMeters: Math.round(distance),
        distanceKm: parseFloat((distance / 1000).toFixed(2)),
        externalRating: record.externalRating || 0,
        externalReviewCount: record.externalReviewCount || 0,
        phone: record.phone || null,
        website: record.website || null,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${record.location.coordinates[1]},${record.location.coordinates[0]}`,
        openNow: openStatus,
        openingHours: record.openingHours || [],
        categories: record.specialties || [],
        businessStatus: 'OPERATIONAL',
        appProfile: profile || {},
        appRating: reviews ? parseFloat(reviews.avgRating.toFixed(1)) : 0,
        appReviewCount: reviews ? reviews.count : 0,
        verified: profile ? profile.verified : false,
        isDemo: true
      };

      // Merge verified overrides if present
      if (profile) {
        if (profile.description) normalized.description = profile.description;
        if (profile.ownershipType) normalized.ownershipType = profile.ownershipType;
        if (profile.specialties && profile.specialties.length) normalized.categories = profile.specialties;
        if (profile.facilities && profile.facilities.length) normalized.facilities = profile.facilities;
        normalized.emergencyAvailable = profile.emergencyAvailable;
        if (profile.ambulanceNumber) normalized.ambulanceNumber = profile.ambulanceNumber;
        if (profile.insuranceAccepted && profile.insuranceAccepted.length) normalized.insuranceAccepted = profile.insuranceAccepted;
        normalized.wheelchairAccessible = profile.wheelchairAccessible;
      } else {
        // Fallback to record attributes
        normalized.description = record.description || '';
        normalized.ownershipType = record.ownershipType || 'unknown';
        normalized.facilities = record.facilities || [];
        normalized.emergencyAvailable = record.emergencyAvailable || false;
        normalized.ambulanceNumber = record.ambulanceNumber || '';
        normalized.insuranceAccepted = record.insuranceAccepted || [];
        normalized.wheelchairAccessible = record.wheelchairAccessible || false;
      }

      return normalized;
    });

    // Filtering by openNow in JS if filter requested
    if (openNow) {
      normalizedList = normalizedList.filter(h => h.openNow === true);
    }

    return normalizedList;
  },

  async getHospitalDetails(id) {
    const record = await DemoHospital.findById(id);
    if (!record || !record.isActive) {
      return null;
    }

    const profile = await HospitalProfile.findOne({ source: 'demo', externalId: id });
    
    // Aggregated community reviews for this hospital
    const reviewsAgg = await Review.aggregate([
      { $match: { source: 'demo', hospitalId: id, status: 'published' } },
      { $group: { _id: '$hospitalId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const reviews = reviewsAgg[0];

    const normalized = {
      id: record._id.toString(),
      source: 'demo',
      name: record.name,
      address: record.address,
      location: {
        latitude: record.location.coordinates[1],
        longitude: record.location.coordinates[0]
      },
      distanceMeters: 0, // calculated relative to search center by client or API handler
      distanceKm: 0,
      externalRating: record.externalRating || 0,
      externalReviewCount: record.externalReviewCount || 0,
      phone: record.phone || null,
      website: record.website || null,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${record.location.coordinates[1]},${record.location.coordinates[0]}`,
      openNow: true,
      openingHours: record.openingHours || [],
      categories: record.specialties || [],
      businessStatus: 'OPERATIONAL',
      appProfile: profile || {},
      appRating: reviews ? parseFloat(reviews.avgRating.toFixed(1)) : 0,
      appReviewCount: reviews ? reviews.count : 0,
      verified: profile ? profile.verified : false,
      isDemo: true
    };

    // Merge profile fields
    if (profile) {
      normalized.description = profile.description || '';
      normalized.ownershipType = profile.ownershipType || 'unknown';
      normalized.specialties = profile.specialties || [];
      normalized.facilities = profile.facilities || [];
      normalized.emergencyAvailable = profile.emergencyAvailable || false;
      normalized.ambulanceNumber = profile.ambulanceNumber || '';
      normalized.insuranceAccepted = profile.insuranceAccepted || [];
      normalized.wheelchairAccessible = profile.wheelchairAccessible || false;
    } else {
      normalized.description = record.description || '';
      normalized.ownershipType = record.ownershipType || 'unknown';
      normalized.specialties = record.specialties || [];
      normalized.facilities = record.facilities || [];
      normalized.emergencyAvailable = record.emergencyAvailable || false;
      normalized.ambulanceNumber = record.ambulanceNumber || '';
      normalized.insuranceAccepted = record.insuranceAccepted || [];
      normalized.wheelchairAccessible = record.wheelchairAccessible || false;
    }

    return normalized;
  }
};
