import express from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { notifyPaymentReceived } from '../utils/notifications.js';

const router = express.Router();

// Note: Razorpay will be imported dynamically to handle potential missing dependency
let Razorpay;
try {
  const razorpayModule = await import('razorpay');
  Razorpay = razorpayModule.default;
} catch (error) {
  console.warn('Razorpay not installed. Payment features will be limited.');
}

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  if (!Razorpay) {
    throw new Error('Razorpay SDK not available');
  }
  
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Create Razorpay order
router.post('/create-order', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    
    // Find the order
    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }
    
    const razorpay = getRazorpayInstance();
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.amount * 100), // Convert to paise
      currency: order.currency || 'INR',
      receipt: `order_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        customerId: req.user._id.toString(),
      },
    });
    
    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
    
    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
    
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create payment order' 
    });
  }
});

// Verify payment
router.post('/verify-payment', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ message: 'Missing payment verification data' });
    }
    
    // Find the order
    const order = await Order.findOne({ 
      _id: orderId, 
      customer: req.user._id,
      razorpayOrderId: razorpay_order_id 
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
    
    // Update order with payment details
    order.paymentStatus = 'Paid';
    order.paymentMethod = 'ONLINE';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.status = 'Processing'; // Move to processing after successful payment
    
    // Add tracking entry
    order.tracking = order.tracking || [];
    order.tracking.push({
      status: 'Processing',
      message: 'Payment received successfully',
      timestamp: new Date()
    });
    
    await order.save();
    
    // Send payment success notification to farmers
    try {
      // Get all products in the order and notify their farmers
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const customer = await User.findById(order.customer);
          await notifyPaymentReceived(product.user, {
            orderId: order._id,
            orderIdShort: order._id.toString().slice(-6).toUpperCase(),
            productId: product._id,
            customerId: order.customer,
            amount: item.price * item.quantity,
            quantity: item.quantity,
            productName: item.name,
            customerName: customer?.username || 'Customer'
          });
        }
      }
    } catch (notificationError) {
      console.error('Error sending payment notification to farmers:', notificationError);
      // Don't fail the payment verification if notification fails
    }
    
    res.json({ 
      message: 'Payment verified successfully',
      order: {
        _id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        amount: order.amount
      }
    });
    
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ 
      message: error.message || 'Payment verification failed' 
    });
  }
});

// Handle payment failure
router.post('/payment-failed', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const { orderId, error } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    
    // Find the order
    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status
    order.paymentStatus = 'Failed';
    order.status = 'Pending'; // Keep as pending for retry
    
    // Add tracking entry
    order.tracking = order.tracking || [];
    order.tracking.push({
      status: 'Payment Failed',
      message: error?.description || 'Payment failed',
      timestamp: new Date()
    });
    
    await order.save();
    
    res.json({ 
      message: 'Payment failure recorded',
      order: {
        _id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus
      }
    });
    
  } catch (error) {
    console.error('Payment failure handler error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to handle payment failure' 
    });
  }
});

// Get payment status
router.get('/status/:orderId', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId
    });
    
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to get payment status' 
    });
  }
});

export default router;
