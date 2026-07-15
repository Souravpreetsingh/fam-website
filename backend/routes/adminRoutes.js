const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const reviewController = require('../controllers/reviewController');
const bookingController = require('../controllers/bookingController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.use(authenticate, authorizeAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/bookings', bookingController.getAllBookings);
router.get('/revenue', adminController.getRevenueAnalytics);
router.get('/reviews', reviewController.getAllReviews);
router.put('/reviews/:id/approve', reviewController.approveReview);

module.exports = router;
