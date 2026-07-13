import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';

// Route imports
import authRoutes from './routes/auth.js';
import hospitalRoutes from './routes/hospitals.js';
import reviewRoutes from './routes/reviews.js';
import favoriteRoutes from './routes/favorites.js';
import adminRoutes from './routes/admin.js';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Standard parsers with body size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Development logging
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// System configuration & health probes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date()
  });
});

app.get('/api/public-config', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json({
    success: true,
    data: {
      appName: 'HealthRadius',
      emergencyMessage: env.emergencyMessage,
      emergencyPhone: env.emergencyPhone,
      provider: env.hospitalDataProvider,
      demoLocationName: env.demoLocationName,
      demoCenter: {
        lat: env.demoCenterLat,
        lng: env.demoCenterLng
      }
    }
  });
});

// App routes mounts
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);

// --- Production: Serve React client static files ---
if (env.nodeEnv === 'production') {
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // SPA fallback: any non-API route serves index.html (React Router handles it)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Fallbacks (only in development — in production the SPA catch-all handles it)
  app.use(notFound);
}

app.use(errorHandler);

export default app;
