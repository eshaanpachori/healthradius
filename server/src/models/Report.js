import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // guest or user reported
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
    category: {
      type: String,
      enum: [
        'incorrect_phone',
        'incorrect_address',
        'incorrect_hours',
        'closed',
        'inappropriate_review',
        'other'
      ],
      required: true
    },
    message: {
      type: String,
      required: [true, 'Message description is required'],
      maxlength: 1000,
      trim: true
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'rejected'],
      default: 'open'
    },
    adminNote: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Report = mongoose.model('Report', reportSchema);
