import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['order_placed', 'payment_received', 'product_sold', 'order_cancelled', 'stock_low', 'general'], 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  data: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number },
    quantity: { type: Number },
    productName: { type: String },
    customerName: { type: String }
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  icon: { 
    type: String, 
    default: '🔔' 
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, read: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
