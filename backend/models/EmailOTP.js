import mongoose from "mongoose";

const EmailOTPSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true, lowercase: true, trim: true },
  otpHash: { type: String, required: true },
  verified: { type: Boolean, default: false, index: true },
  // TTL index: document expires at the time in expiresAt
  expiresAt: { type: Date, required: true, expires: 0 },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const EmailOTP = mongoose.model("EmailOTP", EmailOTPSchema);
export default EmailOTP;