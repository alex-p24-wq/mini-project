// Utility functions for creating different types of notifications

export const createSuccessNotification = (title, message, options = {}) => ({
  type: 'success',
  title,
  message,
  icon: '✅',
  ...options
});

export const createErrorNotification = (title, message, options = {}) => ({
  type: 'error',
  title,
  message,
  icon: '❌',
  ...options
});

export const createWarningNotification = (title, message, options = {}) => ({
  type: 'warning',
  title,
  message,
  icon: '⚠️',
  ...options
});

export const createInfoNotification = (title, message, options = {}) => ({
  type: 'info',
  title,
  message,
  icon: 'ℹ️',
  ...options
});

// Predefined notification templates for common actions
export const notificationTemplates = {
  orderPlaced: (orderId) => createSuccessNotification(
    'Order Placed Successfully!',
    `Your order #${orderId} has been placed and is being processed.`,
    { icon: '🛒' }
  ),
  
  orderShipped: (orderId) => createInfoNotification(
    'Order Shipped',
    `Your order #${orderId} has been shipped and is on its way!`,
    { icon: '📦' }
  ),
  
  productAdded: (productName) => createSuccessNotification(
    'Product Added',
    `${productName} has been successfully added to the marketplace.`,
    { icon: '🌿' }
  ),
  
  profileUpdated: () => createSuccessNotification(
    'Profile Updated',
    'Your profile information has been saved successfully.',
    { icon: '👤' }
  ),
  
  paymentSuccess: (amount, orderId) => createSuccessNotification(
    'Payment Successful',
    `Payment of ₹${amount} has been processed successfully for order #${orderId}.`,
    { icon: '💳', autoRemove: false }
  ),

  paymentFailed: (reason) => createErrorNotification(
    'Payment Failed',
    `Payment could not be processed. ${reason || 'Please try again.'}`,
    { icon: '💳', autoRemove: false }
  ),

  orderConfirmed: (orderId, amount) => createSuccessNotification(
    'Order Confirmed',
    `Your order #${orderId} for ₹${amount} has been confirmed and will be processed soon.`,
    { icon: '✅', autoRemove: false }
  ),

  codOrderPlaced: (orderId, amount) => createSuccessNotification(
    'COD Order Placed',
    `Your cash-on-delivery order #${orderId} for ₹${amount} has been placed successfully.`,
    { icon: '💰', autoRemove: false }
  ),

  paymentCancelled: () => createWarningNotification(
    'Payment Cancelled',
    'Payment was cancelled. Your order is saved and you can retry payment later.',
    { icon: '⏸️', autoRemove: false }
  ),
  
  lowStock: (productName, stock) => createWarningNotification(
    'Low Stock Alert',
    `${productName} is running low (${stock} kg remaining).`,
    { icon: '📉' }
  ),
  
  welcome: (username) => createInfoNotification(
    'Welcome to Cardo!',
    `Hello ${username}! Welcome to your dashboard.`,
    { icon: '🎉' }
  ),
  
  loginSuccess: () => createSuccessNotification(
    'Login Successful',
    'You have been logged in successfully.',
    { icon: '🔐' }
  ),
  
  logoutSuccess: () => createInfoNotification(
    'Logged Out',
    'You have been logged out successfully.',
    { icon: '👋' }
  )
};
