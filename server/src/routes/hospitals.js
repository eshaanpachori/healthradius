import express from 'express';
import {
  getNearbyHospitals,
  getHospitalDetails,
  submitReport
} from '../controllers/hospitalController.js';
import { getHospitalReviews, createReview } from '../controllers/reviewController.js';
import { optionalAuthenticate, authenticate, validateRequest } from '../middleware/auth.js';
import { searchLimiter, actionLimiter } from '../middleware/rateLimiter.js';
import { nearbySearchSchema, reportSchema, reviewSchema } from '../validators/schemas.js';

const router = express.Router();

router.get('/nearby', searchLimiter, validateRequest(nearbySearchSchema, 'query'), getNearbyHospitals);
router.get('/:source/:hospitalId', optionalAuthenticate, getHospitalDetails);
router.get('/:source/:hospitalId/reviews', getHospitalReviews);

// Submitting a correction report
router.post('/:source/:hospitalId/report', actionLimiter, optionalAuthenticate, validateRequest(reportSchema), submitReport);

// Submit a review for a hospital
router.post('/:source/:hospitalId/reviews', actionLimiter, authenticate, validateRequest(reviewSchema), createReview);

export default router;
