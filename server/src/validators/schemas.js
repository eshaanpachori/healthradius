import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').or(z.literal('')).optional()
});

export const nearbySearchSchema = z.object({
  lat: z.preprocess((val) => parseFloat(val), z.number().min(-90).max(90)),
  lng: z.preprocess((val) => parseFloat(val), z.number().min(-180).max(180)),
  radius: z.preprocess((val) => val ? parseInt(val, 10) : 5000, z.number().min(500).max(5000)),
  minRating: z.preprocess((val) => val ? parseFloat(val) : 0, z.number().min(0).max(5).optional()),
  openNow: z.preprocess((val) => val === 'true', z.boolean().optional()),
  emergency: z.preprocess((val) => val === 'true', z.boolean().optional()),
  ownershipType: z.enum(['government', 'private', 'charitable', 'teaching', 'unknown', '']).optional(),
  specialty: z.string().optional(),
  wheelchairAccessible: z.preprocess((val) => val === 'true', z.boolean().optional()),
  page: z.preprocess((val) => val ? parseInt(val, 10) : 1, z.number().min(1).optional()),
  limit: z.preprocess((val) => val ? parseInt(val, 10) : 20, z.number().min(1).max(100).optional()),
  sort: z.enum(['recommended', 'nearest', 'highest-rated', 'most-reviewed', 'app-rating', 'name']).default('recommended')
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  comment: z.string().min(1, 'Comment is required').max(1000, 'Comment too long'),
  visitMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Visit month must be in YYYY-MM format').or(z.literal('')).optional()
});

export const reportSchema = z.object({
  category: z.enum(['incorrect_phone', 'incorrect_address', 'incorrect_hours', 'closed', 'inappropriate_review', 'other']),
  message: z.string().min(5, 'Message must be at least 5 characters').max(1000)
});
