const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createReviewSchema,
  updateReviewSchema,
} = require('../validations/reviewValidation');

router.get('/room/:roomId', reviewController.getRoomReviews);
router.post('/', authenticate, validate(createReviewSchema), reviewController.createReview);
router.put('/:id', authenticate, validate(updateReviewSchema), reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
