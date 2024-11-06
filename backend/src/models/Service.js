import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  freelanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  media: [{
    type: {
      type: String,
      enum: ['image'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  pricing: {
    price: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryTime: {
      type: Number,
      required: true,
      min: 1
    }
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    orders: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    }
  },
  searchMeta: {
    keywords: [String],
    category: String,
    subCategory: String,
    searchScore: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'deleted'],
    default: 'pending'
  }
}, {
  timestamps: true
});

serviceSchema.index({ 'searchMeta.keywords': 'text', title: 'text', description: 'text' });

export const Service = mongoose.model('Service', serviceSchema);