const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { contactFormSchema, newsletterSchema } = require('../validations/contactValidation');

router.post('/', validate(contactFormSchema), contactController.submitContact);
router.post('/newsletter', validate(newsletterSchema), contactController.subscribeNewsletter);
router.get('/unsubscribe', contactController.unsubscribeNewsletter);

router.get('/admin', authenticate, authorizeAdmin, contactController.getContacts);
router.put('/admin/:id/read', authenticate, authorizeAdmin, contactController.markContactRead);

module.exports = router;
