const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getDonation,
  updateDonation,
  acceptDonation,
  updateStatus,
  getNearbyDonations,
  deleteDonation
} = require('../controllers/donationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { upload } = require('../utils/cloudinary');

// Nearby donations route (must be before /:id)
router.get('/nearby', protect, authorize('ngo', 'volunteer'), getNearbyDonations);

router.route('/')
  .get(protect, getDonations)
  .post(protect, authorize('donor', 'restaurant'), upload.single('image'), createDonation);

router.route('/:id')
  .get(protect, getDonation)
  .put(protect, authorize('donor', 'restaurant', 'admin'), upload.single('image'), updateDonation)
  .delete(protect, authorize('donor', 'restaurant', 'admin'), deleteDonation);

router.put('/:id/accept', protect, authorize('ngo', 'volunteer', 'admin'), acceptDonation);
router.put('/:id/status', protect, authorize('ngo', 'volunteer', 'admin'), updateStatus);

module.exports = router;
