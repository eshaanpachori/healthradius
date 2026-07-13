import mongoose from 'mongoose';

const hospitalProfileSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      enum: ['demo', 'google']
    },
    externalId: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    ownershipType: {
      type: String,
      enum: ['government', 'private', 'charitable', 'teaching', 'unknown'],
      default: 'unknown'
    },
    specialties: {
      type: [String],
      default: []
    },
    facilities: {
      type: [String],
      default: []
    },
    emergencyAvailable: {
      type: Boolean,
      default: false
    },
    ambulanceNumber: {
      type: String,
      default: ''
    },
    insuranceAccepted: {
      type: [String],
      default: []
    },
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    lastInformationReviewAt: {
      type: Date,
      default: null
    },
    dataNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index on source and externalId
hospitalProfileSchema.index({ source: 1, externalId: 1 }, { unique: true });

export const HospitalProfile = mongoose.model('HospitalProfile', hospitalProfileSchema);
