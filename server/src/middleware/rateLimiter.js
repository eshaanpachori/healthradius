import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per window
  message: {
    success: false,
    message: 'Too many authentication requests, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit search queries to 60 per minute
  message: {
    success: false,
    message: 'Too many nearby searches, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const actionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // Limit reviews/reports to 15 per window
  message: {
    success: false,
    message: 'Too many submissions, please wait a few minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
