const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const emailTemplates = [
  {
    id: 'booking_request',
    subject: 'New Booking Request - Flamingo aur Maina',
    description: 'Sent when a user submits a booking request',
    placeholders: ['{{name}}', '{{roomName}}', '{{checkIn}}', '{{checkOut}}', '{{totalAmount}}', '{{bookingId}}', '{{frontendUrl}}'],
  },
  {
    id: 'booking_confirmation',
    subject: 'Booking Confirmed - Flamingo aur Maina',
    description: 'Sent when admin confirms a booking',
    placeholders: ['{{name}}', '{{roomName}}', '{{checkIn}}', '{{checkOut}}', '{{totalAmount}}', '{{bookingId}}', '{{frontendUrl}}'],
  },
  {
    id: 'booking_cancellation',
    subject: 'Booking Cancelled - Flamingo aur Maina',
    description: 'Sent when a booking is cancelled',
    placeholders: ['{{name}}', '{{roomName}}', '{{bookingId}}', '{{reason}}', '{{frontendUrl}}'],
  },
  {
    id: 'booking_modification',
    subject: 'Booking Modified - Flamingo aur Maina',
    description: 'Sent when a booking is modified',
    placeholders: ['{{name}}', '{{roomName}}', '{{bookingId}}', '{{changes}}', '{{frontendUrl}}'],
  },
];

const getTemplates = asyncHandler(async (req, res) => {
  ApiResponse.success({ templates: emailTemplates }).send(res);
});

const previewTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const template = emailTemplates.find((t) => t.id === templateId);
  if (!template) {
    return ApiResponse.success(null, 'Template not found').send(res);
  }

  const previewHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9">
      <div style="background:#06080A;padding:24px;border-radius:12px;color:#fff">
        <h1 style="font-family:Georgia,serif;margin:0 0 16px;color:#C9A86A">Flamingo aur Maina</h1>
        <hr style="border-color:rgba(255,255,255,0.1)">
        <p>Subject: <strong>${template.subject}</strong></p>
        <p>Placeholders: ${template.placeholders.join(', ')}</p>
        <p style="color:rgba(255,255,255,0.5);font-size:13px">Email sending is not yet configured. This template is ready for integration.</p>
      </div>
    </div>
  `;

  ApiResponse.success({
    template: {
      ...template,
      previewHtml,
    },
  }).send(res);
});

module.exports = {
  getTemplates,
  previewTemplate,
};
