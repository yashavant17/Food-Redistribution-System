const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodName: {
    type: String,
    required: [true, 'Please provide food name'],
    trim: true,
    maxlength: [100, 'Food name cannot be more than 100 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  unit: {
    type: String,
    default: 'servings',
    enum: ['servings', 'kg', 'plates', 'packets', 'boxes', 'liters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  expiryTime: {
    type: Date,
    required: [true, 'Please provide expiry time']
  },
  image: {
    type: String,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Please provide location coordinates']
    }
  },
  address: {
    type: String,
    required: [true, 'Please provide an address']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'picked', 'delivered'],
    default: 'pending'
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  donorLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  ngoLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [] }
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
DonationSchema.index({ location: '2dsphere' });

// Index for efficient status queries
DonationSchema.index({ status: 1 });

// Index for expiry-based sorting
DonationSchema.index({ expiryTime: 1 });

module.exports = mongoose.model('Donation', DonationSchema);
