const express = require('express');
const router = express.Router();
const {
  submitRating,
  getUserRatings,
  getPendingRatings,
  getTrustScore,
  checkRating
} = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

// Submit a new rating
router.post('/', protect, submitRating);

// Get pending (unrated) deliveries for current user
router.get('/pending', protect, getPendingRatings);

// Check if current user has rated a donation
router.get('/check/:donationId', protect, checkRating);

// Get all ratings for a specific user (with summary & breakdown)
router.get('/user/:userId', protect, getUserRatings);

// Get trust/reputation profile for a user
router.get('/trust/:userId', protect, getTrustScore);

module.exports = router;
