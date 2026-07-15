const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const reviewController = require('../controllers/reviewController');
const bookingController = require('../controllers/bookingController');
const roomController = require('../controllers/roomController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.use(authenticate, authorizeAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

router.get('/bookings', bookingController.getAllBookings);
router.put('/bookings/:id/confirm', bookingController.confirmBooking);
router.put('/bookings/:id/check-in', bookingController.checkInBooking);
router.put('/bookings/:id/check-out', bookingController.checkOutBooking);
router.put('/bookings/:id/no-show', bookingController.markNoShow);
router.put('/bookings/:id/move-room', bookingController.moveBookingRoom);
router.get('/bookings/calendar', bookingController.getBookingCalendar);

router.get('/revenue', adminController.getRevenueAnalytics);
router.get('/reports/bookings', adminController.getBookingReports);
router.get('/reports/occupancy', adminController.getOccupancyReport);
router.get('/reports/popular-rooms', adminController.getPopularRooms);
router.get('/reports/trends', adminController.getBookingTrends);

router.get('/reviews', reviewController.getAllReviews);
router.put('/reviews/:id/approve', reviewController.approveReview);

router.put('/rooms/:id/status', roomController.updateRoomStatus);
router.post('/rooms/:id/maintenance', roomController.blockForMaintenance);
router.delete('/rooms/:id/maintenance/:blockId', roomController.removeMaintenanceBlock);

module.exports = router;
