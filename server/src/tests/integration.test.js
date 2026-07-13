import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { DemoHospital } from '../models/DemoHospital.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

// Use a test MongoDB URI
const TEST_MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthradius_test';

// Mock dotenv loaded values
vi.mock('../config/env.js', () => ({
  env: {
    nodeEnv: 'test',
    port: 5001,
    mongoUri: TEST_MONGO_URI,
    clientUrl: 'http://localhost:5173',
    jwtAccessSecret: 'test_access_secret_123',
    jwtRefreshSecret: 'test_refresh_secret_456',
    jwtAccessExpiresIn: '15m',
    jwtRefreshExpiresIn: '7d',
    cookieName: 'healthradius_refresh',
    cookieSecure: false,
    cookieSameSite: 'lax',
    hospitalDataProvider: 'demo',
    googlePlacesApiKey: '',
    googleRequestTimeoutMs: 8000,
    demoCenterLat: 40.7128,
    demoCenterLng: -74.006,
    demoLocationName: 'Test City',
    recommendationMinReviews: 20,
    seedAdminName: 'Test Admin',
    seedAdminEmail: 'admin@test.com',
    seedAdminPassword: 'adminpass123',
    emergencyMessage: 'Call emergency services.',
    emergencyPhone: '911'
  }
}));

describe('API Integration Tests', () => {

  describe('Health Check', () => {
    it('GET /api/health returns 200', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('POST /api/auth/register creates a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'testuser@example.com', password: 'password123' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('testuser@example.com');
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/register rejects duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'User 2', email: 'duplicate@example.com', password: 'password123' });
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User 3', email: 'duplicate@example.com', password: 'password456' });
      
      expect(res.status).toBe(400);
    });

    it('POST /api/auth/login fails with wrong password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Login Test', email: 'logintest@example.com', password: 'correctpass' });
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'logintest@example.com', password: 'wrongpass' });
      
      expect(res.status).toBe(401);
    });

    it('POST /api/auth/login succeeds with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'logintest@example.com', password: 'correctpass' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Hospital Nearby Search', () => {
    it('GET /api/hospitals/nearby requires lat and lng', async () => {
      const res = await request(app).get('/api/hospitals/nearby');
      expect(res.status).toBe(400);
    });

    it('GET /api/hospitals/nearby rejects radius > 5000', async () => {
      const res = await request(app)
        .get('/api/hospitals/nearby')
        .query({ lat: 40.7128, lng: -74.006, radius: 6000 });
      expect(res.status).toBe(400);
    });

    it('GET /api/hospitals/nearby returns valid response structure', async () => {
      const res = await request(app)
        .get('/api/hospitals/nearby')
        .query({ lat: 40.7128, lng: -74.006, radius: 5000 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('hospitals');
      expect(res.body.data).toHaveProperty('pagination');
      expect(res.body.data).toHaveProperty('search');
      expect(Array.isArray(res.body.data.hospitals)).toBe(true);
    });

    it('GET /api/hospitals/nearby enforces 5km maximum radius', async () => {
      const res = await request(app)
        .get('/api/hospitals/nearby')
        .query({ lat: 40.7128, lng: -74.006, radius: 5001 });
      expect(res.status).toBe(400);
    });
  });

  describe('Admin Authorization', () => {
    it('GET /api/admin/dashboard rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      expect(res.status).toBe(401);
    });

    it('GET /api/admin/dashboard rejects regular user tokens', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Regular User', email: 'regular@example.com', password: 'password123' });
      
      const token = registerRes.body.data.token;
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(403);
    });
  });

});
