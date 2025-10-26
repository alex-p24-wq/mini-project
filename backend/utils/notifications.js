import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendProductSoldEmail, sendPaymentReceivedEmail } from './emailService.js';

// Create a notification for a user
export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Notification templates for different events
export const notificationTemplates = {
  // When a product is sold to a customer
  productSold: (farmerId, orderData) => ({
    recipient: farmerId,
    type: 'product_sold',
    title: '🎉 Product Sold!',
    message: `Your ${orderData.productName} has been sold to ${orderData.customerName}. Quantity: ${orderData.quantity} kg`,
    data: {
      orderId: orderData.orderId,
      productId: orderData.productId,
      customerId: orderData.customerId,
      amount: orderData.amount,
      quantity: orderData.quantity,
      productName: orderData.productName,
      customerName: orderData.customerName
    },
    priority: 'high',
    icon: '💰'
  }),

  // When payment is received for a product
  paymentReceived: (farmerId, orderData) => ({
    recipient: farmerId,
    type: 'payment_received',
    title: '💳 Payment Received!',
    message: `Payment of ₹${orderData.amount.toLocaleString('en-IN')} received for ${orderData.productName} (Order #${orderData.orderIdShort})`,
    data: {
      orderId: orderData.orderId,
      productId: orderData.productId,
      customerId: orderData.customerId,
      amount: orderData.amount,
      quantity: orderData.quantity,
      productName: orderData.productName,
      customerName: orderData.customerName
    },
    priority: 'high',
    icon: '🎉'
  }),

  // When stock is running low
  stockLow: (farmerId, productData) => ({
    recipient: farmerId,
    type: 'stock_low',
    title: '📉 Low Stock Alert',
    message: `Your ${productData.productName} is running low. Only ${productData.stock} kg remaining.`,
    data: {
      productId: productData.productId,
      productName: productData.productName,
      quantity: productData.stock
    },
    priority: 'medium',
    icon: '⚠️'
  }),

  // When an order is cancelled
  orderCancelled: (farmerId, orderData) => ({
    recipient: farmerId,
    type: 'order_cancelled',
    title: '❌ Order Cancelled',
    message: `Order for ${orderData.productName} has been cancelled by ${orderData.customerName}. Stock has been restored.`,
    data: {
      orderId: orderData.orderId,
      productId: orderData.productId,
      customerId: orderData.customerId,
      quantity: orderData.quantity,
      productName: orderData.productName,
      customerName: orderData.customerName
    },
    priority: 'medium',
    icon: '🔄'
  })
};

// Send notification to farmer when product is sold
export const notifyProductSold = async (farmerId, orderData) => {
  try {
    // Create in-app notification
    const notification = notificationTemplates.productSold(farmerId, orderData);
    const createdNotification = await createNotification(notification);

    // Send email notification
    try {
      const farmer = await User.findById(farmerId).select('email username');
      if (farmer && farmer.email) {
        console.log(`📧 Sending product sold email to farmer: ${farmer.email}`);
        const emailResult = await sendProductSoldEmail(farmer.email, farmer.username, orderData);
        if (emailResult.success) {
          console.log(`✅ Product sold email sent successfully to ${farmer.email}`);
        } else {
          console.error(`❌ Failed to send product sold email to ${farmer.email}:`, emailResult.error);
        }
      } else {
        console.log(`⚠️ Farmer email not found for ID: ${farmerId}`);
      }
    } catch (emailError) {
      console.error('Error sending product sold email:', emailError);
      // Don't throw error - notification should still be created even if email fails
    }

    return createdNotification;
  } catch (error) {
    console.error('Error sending product sold notification:', error);
  }
};

// Send notification to farmer when payment is received
export const notifyPaymentReceived = async (farmerId, orderData) => {
  try {
    // Create in-app notification
    const notification = notificationTemplates.paymentReceived(farmerId, orderData);
    const createdNotification = await createNotification(notification);

    // Send email notification
    try {
      const farmer = await User.findById(farmerId).select('email username');
      if (farmer && farmer.email) {
        console.log(`📧 Sending payment received email to farmer: ${farmer.email}`);
        const emailResult = await sendPaymentReceivedEmail(farmer.email, farmer.username, orderData);
        if (emailResult.success) {
          console.log(`✅ Payment received email sent successfully to ${farmer.email}`);
        } else {
          console.error(`❌ Failed to send payment received email to ${farmer.email}:`, emailResult.error);
        }
      } else {
        console.log(`⚠️ Farmer email not found for ID: ${farmerId}`);
      }
    } catch (emailError) {
      console.error('Error sending payment received email:', emailError);
      // Don't throw error - notification should still be created even if email fails
    }

    return createdNotification;
  } catch (error) {
    console.error('Error sending payment received notification:', error);
  }
};

// Send low stock notification to farmer
export const notifyLowStock = async (farmerId, productData) => {
  try {
    // Only send if stock is below threshold (e.g., 10 kg)
    if (productData.stock <= 10 && productData.stock > 0) {
      const notification = notificationTemplates.stockLow(farmerId, productData);
      return await createNotification(notification);
    }
  } catch (error) {
    console.error('Error sending low stock notification:', error);
  }
};

// Send notification when order is cancelled
export const notifyOrderCancelled = async (farmerId, orderData) => {
  try {
    const notification = notificationTemplates.orderCancelled(farmerId, orderData);
    return await createNotification(notification);
  } catch (error) {
    console.error('Error sending order cancelled notification:', error);
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const skip = (page - 1) * limit;
    
    const filter = { recipient: userId };
    if (unreadOnly) {
      filter.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('data.orderId', 'status')
        .populate('data.productId', 'name')
        .populate('data.customerId', 'username'),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: userId, read: false })
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};
