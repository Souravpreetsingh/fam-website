const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const emailService = require('../services/emailService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.validated?.body || {};
  const contact = await Contact.create({ name, email, phone, subject, message });
  await emailService.sendContactAutoReply(contact);
  ApiResponse.created(null, 'Thank you for your message. We will get back to you soon.').send(res);
});

const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.validated?.body || {};
  const existing = await Newsletter.findOne({ email });
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      existing.subscribedAt = new Date();
      existing.unsubscribedAt = undefined;
      await existing.save();
      return ApiResponse.success(null, 'You have been resubscribed to the newsletter.').send(res);
    }
    return ApiResponse.success(null, 'You are already subscribed to the newsletter.').send(res);
  }
  await Newsletter.create({ email });
  ApiResponse.created(null, 'Successfully subscribed to the newsletter.').send(res);
});

const unsubscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    throw ApiError.badRequest('Email is required');
  }
  const subscription = await Newsletter.findOne({ email });
  if (!subscription) {
    return ApiResponse.success(null, 'Email not found in our newsletter list.').send(res);
  }
  subscription.isActive = false;
  subscription.unsubscribedAt = new Date();
  await subscription.save();
  ApiResponse.success(null, 'Successfully unsubscribed from the newsletter.').send(res);
});

const getContacts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  const filter = {};
  if (isRead !== undefined) filter.isRead = isRead === 'true';

  const [contacts, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
    Contact.countDocuments(filter),
  ]);

  ApiResponse.success({
    contacts,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  }).send(res);
});

const markContactRead = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!contact) throw ApiError.notFound('Contact not found');
  ApiResponse.success({ contact }).send(res);
});

module.exports = {
  submitContact,
  subscribeNewsletter,
  unsubscribeNewsletter,
  getContacts,
  markContactRead,
};
