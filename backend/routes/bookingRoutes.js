const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
} = require('../validations/bookingValidation');

router.post('/', authenticate, validate(createBookingSchema), bookingController.createBooking);
router.get('/my', authenticate, bookingController.getUserBookings);
router.get('/:id', authenticate, bookingController.getBooking);
router.put('/:id', authenticate, bookingController.updateBooking);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

module.exports = router;
