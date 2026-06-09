const User = require('../models/User');
const Donation = require('../models/Donation');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res, next) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const pendingDonations = await Donation.countDocuments({ status: 'pending' });
    const acceptedDonations = await Donation.countDocuments({ status: 'accepted' });
    const completedDonations = await Donation.countDocuments({ status: 'delivered' });

    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNGOs = await User.countDocuments({ role: 'ngo' });

    // Calculate total food saved (delivered donations)
    const foodSaved = await Donation.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
    ]);

    // Recent donations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentDonations = await Donation.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Donations by status for chart
    const donationsByStatus = [
      { status: 'pending', count: pendingDonations },
      { status: 'accepted', count: acceptedDonations },
      { status: 'picked', count: await Donation.countDocuments({ status: 'picked' }) },
      { status: 'delivered', count: completedDonations }
    ];

    res.status(200).json({
      success: true,
      data: {
        totalDonations,
        pendingDonations,
        acceptedDonations,
        completedDonations,
        totalUsers,
        totalDonors,
        totalNGOs,
        foodSaved: foodSaved[0]?.totalQuantity || 0,
        recentDonations,
        donationsByStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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

// @desc    Update user (admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;
    const updateData = {};

    if (isActive !== undefined) updateData.isActive = isActive;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donations (admin)
// @route   GET /api/admin/donations
// @access  Private (Admin)
const getAllDonations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone')
      .populate('acceptedBy', 'name email organization')
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

// @desc    Approve NGO
// @route   PUT /api/admin/approve-ngo/:id
// @access  Private (Admin)
const approveNgo = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'ngo') {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }
    user.isApproved = true;
    await user.save();
    res.status(200).json({ success: true, message: 'NGO approved', data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tracking deliveries
// @route   GET /api/admin/tracking/deliveries
// @access  Private (Admin)
const getDeliveries = async (req, res, next) => {
  try {
    const deliveries = await Donation.find({ status: { $in: ['accepted', 'picked', 'delivered'] } })
      .populate('donor', 'name')
      .populate('acceptedBy', 'name')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: deliveries });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getUsers, updateUser, deleteUser, getAllDonations, approveNgo, getDeliveries };
