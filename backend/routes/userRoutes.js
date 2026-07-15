const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { changePasswordSchema } = require('../validations/authValidation');

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/change-password', authenticate, validate(changePasswordSchema), userController.changePassword);
router.get('/bookings', authenticate, userController.getMyBookings);

module.exports = router;
