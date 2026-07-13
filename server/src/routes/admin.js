import express from 'express';
import {
  getDashboardStats,
  getReports,
  updateReportStatus,
  getReviews,
  moderateReview,
  getHospitalProfiles,
  updateHospitalProfile,
  updateUserStatus
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply admin protection to all routes below
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/reports', getReports);
router.patch('/reports/:reportId', updateReportStatus);
router.get('/reviews', getReviews);
router.patch('/reviews/:reviewId/moderate', moderateReview);
router.get('/hospital-profiles', getHospitalProfiles);
router.put('/hospital-profiles/:source/:hospitalId', updateHospitalProfile);
router.patch('/users/:userId/status', updateUserStatus);

export default router;
