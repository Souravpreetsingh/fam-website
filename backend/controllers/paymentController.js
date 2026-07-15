const paymentService = require('../services/paymentService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const emailService = require('../services/emailService');
const Booking = require('../models/Booking');

const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const result = await paymentService.createOrder(bookingId, req.user._id);
  ApiResponse.success(result, 'Order created successfully').send(res);
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { payment, booking } = await paymentService.verifyPayment(req.body);
  const populatedBooking = await Booking.findById(booking._id)
    .populate('room')
    .populate('user', 'name email');
  await emailService.sendBookingConfirmation(populatedBooking, populatedBooking.user, populatedBooking.room);
  ApiResponse.success({ payment, booking: populatedBooking }, 'Payment verified successfully').send(res);
});

const getPaymentDetails = asyncHandler(async (req, res) => {
  const Payment = require('../models/Payment');
  const payment = await Payment.findById(req.params.id)
    .populate('booking')
    .populate('user', 'name email');
  if (!payment) {
    return ApiResponse.success(null, 'Payment not found').send(res);
  }
  if (
    payment.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return ApiResponse.success(null, 'Not authorized').send(res);
  }
  ApiResponse.success({ payment }).send(res);
});

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentDetails,
};
