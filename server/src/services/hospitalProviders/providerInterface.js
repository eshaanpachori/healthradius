import { env } from '../../config/env.js';
import { demoProvider } from './demoProvider.js';
import { googleProvider } from './googleProvider.js';

export const getHospitalProvider = () => {
  const providerName = env.hospitalDataProvider;
  
  if (providerName === 'google') {
    if (!env.googlePlacesApiKey) {
      console.warn('WARNING: HOSPITAL_DATA_PROVIDER is set to "google" but GOOGLE_PLACES_API_KEY is missing. Falling back to "demo".');
      return demoProvider;
    }
    return googleProvider;
  }
  
  return demoProvider;
};

export const activeProvider = getHospitalProvider();
