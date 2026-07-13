import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config();

const requiredEnvs = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'MONGO_URI'
];

for (const env of requiredEnvs) {
  if (!process.env[env]) {
    console.error(`Error: Environment variable ${env} is required but missing.`);
    process.exit(1);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  cookieName: process.env.COOKIE_NAME || 'healthradius_refresh',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax',
  
  hospitalDataProvider: process.env.HOSPITAL_DATA_PROVIDER || 'demo',
  
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  googleRequestTimeoutMs: parseInt(process.env.GOOGLE_REQUEST_TIMEOUT_MS || '8000', 10),
  
  demoCenterLat: parseFloat(process.env.DEMO_CENTER_LAT || '40.7128'),
  demoCenterLng: parseFloat(process.env.DEMO_CENTER_LNG || '-74.0060'),
  demoLocationName: process.env.DEMO_LOCATION_NAME || 'HealthRadius Demo City',
  
  recommendationMinReviews: parseInt(process.env.RECOMMENDATION_MIN_REVIEWS || '20', 10),
  
  seedAdminName: process.env.SEED_ADMIN_NAME || 'HealthRadius Admin',
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || 'adminpassword123',
  
  emergencyMessage: process.env.EMERGENCY_MESSAGE || 'In an emergency, contact your local emergency service.',
  emergencyPhone: process.env.EMERGENCY_PHONE || '911'
};
