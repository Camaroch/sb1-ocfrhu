import { Order } from '../models/Order.js';
import { Service } from '../models/Service.js';
import { ApiError } from '../utils/ApiError.js';
import { createPaymentIntent, confirmPaymentIntent } from '../services/stripe.service.js';
import { calculateFees } from '../utils/feeCalculator.js';

export const createOrder = async (req, res, next) => {
  try {
    const { serviceId } = req.body;
    const service = await Service.findById(serviceId);
    
    if (!service) {
      throw new ApiError(404, 'Service not found');
    }

    const { price, platformFee, sellerEarnings } = calculateFees(service.pricing.price);

    const order = new Order({
      buyerId: req.user._id,
      sellerId: service.freelanceId,
      serviceId,
      orderDetails: {
        price,
        platformFee,
        sellerEarnings,
        deliveryTime: service.pricing.deliveryTime
      }
    });

    const paymentIntent = await createPaymentIntent(price);

    order.payment.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.status(201).json({
      orderId: order._id,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
};

export const confirmOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    const paymentIntent = await confirmPaymentIntent(order.payment.stripePaymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
      order.status = 'paid';
      await order.save();

      // Update service stats
      await Service.findByIdAndUpdate(order.serviceId, {
        $inc: { 'stats.orders': 1 }
      });

      res.json({ status: 'success', order });
    } else {
      throw new ApiError(400, 'Payment failed');
    }
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('serviceId')
      .populate('buyerId', 'username email')
      .populate('sellerId', 'username email');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Check if user is buyer or seller
    if (order.buyerId._id.toString() !== req.user._id.toString() && 
        order.sellerId._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to view this order');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};