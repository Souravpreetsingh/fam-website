const authService = require('../services/authService');
const emailService = require('../services/emailService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.validated.body;
  const { user, verificationToken } = await authService.register({
    name,
    email,
    password,
    phone,
  });
  await emailService.sendVerificationEmail(user, verificationToken);
  ApiResponse.created(
    { user },
    'Registration successful. Please check your email to verify your account.'
  ).send(res);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  ApiResponse.success(
    { user, accessToken, refreshToken },
    'Login successful'
  ).send(res);
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken) {
    await authService.logout(req.user._id, refreshToken);
  }
  ApiResponse.success(null, 'Logged out successfully').send(res);
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) {
    return ApiResponse.success(null, 'Refresh token is required').send(res);
  }
  const tokens = await authService.refreshAccessToken(token);
  ApiResponse.success(tokens, 'Token refreshed successfully').send(res);
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.validated.query;
  const user = await authService.verifyEmail(token);
  await emailService.sendWelcomeEmail(user);
  ApiResponse.success({ user }, 'Email verified successfully').send(res);
});

const resendVerification = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.isVerified) {
    return ApiResponse.success(null, 'Email already verified').send(res);
  }
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();
  await emailService.sendVerificationEmail(user, verificationToken);
  ApiResponse.success(null, 'Verification email resent').send(res);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.validated.body;
  const result = await authService.forgotPassword(email);
  if (result) {
    await emailService.sendPasswordResetEmail(result.user, result.resetToken);
  }
  ApiResponse.success(
    null,
    'If an account with that email exists, a password reset link has been sent.'
  ).send(res);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.validated.body;
  await authService.resetPassword(token, password);
  ApiResponse.success(null, 'Password reset successful').send(res);
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};
