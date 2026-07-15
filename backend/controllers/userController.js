const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'bookings',
    options: { sort: { createdAt: -1 }, limit: 10 },
    populate: { path: 'room', select: 'name images thumbnail' },
  });
  ApiResponse.success({ user }).send(res);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  await user.save();
  ApiResponse.success({ user }, 'Profile updated successfully').send(res);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validated.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  ApiResponse.success(null, 'Password changed successfully. Please login again.').send(res);
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await User.findById(req.user._id)
    .select('bookings')
    .populate({
      path: 'bookings',
      options: { sort: { createdAt: -1 } },
      populate: { path: 'room', select: 'name images thumbnail pricePerNight' },
    });
  ApiResponse.success({ bookings: bookings?.bookings || [] }).send(res);
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getMyBookings,
};
