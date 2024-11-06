import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    serviceAsDescribed: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    deliveryTime: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  response: {
    comment: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    createdAt: Date
  },
  status: {
    type: String,
    enum: ['active', 'reported', 'hidden'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Calculate average rating before saving
reviewSchema.pre('save', function(next) {
  const ratings = [
    this.rating.overall,
    this.rating.communication,
    this.rating.serviceAsDescribed,
    this.rating.deliveryTime
  ];
  this.rating.overall = ratings.reduce((a, b) => a + b) / ratings.length;
  next();
});

// Update service stats after review is saved
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Service = mongoose.model('Service');

  const stats = await Review.aggregate([
    { $match: { serviceId: this.serviceId, status: 'active' } },
    {
      $group: {
        _id: '$serviceId',
        averageRating: { $avg: '$rating.overall' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Service.findByIdAndUpdate(this.serviceId, {
      'stats.averageRating': stats[0].averageRating
    });
  }
});

export const Review = mongoose.model('Review', reviewSchema);