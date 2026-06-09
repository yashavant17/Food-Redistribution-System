const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, updateLocation } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markAllAsRead);
router.put('/notifications/:id/read', protect, markAsRead);

// Tracking Hook
router.post('/tracking/location-update', protect, updateLocation);

module.exports = router;
