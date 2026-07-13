import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to prevent duplicate favorites
favoriteSchema.index({ user: 1, source: 1, hospitalId: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', favoriteSchema);
