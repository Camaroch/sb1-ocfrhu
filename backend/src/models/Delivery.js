import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  files: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  revisionRequest: {
    message: String,
    requestedAt: Date
  },
  acceptedAt: Date,
  expectedDeliveryDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

export const Delivery = mongoose.model('Delivery', deliverySchema);