const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('./notificationController');
const { paginate, paginationResponse } = require('../utils/pagination');

function generateDateArray(checkIn, checkOut) {
  const dates = [];
  const current = new Date(checkIn);
  while (current < checkOut) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

async function blockRoomDates(roomId, checkIn, checkOut, bookingId) {
  const room = await Room.findById(roomId);
  if (!room) return;
  const dates = generateDateArray(checkIn, checkOut);
  for (const date of dates) {
    const existing = room.bookedDates.find(
      (bd) => bd.date.toDateString() === date.toDateString()
    );
    if (existing) {
      existing.count += 1;
    } else {
      room.bookedDates.push({ date, count: 1, bookingId });
    }
  }
  room.isAvailable = false;
  if (room.status === 'available') room.status = 'booked';
  await room.save();
}

async function unblockRoomDates(roomId, checkIn, checkOut) {
  const room = await Room.findById(roomId);
  if (!room) return;
  const dates = generateDateArray(checkIn, checkOut);
  for (const date of dates) {
    const existing = room.bookedDates.find(
      (bd) => bd.date.toDateString() === date.toDateString()
    );
    if (existing) {
      existing.count = Math.max(0, existing.count - 1);
    }
  }
  room.bookedDates = room.bookedDates.filter((bd) => bd.count > 0);
  if (room.bookedDates.length === 0) {
    room.isAvailable = true;
    if (room.status === 'booked') room.status = 'available';
  }
  await room.save();
}

const createBooking = asyncHandler(async (req, res) => {
  const { room: roomId, checkIn, checkOut, guests, specialRequests } = req.validated?.body || {};

  const room = await Room.findById(roomId);
  if (!room) throw ApiError.notFound('Room not found');
  if (!room.isAvailable) throw ApiError.badRequest('Room is not available');
  if (room.status === 'maintenance' || room.status === 'out_of_service') {
    throw ApiError.badRequest('Room is currently out of service');
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) throw ApiError.badRequest('Check-in cannot be in the past');
  if (checkInDate >= checkOutDate) throw ApiError.badRequest('Check-out must be after check-in');

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  if (nights < room.minStay) throw ApiError.badRequest(`Minimum stay is ${room.minStay} night(s)`);
  if (nights > room.maxStay) throw ApiError.badRequest(`Maximum stay is ${room.maxStay} night(s)`);

  if (guests.adults > room.capacity.maxGuests) {
    throw ApiError.badRequest(`Maximum ${room.capacity.maxGuests} guests allowed`);
  }

  const isBooked = room.bookedDates.some((bd) => {
    const bdDate = new Date(bd.date);
    return bdDate >= checkInDate && bdDate < checkOutDate && bd.count >= room.totalRooms;
  });
  if (isBooked) throw ApiError.conflict('Room is not available for the selected dates');

  if (room.isDateBlockedForMaintenance(checkInDate) || room.isDateBlockedForMaintenance(new Date(checkOutDate.getTime() - 86400000))) {
    throw ApiError.badRequest('Room is under maintenance during selected dates');
  }

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

  await blockRoomDates(roomId, checkInDate, checkOutDate, booking._id);
  await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } });

  await createNotification(
    req.user._id,
    'booking_submitted',
    'Booking Request Submitted',
    `Your booking for ${room.name} has been submitted and is pending confirmation.`,
    `/dashboard/booking/${booking._id}`,
    { bookingId: booking._id, roomName: room.name }
  );

  const populated = await Booking.findById(booking._id)
    .populate('room')
    .populate('user', 'name email phone');

  ApiResponse.created({ booking: populated }, 'Booking created successfully').send(res);
});

const getUserBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('room', 'name images thumbnail slug pricePerNight')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  ApiResponse.success({
    results: bookings,
    pagination: paginationResponse(total, page, limit),
  }).send(res);
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('room')
    .populate('user', 'name email phone')
    .populate('payment');

  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to view this booking');
  }

  ApiResponse.success({ booking }).send(res);
});

const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this booking');
  }
  if (!booking.canModify()) {
    throw ApiError.badRequest('Cannot modify a booking in its current state');
  }

  const room = await Room.findById(booking.room);
  const { checkIn, checkOut, guests, specialRequests } = req.body;

  let newCheckIn = booking.checkIn;
  let newCheckOut = booking.checkOut;

  if (checkIn) newCheckIn = new Date(checkIn);
  if (checkOut) newCheckOut = new Date(checkOut);

  if (newCheckIn >= newCheckOut) throw ApiError.badRequest('Check-out must be after check-in');
  const nights = Math.ceil((newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24));
  if (nights < 1) throw ApiError.badRequest('Minimum 1 night required');

  if (guests?.adults && room && guests.adults > room.capacity.maxGuests) {
    throw ApiError.badRequest(`Maximum ${room.capacity.maxGuests} guests allowed`);
  }

  if (checkIn || checkOut) {
    await unblockRoomDates(booking.room, booking.checkIn, booking.checkOut);
    await blockRoomDates(booking.room, newCheckIn, newCheckOut, booking._id);
    booking.checkIn = newCheckIn;
    booking.checkOut = newCheckOut;
    booking.nights = nights;
    if (room) {
      const ppn = room.discountPrice || room.pricePerNight;
      booking.totalAmount = ppn * nights;
    }
  }

  if (guests) {
    if (guests.adults) booking.guests.adults = guests.adults;
    if (guests.children !== undefined) booking.guests.children = guests.children;
  }
  if (specialRequests !== undefined) booking.specialRequests = specialRequests;

  await booking.save();

  await createNotification(
    req.user._id,
    'booking_modified',
    'Booking Modified',
    `Your booking has been updated successfully.`,
    `/dashboard/booking/${booking._id}`,
    { bookingId: booking._id }
  );

  const populated = await Booking.findById(booking._id).populate('room');
  ApiResponse.success({ booking: populated }, 'Booking updated successfully').send(res);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('room');
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to cancel this booking');
  }
  if (!booking.canCancel() && req.user.role !== 'admin') {
    throw ApiError.badRequest('Booking cannot be cancelled in its current state');
  }

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || '';
  booking.cancelledAt = new Date();
  const historyEntry = booking.statusHistory.find(e => e.status === 'cancelled');
  if (historyEntry) historyEntry.note = booking.cancellationReason || 'Booking cancelled';
  await booking.save();

  await unblockRoomDates(booking.room, booking.checkIn, booking.checkOut);

  await createNotification(
    booking.user._id || req.user._id,
    'booking_cancelled',
    'Booking Cancelled',
    `Your booking has been cancelled.`,
    `/dashboard/booking/${booking._id}`,
    { bookingId: booking._id }
  );

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

const confirmBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('room').populate('user', 'name email');
  if (!booking) throw ApiError.notFound('Booking not found');
  if (!Booking.isValidTransition(booking.status, 'confirmed')) {
    throw ApiError.badRequest(`Cannot confirm a ${booking.status} booking`);
  }

  booking.status = 'confirmed';
  const historyEntry = booking.statusHistory.find(e => e.status === 'confirmed');
  if (historyEntry) historyEntry.changedBy = req.user.email || 'admin';
  await booking.save();

  await createNotification(
    booking.user._id,
    'booking_confirmed',
    'Booking Confirmed',
    `Your booking for ${booking.room?.name || 'the room'} has been confirmed.`,
    `/dashboard/booking/${booking._id}`,
    { bookingId: booking._id, roomName: booking.room?.name }
  );

  ApiResponse.success({ booking }, 'Booking confirmed successfully').send(res);
});

const checkInBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('room');
  if (!booking) throw ApiError.notFound('Booking not found');
  if (!Booking.isValidTransition(booking.status, 'checked_in')) {
    throw ApiError.badRequest(`Cannot check in a ${booking.status} booking`);
  }

  booking.status = 'checked_in';
  const historyEntry = booking.statusHistory.find(e => e.status === 'checked_in');
  if (historyEntry) historyEntry.changedBy = req.user.email || 'admin';
  await booking.save();

  await Room.findByIdAndUpdate(booking.room, { status: 'occupied' });

  ApiResponse.success({ booking }, 'Guest checked in successfully').send(res);
});

const checkOutBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('room');
  if (!booking) throw ApiError.notFound('Booking not found');
  if (!Booking.isValidTransition(booking.status, 'checked_out')) {
    throw ApiError.badRequest(`Cannot check out a ${booking.status} booking`);
  }

  booking.status = 'checked_out';
  const historyEntry = booking.statusHistory.find(e => e.status === 'checked_out');
  if (historyEntry) historyEntry.changedBy = req.user.email || 'admin';
  await booking.save();

  await Room.findByIdAndUpdate(booking.room, { status: 'cleaning' });

  ApiResponse.success({ booking }, 'Guest checked out successfully').send(res);
});

const markNoShow = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (!Booking.isValidTransition(booking.status, 'no_show')) {
    throw ApiError.badRequest(`Cannot mark no-show for a ${booking.status} booking`);
  }

  booking.status = 'no_show';
  const historyEntry = booking.statusHistory.find(e => e.status === 'no_show');
  if (historyEntry) historyEntry.changedBy = req.user.email || 'admin';
  await booking.save();

  ApiResponse.success({ booking }, 'Marked as no-show').send(res);
});

const moveBookingRoom = asyncHandler(async (req, res) => {
  const { newRoomId } = req.body;
  if (!newRoomId) throw ApiError.badRequest('New room ID is required');

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.status !== 'confirmed' && booking.status !== 'pending') {
    throw ApiError.badRequest('Can only move confirmed or pending bookings');
  }

  const newRoom = await Room.findById(newRoomId);
  if (!newRoom) throw ApiError.notFound('New room not found');
  if (!newRoom.isAvailable) throw ApiError.badRequest('New room is not available');

  await unblockRoomDates(booking.room, booking.checkIn, booking.checkOut);

  booking.previousRoom = booking.room;
  booking.room = newRoomId;

  const historyEntry = booking.statusHistory.find(e => e.status === booking.status);
  if (historyEntry) historyEntry.note = `Moved to room: ${newRoom.name}`;

  await booking.save();
  await blockRoomDates(newRoomId, booking.checkIn, booking.checkOut, booking._id);

  const populated = await Booking.findById(booking._id).populate('room');
  ApiResponse.success({ booking: populated }, 'Booking moved to new room').send(res);
});

const getBookingTimeline = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  const timeline = booking.statusHistory.map((entry) => ({
    status: entry.status,
    changedAt: entry.changedAt,
    changedBy: entry.changedBy,
    note: entry.note,
  }));

  ApiResponse.success({ timeline, currentStatus: booking.status }).send(res);
});

const getBookingCalendar = asyncHandler(async (req, res) => {
  const { month, year, roomId } = req.query;
  const m = parseInt(month) || new Date().getMonth();
  const y = parseInt(year) || new Date().getFullYear();

  const startDate = new Date(y, m, 1);
  const endDate = new Date(y, m + 1, 0, 23, 59, 59);

  const filter = {};
  if (roomId) filter.room = roomId;

  const bookings = await Booking.find({
    ...filter,
    checkIn: { $lte: endDate },
    checkOut: { $gte: startDate },
    status: { $in: ['confirmed', 'checked_in', 'checked_out', 'pending'] },
  })
    .populate('room', 'name')
    .populate('user', 'name');

  const calendar = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayBookings = bookings.filter((b) => {
      const ci = new Date(b.checkIn).toISOString().split('T')[0];
      const co = new Date(b.checkOut).toISOString().split('T')[0];
      return dateStr >= ci && dateStr < co;
    });
    calendar.push({ date: dateStr, bookings: dayBookings.map((b) => ({ id: b._id, guest: b.user?.name || 'Guest', room: b.room?.name || 'Room', status: b.status })) });
  }

  ApiResponse.success({ calendar, month: m, year: y }).send(res);
});

module.exports = {
  createBooking,
  getUserBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getAllBookings,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
  markNoShow,
  moveBookingRoom,
  getBookingTimeline,
  getBookingCalendar,
};
