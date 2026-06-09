const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('donation', 'foodName status')
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: false
    });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update location continuously (NGO/Volunteer tracking)
// @route   POST /api/tracking/location-update
// @access  Private (NGO/Volunteer)
const updateLocation = async (req, res, next) => {
  try {
    const { coordinates } = req.body;
    
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    // Update user's current location globally
    user.location = { type: 'Point', coordinates };
    await user.save();

    // Also update all active donations they are delivering!
    const Donation = require('../models/Donation');
    await Donation.updateMany(
      { acceptedBy: req.user.id, status: { $in: ['accepted', 'picked'] } },
      { ngoLocation: { type: 'Point', coordinates } }
    );

    res.status(200).json({ success: true, message: 'Location synced' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, updateLocation };
