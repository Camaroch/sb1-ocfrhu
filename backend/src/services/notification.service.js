import { User } from '../models/User.js';
import { sendEmail } from './email.service.js';

export const sendDeliveryNotification = async (userId, orderId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Send email notification
    await sendEmail({
      to: user.email,
      subject: 'Your order has been delivered!',
      text: `Your order #${orderId} has been delivered. Please review and accept the delivery.`,
      html: `
        <h2>Order Delivery Notification</h2>
        <p>Your order #${orderId} has been delivered.</p>
        <p>Please review and accept the delivery in your dashboard.</p>
      `
    });

    // In a real application, you might also want to:
    // 1. Create an in-app notification
    // 2. Send a push notification
    // 3. Send a webhook if configured
  } catch (error) {
    console.error('Failed to send delivery notification:', error);
  }
};