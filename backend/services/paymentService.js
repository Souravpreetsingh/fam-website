const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');

class PaymentService {
  async createOrder(bookingId, userId) {
    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }
    if (booking.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('Not authorized for this booking');
    }
    if (booking.paymentStatus === 'paid') {
      throw ApiError.badRequest('Booking is already paid');
    }

    const amountInPaise = Math.round(booking.totalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: booking.currency || 'INR',
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        userId: userId.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      booking: booking._id,
      user: userId,
      razorpayOrderId: order.id,
      amount: booking.totalAmount,
      currency: booking.currency || 'INR',
      status: 'created',
      metadata: {
        bookingRef: booking._id.toString(),
      },
    });

    booking.payment = payment._id;
    await booking.save();

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      notes: order.notes,
      prefill: {
        contact: '',
        email: '',
      },
    };
  }

  async verifyPayment(payload) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw ApiError.badRequest('Invalid payment signature');
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      throw ApiError.notFound('Payment not found');
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'paid';
    await payment.save();

    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.amountPaid = payment.amount;
      booking.status = 'confirmed';
      await booking.save();
    }

    return { payment, booking };
  }

  async processRefund(bookingId, amount = null) {
    const booking = await Booking.findById(bookingId).populate('payment');
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }
    if (booking.paymentStatus !== 'paid') {
      throw ApiError.badRequest('Payment not completed for this booking');
    }

    const payment = await Payment.findById(booking.payment);
    if (!payment || !payment.razorpayPaymentId) {
      throw ApiError.notFound('Payment record not found');
    }

    const refundAmount = amount || payment.amount;
    const refundAmountPaise = Math.round(refundAmount * 100);

    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: refundAmountPaise,
      notes: {
        bookingId: booking._id.toString(),
        reason: 'Booking cancelled',
      },
    });

    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundAmount = refundAmount;
    await payment.save();

    booking.paymentStatus = 'refunded';
    booking.status = 'refunded';
    await booking.save();

    return { refund, payment, booking };
  }
}

module.exports = new PaymentService();
