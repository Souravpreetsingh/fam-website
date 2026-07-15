const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const emailService = require('../services/emailService');
const { paginate, paginationResponse } = require('../utils/pagination');

const createBooking = asyncHandler(async (req, res) => {
  const { room: roomId, checkIn, checkOut, guests, specialRequests } = req.validated.body;

  const room = await Room.findById(roomId);
  if (!room) {
    throw ApiError.notFound('Room not found');
  }
  if (!room.isAvailable) {
    throw ApiError.badRequest('Room is not available');
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    throw ApiError.badRequest('Check-out must be after check-in');
  }

  if (guests.adults > room.capacity.maxGuests) {
    throw ApiError.badRequest(
      `Maximum ${room.capacity.maxGuests} guests allowed for this room`
    );
  }

  const isBooked = room.bookedDates.some((bd) => {
    const bdDate = new Date(bd.date);
    return bdDate >= checkInDate && bdDate < checkOutDate && bd.count >= room.totalRooms;
  });

  if (isBooked) {
    throw ApiError.conflict('Room is not available for the selected dates');
  }

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const pricePerNight = room.discountPrice || room.pricePerNight;
  const totalAmount = pricePerNight * nights;

  const booking = await Booking.create({
    user: req.user._id,
    room: roomId,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests,
    totalAmount,
    nights,
    specialRequests,
    status: 'pending',
    paymentStatus: 'pending',
  });

  const dateArray = [];
  let currentDate = new Date(checkInDate);
  while (currentDate < checkOutDate) {
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  for (const date of dateArray) {
    const existingDate = room.bookedDates.find(
      (bd) => bd.date.toDateString() === date.toDateString()
    );
    if (existingDate) {
      existingDate.count += 1;
    } else {
      room.bookedDates.push({ date, count: 1 });
    }
  }
  await room.save();

  await User.findByIdAndUpdate(req.user._id, {
    $push: { bookings: booking._id },
  });

  const populated = await Booking.findById(booking._id).populate('room').populate('user', 'name email phone');

  ApiResponse.created({ booking: populated }, 'Booking created successfully').send(res);
});

const getUserBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const filter = { user: req.user._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('room', 'name images thumbnail slug pricePerNight')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  ApiResponse.success({
    bookings,
    pagination: paginationResponse(total, page, limit),
  }).send(res);
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('room')
    .populate('user', 'name email phone')
    .populate('payment');

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }
  if (
    booking.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to view this booking');
  }

  ApiResponse.success({ booking }).send(res);
});

const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }
  if (booking.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this booking');
  }
  if (['cancelled', 'completed', 'refunded'].includes(booking.status)) {
    throw ApiError.badRequest('Cannot update a cancelled or completed booking');
  }

  const { checkIn, checkOut, guests, specialRequests } = req.body;

  if (checkIn) booking.checkIn = new Date(checkIn);
  if (checkOut) booking.checkOut = new Date(checkOut);
  if (guests) {
    if (guests.adults) booking.guests.adults = guests.adults;
    if (guests.children !== undefined) booking.guests.children = guests.children;
  }
  if (specialRequests !== undefined) booking.specialRequests = specialRequests;

  const nights = Math.ceil(
    (booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24)
  );
  if (nights > 0) {
    booking.nights = nights;
    const room = await Room.findById(booking.room);
    if (room) {
      const pricePerNight = room.discountPrice || room.pricePerNight;
      booking.totalAmount = pricePerNight * nights;
    }
  }

  await booking.save();
  const populated = await Booking.findById(booking._id).populate('room');
  ApiResponse.success({ booking: populated }, 'Booking updated successfully').send(res);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('room');
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }
  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to cancel this booking');
  }
  if (['cancelled', 'completed', 'refunded'].includes(booking.status)) {
    throw ApiError.badRequest('Booking is already cancelled or completed');
  }

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || '';
  booking.cancelledAt = new Date();
  await booking.save();

  const dateArray = [];
  let currentDate = new Date(booking.checkIn);
  while (currentDate < booking.checkOut) {
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const room = await Room.findById(booking.room);
  if (room) {
    for (const date of dateArray) {
      const existingDate = room.bookedDates.find(
        (bd) => bd.date.toDateString() === date.toDateString()
      );
      if (existingDate) {
        existingDate.count = Math.max(0, existingDate.count - 1);
      }
    }
    room.bookedDates = room.bookedDates.filter((bd) => bd.count > 0);
    await room.save();
  }

  ApiResponse.success({ booking }, 'Booking cancelled successfully').send(res);
});

const getAllBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.roomId) filter.room = req.query.roomId;
  if (req.query.userId) filter.user = req.query.userId;
  if (req.query.fromDate) filter.checkIn = { $gte: new Date(req.query.fromDate) };
  if (req.query.toDate) {
    filter.checkOut = { ...filter.checkOut, $lte: new Date(req.query.toDate) };
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('room', 'name images thumbnail slug')
      .populate('payment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  ApiResponse.success({
    bookings,
    pagination: paginationResponse(total, page, limit),
  }).send(res);
});

module.exports = {
  createBooking,
  getUserBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getAllBookings,
};
