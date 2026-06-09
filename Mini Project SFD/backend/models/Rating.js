const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 500
  },
  // Type of rating: NGO rates donor, or Donor rates volunteer/NGO
  ratingType: {
    type: String,
    enum: ['ngo_to_donor', 'donor_to_ngo', 'donor_to_volunteer'],
    required: true
  },
  // Predefined feedback tags for quick selection
  tags: [{
    type: String,
    enum: [
      'fresh_food', 'good_packaging', 'on_time', 'generous_quantity',
      'accurate_description', 'friendly', 'professional',
      'quick_pickup', 'careful_handling', 'good_communication',
      'reliable', 'punctual', 'well_organized',
      'late_pickup', 'poor_quality', 'incorrect_quantity', 'unresponsive'
    ]
  }]
}, {
  timestamps: true
});

// Prevent multiple ratings from the same user for the same donation
RatingSchema.index({ donationId: 1, fromUser: 1 }, { unique: true });

// Update average rating and trust score after save
RatingSchema.post('save', async function() {
  const User = mongoose.model('User');
  const userId = this.toUser;

  const stats = await this.model('Rating').aggregate([
    { $match: { toUser: userId } },
    {
      $group: {
        _id: '$toUser',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    const avg = Math.round(stats[0].averageRating * 10) / 10;
    const total = stats[0].totalRatings;

    // Trust score: weighted formula considering rating avg and volume
    // Score 0-100: (avg/5)*60 + min(total/20, 1)*40
    const trustScore = Math.round(
      (avg / 5) * 60 + Math.min(total / 20, 1) * 40
    );

    await User.findByIdAndUpdate(userId, {
      averageRating: avg,
      totalRatings: total,
      trustScore: trustScore
    });
  }
});

module.exports = mongoose.model('Rating', RatingSchema);
