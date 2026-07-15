const User = require('../models/User');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Contact = require('../models/Contact');
const Review = require('../models/Review');
const Newsletter = require('../models/Newsletter');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginationResponse } = require('../utils/pagination');

const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBookings,
    totalRooms,
    totalRevenue,
    pendingBookings,
    confirmedBookings,
    cancelledBookings,
    unreadContacts,
    pendingReviews,
    activeSubscribers,
  ] = await Promise.all([
    User.countDocuments(),
    Booking.countDocuments(),
    Room.countDocuments(),
    Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.countDocuments({ status: 'cancelled' }),
    Contact.countDocuments({ isRead: false }),
    Review.countDocuments({ isApproved: false }),
    Newsletter.countDocuments({ isActive: true }),
  ]);

  const recentBookings = await Booking.find()
    .populate('user', 'name email')
    .populate('room', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  const revenueByMonth = await Booking.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$totalAmount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  const bookingStats = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  ApiResponse.success({
    stats: {
      totalUsers,
      totalBookings,
      totalRooms,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      unreadContacts,
      pendingReviews,
      activeSubscribers,
    },
    recentBookings,
    revenueByMonth,
    bookingStats,
  }).send(res);
});

const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  ApiResponse.success({
    users,
    pagination: paginationResponse(total, page, limit),
  }).send(res);
});

const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate({
    path: 'bookings',
    options: { sort: { createdAt: -1 } },
    populate: { path: 'room', select: 'name' },
  });
  if (!user) {
    return ApiResponse.success(null, 'User not found').send(res);
  }
  ApiResponse.success({ user }).send(res);
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['guest', 'admin'].includes(role)) {
    return ApiResponse.success(null, 'Invalid role').send(res);
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) {
    return ApiResponse.success(null, 'User not found').send(res);
  }
  ApiResponse.success({ user }, 'User role updated').send(res);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return ApiResponse.success(null, 'User not found').send(res);
  }
  if (user.role === 'admin') {
    return ApiResponse.success(null, 'Cannot delete admin users').send(res);
  }
  await Booking.updateMany({ user: user._id }, { status: 'cancelled' });
  await User.findByIdAndDelete(req.params.id);
  ApiResponse.success(null, 'User deleted successfully').send(res);
});

const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = { paymentStatus: 'paid' };

  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }

  const [totalRevenue, revenueByRoom, revenueByMonth, bookingCounts] = await Promise.all([
    Booking.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$room',
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'rooms',
          localField: '_id',
          foreignField: '_id',
          as: 'room',
        },
      },
      { $unwind: '$room' },
      { $project: { 'room.name': 1, revenue: 1, bookings: 1 } },
    ]),
    Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]),
    Booking.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]),
  ]);

  ApiResponse.success({
    totalRevenue: totalRevenue[0]?.total || 0,
    totalPaidBookings: totalRevenue[0]?.count || 0,
    revenueByRoom,
    revenueByMonth,
    totalBookings: bookingCounts[0]?.total || 0,
  }).send(res);
});

module.exports = {
  getDashboard,
  getUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  getRevenueAnalytics,
};
