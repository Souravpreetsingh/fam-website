const fs = require('fs');
const path = require('path');
const { sendEmail } = require('../config/nodemailer');

const loadTemplate = (templateName, replacements) => {
  const templatePath = path.join(__dirname, '..', 'emails', templateName);
  let html = fs.readFileSync(templatePath, 'utf-8');

  for (const [key, value] of Object.entries(replacements)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  return html;
};

class EmailService {
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = loadTemplate('verification.html', {
      name: user.name,
      verificationUrl,
      frontendUrl: process.env.FRONTEND_URL,
      year: new Date().getFullYear().toString(),
    });

    await sendEmail({
      to: user.email,
      subject: 'Verify your email - Flamingo aur Maina',
      html,
    });
  }

  async sendWelcomeEmail(user) {
    const html = loadTemplate('welcome.html', {
      name: user.name,
      frontendUrl: process.env.FRONTEND_URL,
      year: new Date().getFullYear().toString(),
    });

    await sendEmail({
      to: user.email,
      subject: 'Welcome to Flamingo aur Maina',
      html,
    });
  }

  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = loadTemplate('forgotPassword.html', {
      name: user.name,
      resetUrl,
      frontendUrl: process.env.FRONTEND_URL,
      year: new Date().getFullYear().toString(),
    });

    await sendEmail({
      to: user.email,
      subject: 'Password Reset - Flamingo aur Maina',
      html,
    });
  }

  async sendBookingConfirmation(booking, user, room) {
    const html = loadTemplate('bookingConfirmation.html', {
      name: user.name,
      bookingId: booking._id.toString(),
      roomName: room.name,
      checkIn: booking.checkIn.toLocaleDateString(),
      checkOut: booking.checkOut.toLocaleDateString(),
      guests: `${booking.guests.adults} Adults${booking.guests.children ? `, ${booking.guests.children} Children` : ''}`,
      totalAmount: `₹${booking.totalAmount.toLocaleString()}`,
      frontendUrl: process.env.FRONTEND_URL,
      year: new Date().getFullYear().toString(),
    });

    await sendEmail({
      to: user.email,
      subject: 'Booking Confirmed - Flamingo aur Maina',
      html,
    });
  }

  async sendContactAutoReply(contact) {
    const html = loadTemplate('contactResponse.html', {
      name: contact.name,
      subject: contact.subject,
      frontendUrl: process.env.FRONTEND_URL,
      year: new Date().getFullYear().toString(),
    });

    await sendEmail({
      to: contact.email,
      subject: `Thank you for contacting us - ${contact.subject}`,
      html,
    });
  }
}

module.exports = new EmailService();
