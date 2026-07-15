const { z } = require('zod');

const contactFormSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z.string().trim().email('Please provide a valid email'),
    phone: z.string().trim().optional().default(''),
    subject: z
      .string()
      .trim()
      .min(3, 'Subject must be at least 3 characters')
      .max(200, 'Subject cannot exceed 200 characters'),
    message: z
      .string()
      .trim()
      .min(10, 'Message must be at least 10 characters')
      .max(2000, 'Message cannot exceed 2000 characters'),
  }),
});

const newsletterSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please provide a valid email'),
  }),
});

module.exports = {
  contactFormSchema,
  newsletterSchema,
};
