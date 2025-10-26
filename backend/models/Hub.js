import mongoose from "mongoose";

const HubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  district: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 15
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  capacity: {
    type: Number,
    min: 0,
    default: 0 // in kg
  },
  services: [{
    type: String,
    enum: ['Storage', 'Processing', 'Packaging', 'Quality Testing', 'Transportation', 'Export Services']
  }],
  operatingHours: {
    type: String,
    trim: true,
    maxlength: 100
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  hubType: {
    type: String,
    enum: ['Primary Production Hub', 'Regional Hub', 'Export Hub', 'Processing Hub', 'Distribution Hub', 'Collection Hub', 'Metropolitan Hub', 'Technology Hub', 'Port Hub', 'Commercial Hub', 'Border Hub'],
    default: 'Regional Hub'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
HubSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
HubSchema.index({ state: 1, district: 1 });
HubSchema.index({ isActive: 1 });

const Hub = mongoose.model('Hub', HubSchema);
export default Hub;
