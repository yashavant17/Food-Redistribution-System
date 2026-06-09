const express = require('express');
const router = express.Router();
const { getStats, getUsers, updateUser, deleteUser, getAllDonations, approveNgo, getDeliveries } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All admin routes require auth + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getStats);
router.get('/donations', getAllDonations);
router.put('/approve-ngo/:id', approveNgo);
router.get('/tracking/deliveries', getDeliveries);

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
