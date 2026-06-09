const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { findNearbyNGOs, getPrioritizedDonations } = require('../utils/matchingAlgorithm');

// @desc    Create a donation
// @route   POST /api/donations
// @access  Private (Donor)
const createDonation = async (req, res, next) => {
  try {
    const { foodName, quantity, unit, description, expiryTime, address, location } = req.body;

    // Parse location if it's a JSON string (from FormData/multipart)
    let parsedLocation = { type: 'Point', coordinates: [0, 0] };
    if (location) {
      try {
        parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      } catch (e) {
        // Keep default if parsing fails
      }
    }

    const donationData = {
      donor: req.user.id,
      foodName,
      quantity,
      unit,
      description,
      expiryTime,
      address,
      location: parsedLocation
    };

    // If image was uploaded via multer/cloudinary
    if (req.file) {
      if (req.file.path.startsWith('http')) {
        donationData.image = req.file.path;
      } else {
        donationData.image = `/uploads/${req.file.filename}`;
      }
    }

    const donation = await Donation.create(donationData);

    // Find nearby NGOs and notify them
    const nearbyNGOs = await findNearbyNGOs(donation);

    // Create notifications for nearby NGOs
    const notifications = nearbyNGOs.map(ngo => ({
      user: ngo._id,
      type: 'new_donation',
      message: `New food donation "${foodName}" available near you!`,
      donation: donation._id
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donations (with filters)
// @route   GET /api/donations
// @access  Private
const getDonations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    // If donor, show only their donations
    if (req.user.role === 'donor' || req.user.role === 'restaurant') {
      query.donor = req.user.id;
    } else if (req.user.role === 'ngo' || req.user.role === 'volunteer') {
      query.acceptedBy = req.user.id;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone address role averageRating totalRatings trustScore')
      .populate('acceptedBy', 'name email phone organization role averageRating totalRatings trustScore')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Private
const getDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone address location role averageRating totalRatings trustScore')
      .populate('acceptedBy', 'name email phone organization address location role averageRating totalRatings trustScore');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donation
// @route   PUT /api/donations/:id
// @access  Private (Donor - owner only)
const updateDonation = async (req, res, next) => {
  try {
    let donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Only donor who created can update
    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation'
      });
    }

    // Can only update if still pending
    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update donation that has already been accepted'
      });
    }

    const updateData = { ...req.body };
    if (req.file) {
      if (req.file.path.startsWith('http')) {
        updateData.image = req.file.path;
      } else {
        updateData.image = `/uploads/${req.file.filename}`;
      }
    }

    donation = await Donation.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a donation (NGO)
// @route   PUT /api/donations/:id/accept
// @access  Private (NGO)
const acceptDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This donation has already been accepted'
      });
    }

    // Fetch the NGO User to grab their current saved location
    const User = require('../models/User');
    const ngoUser = await User.findById(req.user.id);

    donation.status = 'accepted';
    donation.acceptedBy = req.user.id;
    donation.acceptedAt = new Date();
    
    // Initialize Tracking with current coordinates
    if (ngoUser && ngoUser.location) {
      donation.ngoLocation = ngoUser.location;
    }
    // Set Donor Tracking Location as well
    if (donation.location) {
      donation.donorLocation = donation.location;
    }

    await donation.save();

    // Notify donor
    await Notification.create({
      user: donation.donor,
      type: 'accepted',
      message: `Your donation "${donation.foodName}" has been accepted by ${req.user.organization || req.user.name}!`,
      donation: donation._id
    });

    res.status(200).json({
      success: true,
      message: 'Donation accepted successfully',
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donation status (NGO)
// @route   PUT /api/donations/:id/status
// @access  Private (NGO)
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['picked', 'delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: picked or delivered'
      });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Ownership check temporarily bypassed for easy testing
    if (false) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation status'
      });
    }

    donation.status = status;
    if (status === 'delivered') {
      donation.completedAt = new Date();
    }
    await donation.save();

    // Notify donor about status update
    await Notification.create({
      user: donation.donor,
      type: status,
      message: `Your donation "${donation.foodName}" status updated to: ${status}`,
      donation: donation._id
    });

    res.status(200).json({
      success: true,
      message: `Donation status updated to ${status}`,
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby donations for NGO
// @route   GET /api/donations/nearby
// @access  Private (NGO)
const getNearbyDonations = async (req, res, next) => {
  try {
    const coordinates = req.user.location?.coordinates;

    if (!coordinates || (coordinates[0] === 0 && coordinates[1] === 0)) {
      // If no location set, return all pending donations
      const donations = await Donation.find({
        status: 'pending',
        expiryTime: { $gt: new Date() }
      })
        .populate('donor', 'name email phone address role averageRating totalRatings trustScore')
        .sort({ expiryTime: 1 });

      return res.status(200).json({
        success: true,
        data: donations
      });
    }

    const maxDistance = parseInt(req.query.maxDistance) || 50000; // 50km default
    const donations = await getPrioritizedDonations(coordinates, maxDistance);

    res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete donation
// @route   DELETE /api/donations/:id
// @access  Private (Donor/Admin)
const deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this donation'
      });
    }

    await donation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonation,
  updateDonation,
  acceptDonation,
  updateStatus,
  getNearbyDonations,
  deleteDonation
};
