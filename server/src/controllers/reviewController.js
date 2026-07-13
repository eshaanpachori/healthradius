import { Review } from '../models/Review.js';
import { Report } from '../models/Report.js';

export const getHospitalReviews = async (req, res, next) => {
  try {
    const { source, hospitalId } = req.params;
    const { sort = 'newest' } = req.query;

    let sortObj = { createdAt: -1 };
    if (sort === 'highest-rated') {
      sortObj = { rating: -1, createdAt: -1 };
    }

    const reviews = await Review.find({
      source,
      hospitalId,
      status: 'published'
    })
      .populate('user', 'name avatarUrl')
      .sort(sortObj);

    // Calculate distributions & average
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    });

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          averageRating: avgRating,
          totalCount: totalReviews,
          distribution
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { source, hospitalId } = req.params;
    const { rating, title, comment, visitMonth } = req.body;
    const userId = req.user._id;

    // Check for duplicate reviews
    const existingReview = await Review.findOne({ user: userId, source, hospitalId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this hospital. You can edit your existing review instead.'
      });
    }

    const review = await Review.create({
      user: userId,
      source,
      hospitalId,
      rating,
      title,
      comment,
      visitMonth
    });

    // Populate user details for direct frontend refresh
    const populated = await Review.findById(review._id).populate('user', 'name avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Review published successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, visitMonth } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Authorization: Must be owner of the review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only edit your own reviews.' });
    }

    review.rating = rating;
    review.title = title;
    review.comment = comment;
    review.visitMonth = visitMonth || null;
    await review.save();

    const populated = await Review.findById(review._id).populate('user', 'name avatarUrl');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const user = req.user;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Authorization: Owner or Admin can delete
    if (review.user.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Unauthorized operation.' });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const reportReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { message } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const report = await Report.create({
      user: req.user._id,
      source: review.source,
      hospitalId: review.hospitalId,
      category: 'inappropriate_review',
      message: `[Review Reported - Title: "${review.title}"] Comments: ${message}`
    });

    res.status(201).json({
      success: true,
      message: 'Review reported successfully. Administrators will review it.',
      data: report
    });
  } catch (error) {
    next(error);
  }
};
