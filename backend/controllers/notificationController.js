const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginationResponse } = require('../utils/pagination');

const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const filter = { user: req.user._id };

  if (req.query.isRead !== undefined) {
    filter.isRead = req.query.isRead === 'true';
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  ApiResponse.success({
    notifications,
    unreadCount,
    pagination: paginationResponse(total, page, limit),
  }).send(res);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }
  if (notification.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized');
  }
  notification.isRead = true;
  await notification.save();
  ApiResponse.success({ notification }).send(res);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );
  ApiResponse.success(null, 'All notifications marked as read').send(res);
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }
  if (notification.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized');
  }
  await Notification.findByIdAndDelete(req.params.id);
  ApiResponse.success(null, 'Notification deleted').send(res);
});

const createNotification = async (userId, type, title, message, link = '', metadata = {}) => {
  try {
    await Notification.create({ user: userId, type, title, message, link, metadata });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
