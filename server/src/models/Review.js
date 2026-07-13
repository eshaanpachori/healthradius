import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    source: {
      type: String,
      required: true,
      enum: ['demo', 'google']
    },
    hospitalId: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: 100,
      trim: true
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      maxlength: 1000,
      trim: true
    },
    visitMonth: {
      type: String, // format "YYYY-MM" or similar
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'published', 'rejected'],
      default: 'published' // by default reviews can be published, moderated later
    },
    moderationReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index so one user can review a specific hospital only once
reviewSchema.index({ user: 1, source: 1, hospitalId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
