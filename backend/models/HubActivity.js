import mongoose from 'mongoose';

const HubActivitySchema = new mongoose.Schema({
  type: { type: String, enum: ['sold'], required: true },
  state: { type: String, trim: true, required: true },
  district: { type: String, trim: true, required: true },
  nearestHub: { type: String, trim: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  quantity: { type: Number },
  amount: { type: Number },
  // Hub arrival confirmation fields
  hubArrivalConfirmed: { type: Boolean, default: false },
  hubArrivalOTP: { type: String },
  hubArrivalOTPExpiry: { type: Date },
  hubArrivalConfirmedAt: { type: Date },
  hubArrivalConfirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerNotified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

HubActivitySchema.index({ type: 1, state: 1, district: 1, createdAt: -1 });
HubActivitySchema.index({ product: 1 });

const HubActivity = mongoose.model('HubActivity', HubActivitySchema);
export default HubActivity;
