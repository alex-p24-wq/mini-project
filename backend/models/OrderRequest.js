import mongoose from 'mongoose';

const orderRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  productType: {
    type: String,
    default: 'Cardamom',
    required: true
  },
  grade: {
    type: String,
    required: true,
    enum: ['A Grade', 'B Grade', 'C Grade', 'Mixed', 'Any']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  budgetMin: {
    type: Number,
    required: true,
    min: 0
  },
  budgetMax: {
    type: Number,
    required: true,
    min: 0
  },
  urgency: {
    type: String,
    required: true,
    enum: ['normal', 'urgent', 'immediate'],
    default: 'normal'
  },
  preferredHub: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  hubResponse: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
orderRequestSchema.index({ customer: 1, status: 1 });
orderRequestSchema.index({ preferredHub: 1, status: 1 });
orderRequestSchema.index({ createdAt: -1 });

const OrderRequest = mongoose.model('OrderRequest', orderRequestSchema);

export default OrderRequest;
