import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { Report } from '../models/Report.js';
import { Favorite } from '../models/Favorite.js';
import { HospitalProfile } from '../models/HospitalProfile.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const publishedReviews = await Review.countDocuments({ status: 'published' });
    const pendingReviews = await Review.countDocuments({ status: 'pending' });
    const openReports = await Report.countDocuments({ status: 'open' });
    const verifiedProfiles = await HospitalProfile.countDocuments({ verified: true });
    const totalFavorites = await Favorite.countDocuments();

    // Aggregates
    // 1. Most frequently saved hospitals
    const topFavorites = await Favorite.aggregate([
      { $group: { _id: { source: '$source', hospitalId: '$hospitalId' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 2. Reviews created by month (past 6 months)
    const reviewsByMonth = await Review.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);

    // 3. Reports by category
    const reportsByCategory = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          publishedReviews,
          pendingReviews,
          openReports,
          verifiedProfiles,
          totalFavorites
        },
        topFavorites,
        reviewsByMonth,
        reportsByCategory
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { reports } });
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, adminNote } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    report.status = status;
    if (adminNote !== undefined) {
      report.adminNote = adminNote;
    }
    await report.save();

    res.json({ success: true, message: 'Report status updated successfully', data: report });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { reviews } });
  } catch (error) {
    next(error);
  }
};

export const moderateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status, moderationReason } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    review.status = status;
    if (moderationReason !== undefined) {
      review.moderationReason = moderationReason;
    }
    await review.save();

    res.json({ success: true, message: 'Review moderated successfully', data: review });
  } catch (error) {
    next(error);
  }
};

export const getHospitalProfiles = async (req, res, next) => {
  try {
    const profiles = await HospitalProfile.find().sort({ updatedAt: -1 });
    res.json({ success: true, data: { hospitalProfiles: profiles } });
  } catch (error) {
    next(error);
  }
};

export const updateHospitalProfile = async (req, res, next) => {
  try {
    const { source, hospitalId } = req.params;
    const updateData = req.body;

    let profile = await HospitalProfile.findOne({ source, externalId: hospitalId });
    
    if (!profile) {
      profile = new HospitalProfile({
        source,
        externalId: hospitalId
      });
    }

    // Update allowed fields
    const fields = [
      'description',
      'ownershipType',
      'specialties',
      'facilities',
      'emergencyAvailable',
      'ambulanceNumber',
      'insuranceAccepted',
      'wheelchairAccessible',
      'verified',
      'dataNotes'
    ];

    fields.forEach(field => {
      if (updateData[field] !== undefined) {
        profile[field] = updateData[field];
      }
    });

    if (updateData.verified) {
      profile.verifiedAt = new Date();
      profile.verifiedBy = req.user._id;
    } else {
      profile.verifiedAt = null;
      profile.verifiedBy = null;
    }
    profile.lastInformationReviewAt = new Date();

    await profile.save();

    res.json({
      success: true,
      message: 'HealthRadius hospital details updated successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ success: true, message: `User account has been ${isActive ? 'activated' : 'suspended'}.`, data: user });
  } catch (error) {
    next(error);
  }
};
