import { env } from '../../config/env.js';
import { HospitalProfile } from '../../models/HospitalProfile.js';
import { Review } from '../../models/Review.js';
import { calculateDistance } from '../../utils/distance.js';

export const googleProvider = {
  getProviderMetadata() {
    return {
      name: 'google',
      isDemo: false
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

    if (!env.googlePlacesApiKey) {
      throw new Error('Google Places API key is missing. Please set GOOGLE_PLACES_API_KEY in your env file or switch HOSPITAL_DATA_PROVIDER to "demo".');
    }

    // Google Places Text Search (New) or Nearby Search (New) API call
    // Using standard endpoint: https://places.googleapis.com/v1/places:searchNearby
    // We will use standard Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.googleRequestTimeoutMs);

    try {
      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': env.googlePlacesApiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.types'
        },
        body: JSON.stringify({
          includedTypes: ['hospital'],
          maxResultCount: limit,
          locationRestriction: {
            circle: {
              center: {
                latitude: lat,
                longitude: lng
              },
              radius: radius
            }
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google API request failed: ${response.statusText}. ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const places = data.places || [];

      // Load HealthRadius custom profiles and community reviews for these places
      const externalIds = places.map(p => p.id);
      const profiles = await HospitalProfile.find({ source: 'google', externalId: { $in: externalIds } });
      const profileMap = new Map(profiles.map(p => [p.externalId, p]));

      const reviewsAgg = await Review.aggregate([
        { $match: { source: 'google', hospitalId: { $in: externalIds }, status: 'published' } },
        { $group: { _id: '$hospitalId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      const reviewsMap = new Map(reviewsAgg.map(r => [r._id, r]));

      let normalizedList = places.map(place => {
        const id = place.id;
        const profile = profileMap.get(id);
        const reviews = reviewsMap.get(id);
        const distance = calculateDistance(lat, lng, place.location.latitude, place.location.longitude);

        const openStatus = place.regularOpeningHours?.openNow;
        const hours = place.regularOpeningHours?.weekdayDescriptions || [];

        const normalized = {
          id: id,
          source: 'google',
          name: place.displayName?.text || 'Google Places Hospital',
          address: place.formattedAddress || 'Address Unavailable',
          location: {
            latitude: place.location.latitude,
            longitude: place.location.longitude
          },
          distanceMeters: Math.round(distance),
          distanceKm: parseFloat((distance / 1000).toFixed(2)),
          externalRating: place.rating || 0,
          externalReviewCount: place.userRatingCount || 0,
          phone: place.nationalPhoneNumber || null,
          website: place.websiteUri || null,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${place.location.latitude},${place.location.longitude}`,
          openNow: openStatus !== undefined ? openStatus : null,
          openingHours: hours,
          categories: place.types || [],
          businessStatus: 'OPERATIONAL',
          appProfile: profile || {},
          appRating: reviews ? parseFloat(reviews.avgRating.toFixed(1)) : 0,
          appReviewCount: reviews ? reviews.count : 0,
          verified: profile ? profile.verified : false,
          isDemo: false
        };

        // Merge verified metadata
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
          normalized.description = '';
          normalized.ownershipType = 'unknown';
          normalized.facilities = [];
          normalized.emergencyAvailable = false;
          normalized.ambulanceNumber = '';
          normalized.insuranceAccepted = [];
          normalized.wheelchairAccessible = false;
        }

        return normalized;
      });

      // Local filters application since Google API returns all hospital types
      if (minRating > 0) {
        normalizedList = normalizedList.filter(h => h.externalRating >= minRating);
      }
      if (emergency) {
        normalizedList = normalizedList.filter(h => h.emergencyAvailable === true);
      }
      if (ownershipType) {
        normalizedList = normalizedList.filter(h => h.ownershipType === ownershipType);
      }
      if (wheelchairAccessible) {
        normalizedList = normalizedList.filter(h => h.wheelchairAccessible === true);
      }
      if (openNow) {
        normalizedList = normalizedList.filter(h => h.openNow === true);
      }

      return normalizedList;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Google Places API request timed out.');
      }
      throw error;
    }
  },

  async getHospitalDetails(id) {
    if (!env.googlePlacesApiKey) {
      throw new Error('Google Places API key is missing. Please set GOOGLE_PLACES_API_KEY in your env file.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.googleRequestTimeoutMs);

    try {
      const response = await fetch(`https://places.googleapis.com/v1/places/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': env.googlePlacesApiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,nationalPhoneNumber,websiteUri,regularOpeningHours,types'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Google Place details request failed: ${response.statusText}`);
      }

      const place = await response.json();
      const profile = await HospitalProfile.findOne({ source: 'google', externalId: id });
      
      const reviewsAgg = await Review.aggregate([
        { $match: { source: 'google', hospitalId: id, status: 'published' } },
        { $group: { _id: '$hospitalId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      const reviews = reviewsAgg[0];

      const openStatus = place.regularOpeningHours?.openNow;
      const hours = place.regularOpeningHours?.weekdayDescriptions || [];

      const normalized = {
        id: place.id,
        source: 'google',
        name: place.displayName?.text || 'Google Places Hospital',
        address: place.formattedAddress || 'Address Unavailable',
        location: {
          latitude: place.location.latitude,
          longitude: place.location.longitude
        },
        distanceMeters: 0,
        distanceKm: 0,
        externalRating: place.rating || 0,
        externalReviewCount: place.userRatingCount || 0,
        phone: place.nationalPhoneNumber || null,
        website: place.websiteUri || null,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${place.location.latitude},${place.location.longitude}`,
        openNow: openStatus !== undefined ? openStatus : null,
        openingHours: hours,
        categories: place.types || [],
        businessStatus: 'OPERATIONAL',
        appProfile: profile || {},
        appRating: reviews ? parseFloat(reviews.avgRating.toFixed(1)) : 0,
        appReviewCount: reviews ? reviews.count : 0,
        verified: profile ? profile.verified : false,
        isDemo: false
      };

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
        normalized.description = '';
        normalized.ownershipType = 'unknown';
        normalized.specialties = [];
        normalized.facilities = [];
        normalized.emergencyAvailable = false;
        normalized.ambulanceNumber = '';
        normalized.insuranceAccepted = [];
        normalized.wheelchairAccessible = false;
      }

      return normalized;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Google Places API request timed out.');
      }
      throw error;
    }
  }
};
