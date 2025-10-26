import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['customer', 'farmer', 'agricare', 'hub', 'admin'], required: true },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  category: { type: String, trim: true, default: 'General' },
  createdAt: { type: Date, default: Date.now }
});

FeedbackSchema.index({ subject: 'text', message: 'text', category: 'text' });
FeedbackSchema.index({ role: 1, rating: -1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', FeedbackSchema);
export default Feedback;