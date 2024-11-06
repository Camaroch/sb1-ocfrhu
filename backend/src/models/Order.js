import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
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
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  orderDetails: {
    price: {
      type: Number,
      required: true
    },
    platformFee: {
      type: Number,
      required: true
    },
    sellerEarnings: {
      type: Number,
      required: true
    },
    deliveryTime: {
      type: Number,
      required: true
    }
  },
  payment: {
    stripePaymentIntentId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'in_progress', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});