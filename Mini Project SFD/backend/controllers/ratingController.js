const Rating = require('../models/Rating');
const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Submit a rating and feedback
// @route   POST /api/ratings
// @access  Private
const submitRating = async (req, res, next) => {
  try {
    const { donationId, toUser, rating, feedback, tags } = req.body;

    // Check if donation is completed
    const donation = await Donation.findById(donationId)
      .populate('donor', 'name role')
      .populate('acceptedBy', 'name role');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    if (donation.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Can only rate completed deliveries' });
    }

    // Determine the rating type and validate authorization
    const isDonor = donation.donor && donation.donor._id.toString() === req.user.id;
    const isNgo = donation.acceptedBy && donation.acceptedBy._id.toString() === req.user.id;

    if (!isDonor && !isNgo) {
      return res.status(403).json({ success: false, message: 'Not authorized to rate this transaction' });
    }

    // Determine rating type based on who is rating whom
    let ratingType;
    if (isNgo && donation.donor && toUser === donation.donor._id.toString()) {
      // NGO rating the donor
      ratingType = 'ngo_to_donor';
    } else if (isDonor && donation.acceptedBy && toUser === donation.acceptedBy._id.toString()) {
      // Donor rating the NGO/volunteer
      const ratedUser = await User.findById(toUser);
      ratingType = ratedUser?.role === 'volunteer' ? 'donor_to_volunteer' : 'donor_to_ngo';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid rating target' });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({ donationId, fromUser: req.user.id });
    if (existingRating) {
      return res.status(400).json({ success: false, message: 'You have already rated this transaction' });
    }

    const newRating = await Rating.create({
      donationId,
      fromUser: req.user.id,
      toUser,
      rating,
      feedback,
      ratingType,
      tags: tags || []
    });

    // Populate the rating before returning
    const populatedRating = await Rating.findById(newRating._id)
      .populate('fromUser', 'name role')
      .populate('toUser', 'name role averageRating trustScore');

    res.status(201).json({ success: true, data: populatedRating });
  } catch (error) {
    console.error('🚨 submitRating error:', error.message, error.stack, 'body:', req.body, 'user:', req.user.id);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already rated this transaction' });
    }
    next(error);
  }
};

// @desc    Get ratings for a specific user
// @route   GET /api/ratings/user/:userId
// @access  Private
const getUserRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ toUser: req.params.userId })
      .populate('fromUser', 'name role organization')
      .populate('donationId', 'foodName')
      .sort({ createdAt: -1 });

    // Calculate breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => { breakdown[r.rating]++; });

    // Get user's trust info
    const user = await User.findById(req.params.userId)
      .select('name role averageRating totalRatings trustScore');

    res.status(200).json({
      success: true,
      data: {
        ratings,
        summary: {
          averageRating: user?.averageRating || 0,
          totalRatings: user?.totalRatings || 0,
          trustScore: user?.trustScore || 0,
          breakdown
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending ratings for current user (delivered donations not yet rated)
// @route   GET /api/ratings/pending
// @access  Private
const getPendingRatings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find delivered donations involving this user
    let query = { status: 'delivered' };

    if (userRole === 'donor' || userRole === 'restaurant') {
      query.donor = userId;
    } else if (userRole === 'ngo' || userRole === 'volunteer') {
      query.acceptedBy = userId;
    } else {
      return res.status(200).json({ success: true, data: [] });
    }

    const deliveredDonations = await Donation.find(query)
      .populate('donor', 'name role organization averageRating trustScore')
      .populate('acceptedBy', 'name role organization averageRating trustScore')
      .sort({ completedAt: -1 });

    const deliveriesWithTargets = deliveredDonations.filter(d => {
      if (userRole === 'donor' || userRole === 'restaurant') {
        return !!d.acceptedBy;
      }
      return !!d.donor;
    });

    // Find which of these the user has already rated
    const alreadyRated = await Rating.find({
      fromUser: userId,
      donationId: { $in: deliveriesWithTargets.map(d => d._id) }
    }).select('donationId');

    const ratedDonationIds = new Set(alreadyRated.map(r => r.donationId.toString()));

    // Filter to only unrated donations
    const pending = deliveriesWithTargets
      .filter(d => !ratedDonationIds.has(d._id.toString()))
      .map(d => {
        const rateTarget = (userRole === 'donor' || userRole === 'restaurant')
          ? { _id: d.acceptedBy?._id, name: d.acceptedBy?.name, role: d.acceptedBy?.role }
          : { _id: d.donor?._id, name: d.donor?.name, role: d.donor?.role };

        return {
          donation: d,
          rateTarget
        };
      })
      .filter(item => item.rateTarget && item.rateTarget._id);

    res.status(200).json({ success: true, data: pending });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trust score / reputation for a user
// @route   GET /api/ratings/trust/:userId
// @access  Private
const getTrustScore = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name role averageRating totalRatings trustScore organization');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get recent ratings for context
    const recentRatings = await Rating.find({ toUser: req.params.userId })
      .populate('fromUser', 'name role')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate tag frequency
    const allRatings = await Rating.find({ toUser: req.params.userId }).select('tags');
    const tagCounts = {};
    allRatings.forEach(r => {
      (r.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort tags by frequency
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    // Trust level label
    let trustLevel = 'New';
    if (user.trustScore >= 80) trustLevel = 'Highly Trusted';
    else if (user.trustScore >= 60) trustLevel = 'Trusted';
    else if (user.trustScore >= 40) trustLevel = 'Building Trust';
    else if (user.trustScore >= 20) trustLevel = 'Getting Started';

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          role: user.role,
          organization: user.organization,
          averageRating: user.averageRating,
          totalRatings: user.totalRatings,
          trustScore: user.trustScore,
          trustLevel
        },
        topTags,
        recentRatings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if current user already rated a specific donation
// @route   GET /api/ratings/check/:donationId
// @access  Private
const checkRating = async (req, res, next) => {
  try {
    const existing = await Rating.findOne({
      donationId: req.params.donationId,
      fromUser: req.user.id
    });

    res.status(200).json({
      success: true,
      data: {
        hasRated: !!existing,
        rating: existing || null
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitRating, getUserRatings, getPendingRatings, getTrustScore, checkRating };
