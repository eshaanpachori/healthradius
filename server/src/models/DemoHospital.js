import mongoose from 'mongoose';

const demoHospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true
    },
    description: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: null
    },
    email: {
      type: String,
      default: null
    },
    externalRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    externalReviewCount: {
      type: Number,
      default: 0
    },
    openingHours: {
      type: [String],
      default: []
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
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    isDemo: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Create the 2dsphere index for location search
demoHospitalSchema.index({ location: '2dsphere' });

export const DemoHospital = mongoose.model('DemoHospital', demoHospitalSchema);
