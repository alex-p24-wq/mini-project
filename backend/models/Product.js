import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
  type: { type: String, trim: true, maxlength: 100 },
  price: { 
    type: Number, 
    required: true, 
    min: [0.01, 'Price must be greater than 0'],
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Price must be a positive number greater than 0'
    }
  },
  stock: { 
    type: Number, 
    required: true, 
    min: [1, 'Stock must be at least 1 kg'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v >= 1;
      },
      message: 'Stock must be at least 1 kg or more'
    }
  },
  grade: { type: String, enum: ['Premium', 'Organic', 'Regular'], required: true },
  image: { type: String, trim: true },
  state: { type: String, trim: true, maxlength: 100 },
  district: { type: String, trim: true, maxlength: 100 },
  nearestHub: { type: String, trim: true, maxlength: 200 },
  hubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' }, // Reference to the hub for bulk products
  description: { type: String, trim: true, maxlength: 500 },
  // Bulk product approval workflow
  bulkProductStatus: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: function() {
      return this.type === 'Bulk' ? 'pending' : undefined;
    }
  },
  hubReviewedAt: { type: Date },
  hubReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String, trim: true, maxlength: 500 },
  // Advance payment for booking
  advancePayment: {
    required: { type: Boolean, default: false },
    amount: { type: Number, min: 0 },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paidAt: { type: Date },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transactionId: { type: String, trim: true },
    paymentMethod: { type: String, trim: true }
  },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);
export default Product;