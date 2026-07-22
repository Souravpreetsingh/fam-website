const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/create-order', authenticate, paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.get('/:id', authenticate, paymentController.getPaymentDetails);

module.exports = router;
