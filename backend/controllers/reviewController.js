const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginationResponse } = require('../utils/pagination');

const createReview = asyncHandler(async (req, res) => {
  const { room, booking, rating, title, comment } = req.validated?.body || {};

  const existing = await Review.findOne({ user: req.user._id, room });
  if (existing) {
    throw ApiError.conflict('You have already reviewed this room');
  }

  if (booking) {
    const book = await Booking.findById(booking);
    if (!book || book.user.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Not authorized to review this booking');
    }
    if (book.status !== 'completed') {
      throw ApiError.badRequest('Can only review completed bookings');
    }
  }

  const review = await Review.create({
    user: req.user._id,
    room,
    booking,
    rating,
    title,
    comment,
    isVerified: true,
    isApproved: false,
  });

  const populated = await Review.findById(review._id)
    .populate('user', 'name avatar');

  ApiResponse.created({ review: populated }, 'Review submitted successfully').send(res);
});

const getRoomReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const filter = { room: req.params.roomId, isApproved: true };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  ApiResponse.success({
    reviews,
    pagination: paginationResponse(total, page, limit),
  }).send(res);
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }
  if (review.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this review');
  }

  const { rating, title, comment } = req.validated?.body || {};
  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment) review.comment = comment;
  review.isApproved = false;
  await review.save();

  const populated = await Review.findById(review._id).populate('user', 'name avatar');
  ApiResponse.success({ review: populated }, 'Review updated successfully').send(res);
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }
  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to delete this review');
  }
  await Review.findByIdAndDelete(req.params.id);
  ApiResponse.success(null, 'Review deleted successfully').send(res);
});

const getAllReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const filter = {};

  if (req.query.isApproved !== undefined) {
    filter.isApproved = req.query.isApproved === 'true';
  }
  if (req.query.roomId) filter.room = req.query.roomId;
  if (req.query.rating) filter.rating = parseInt(req.query.rating, 10);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name email avatar')
      .populate('room', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  ApiResponse.success({
    reviews,
    pagination: paginationResponse(total, page, limit),
  }).send(res);
});

const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }
  review.isApproved = !review.isApproved;
  await review.save();
  ApiResponse.success(
    { review },
    `Review ${review.isApproved ? 'approved' : 'unapproved'} successfully`
  ).send(res);
});

module.exports = {
  createReview,
  getRoomReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  approveReview,
};
