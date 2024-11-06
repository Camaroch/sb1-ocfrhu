import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';

export const createReview = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { rating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Verify buyer ownership and order completion
    if (order.buyerId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized');
    }
    if (order.status !== 'completed') {
      throw new ApiError(400, 'Can only review completed orders');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      throw new ApiError(400, 'Review already exists for this order');
    }

    const review = new Review({
      orderId,
      serviceId: order.serviceId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      rating,
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

export const getServiceReviews = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ 
      serviceId,
      status: 'active'
    })
      .populate('buyerId', 'username profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ 
      serviceId,
      status: 'active'
    });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    next(error);
  }
};

export const respondToReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Verify seller ownership
    if (review.sellerId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized');
    }

    // Check if response already exists
    if (review.response.comment) {
      throw new ApiError(400, 'Response already exists');
    }

    review.response = {
      comment,
      createdAt: new Date()
    };

    await review.save();
    res.json(review);
  } catch (error) {
    next(error);
  }
};

export const reportReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Only allow seller to report reviews
    if (review.sellerId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized');
    }

    review.status = 'reported';
    await review.save();

    // Create report in moderation system
    // This will be implemented in the moderation system
    
    res.json({ message: 'Review reported successfully' });
  } catch (error) {
    next(error);
  }
};