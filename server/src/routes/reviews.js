import express from 'express';
import {
  updateReview,
  deleteReview,
  reportReview
} from '../controllers/reviewController.js';
import { authenticate, validateRequest } from '../middleware/auth.js';
import { actionLimiter } from '../middleware/rateLimiter.js';
import { reviewSchema } from '../validators/schemas.js';

const router = express.Router();

router.patch('/:reviewId', authenticate, validateRequest(reviewSchema), updateReview);
router.delete('/:reviewId', authenticate, deleteReview);
router.post('/:reviewId/report', actionLimiter, authenticate, reportReview);

export default router;
