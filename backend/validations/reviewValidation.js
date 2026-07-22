const { z } = require('zod');

const createReviewSchema = z.object({
  body: z.object({
    room: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid room ID'),
    booking: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    title: z.string().max(100).optional().default(''),
    comment: z
      .string()
      .trim()
      .min(10, 'Comment must be at least 10 characters')
      .max(1000, 'Comment cannot exceed 1000 characters'),
  }),
});

const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().max(100).optional(),
    comment: z.string().trim().min(10).max(1000).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID'),
  }),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
};
