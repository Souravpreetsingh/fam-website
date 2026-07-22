const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  createRoomSchema,
  updateRoomSchema,
  checkAvailabilitySchema,
} = require('../validations/roomValidation');

router.get('/', roomController.getRooms);
router.get('/featured', roomController.getFeaturedRooms);
router.get('/availability', validate(checkAvailabilitySchema), roomController.checkAvailability);
router.get('/slug/:slug', roomController.getRoomBySlug);
router.get('/:id', roomController.getRoom);

router.post('/', authenticate, authorizeAdmin, validate(createRoomSchema), roomController.createRoom);
router.put('/:id', authenticate, authorizeAdmin, validate(updateRoomSchema), roomController.updateRoom);
router.delete('/:id', authenticate, authorizeAdmin, roomController.deleteRoom);
router.post(
  '/:id/images',
  authenticate,
  authorizeAdmin,
  upload.array('images', 10),
  roomController.uploadRoomImages
);
router.delete('/:id/images/:imageId', authenticate, authorizeAdmin, roomController.deleteRoomImage);

module.exports = router;
