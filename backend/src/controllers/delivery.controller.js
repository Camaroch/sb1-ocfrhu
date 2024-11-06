import { Delivery } from '../models/Delivery.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadFile, deleteFile } from '../services/storage.service.js';
import { sendDeliveryNotification } from '../services/notification.service.js';

export const createDelivery = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body;
    const files = req.files;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Verify seller ownership
    if (order.sellerId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized');
    }

    // Check if order is in correct status
    if (order.status !== 'in_progress') {
      throw new ApiError(400, 'Order must be in progress to deliver');
    }

    // Upload files
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const uploadResult = await uploadFile(file);
        return {
          name: file.originalname,
          url: uploadResult.url,
          type: file.mimetype,
          size: file.size
        };
      })
    );

    const delivery = new Delivery({
      orderId,
      files: uploadedFiles,
      message,
      expectedDeliveryDate: new Date(
        Date.now() + order.orderDetails.deliveryTime * 24 * 60 * 60 * 1000
      )
    });

    await delivery.save();

    // Update order status
    order.status = 'delivered';
    await order.save();

    // Send notification to buyer
    await sendDeliveryNotification(order.buyerId, orderId);

    res.status(201).json(delivery);
  } catch (error) {
    next(error);
  }
};

export const acceptDelivery = async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const delivery = await Delivery.findById(deliveryId).populate('orderId');

    if (!delivery) {
      throw new ApiError(404, 'Delivery not found');
    }

    // Verify buyer ownership
    if (delivery.orderId.buyerId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized');
    }

    delivery.status = 'accepted';
    delivery.acceptedAt = new Date();
    await delivery.save();

    // Update order status
    const order = delivery.orderId;
    order.status = 'completed';
    await order.save();

    res.json(delivery);
  } catch (error) {
    next(error);
  }
};

export const requestRevision = async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const { message } = req.body;

    const delivery = await Delivery.findById(deliveryId).populate('orderId');

    if (!delivery) {
      throw new ApiError(404, 'Delivery not found');
    }

    // Verify buyer ownership
    if (delivery.orderId.buyerId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized');
    }

    // Check if delivery is in correct status
    if (delivery.status !== 'pending') {
      throw new ApiError(400, 'Cannot request revision for accepted/rejected delivery');
    }

    delivery.status = 'rejected';
    delivery.revisionRequest = {
      message,
      requestedAt: new Date()
    };
    await delivery.save();

    // Update order status back to in_progress
    const order = delivery.orderId;
    order.status = 'in_progress';
    await order.save();

    res.json(delivery);
  } catch (error) {
    next(error);
  }
};

export const getDelivery = async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const delivery = await Delivery.findById(deliveryId).populate('orderId');

    if (!delivery) {
      throw new ApiError(404, 'Delivery not found');
    }

    // Verify user authorization
    const order = delivery.orderId;
    if (order.buyerId.toString() !== req.user._id.toString() &&
        order.sellerId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized');
    }

    res.json(delivery);
  } catch (error) {
    next(error);
  }
};