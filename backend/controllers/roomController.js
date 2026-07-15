const Room = require('../models/Room');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const cloudinaryService = require('../services/cloudinaryService');
const { paginate, paginationResponse } = require('../utils/pagination');

const getRooms = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const filter = {};

  if (req.query.isAvailable !== undefined) {
    filter.isAvailable = req.query.isAvailable === 'true';
  }
  if (req.query.isFeatured !== undefined) {
    filter.isFeatured = req.query.isFeatured === 'true';
  }
  if (req.query.minPrice) {
    filter.pricePerNight = { $gte: parseFloat(req.query.minPrice) };
  }
  if (req.query.maxPrice) {
    filter.pricePerNight = { ...filter.pricePerNight, $lte: parseFloat(req.query.maxPrice) };
  }
  if (req.query.capacity) {
    filter['capacity.maxGuests'] = { $gte: parseInt(req.query.capacity, 10) };
  }
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const sort = {};
  if (req.query.sort) {
    const [field, order] = req.query.sort.split(':');
    sort[field] = order === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const [rooms, total] = await Promise.all([
    Room.find(filter).sort(sort).skip(skip).limit(limit),
    Room.countDocuments(filter),
  ]);

  ApiResponse.success({
    rooms,
    pagination: paginationResponse(total, page, limit),
  }).send(res);
});

const getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    throw ApiError.notFound('Room not found');
  }
  ApiResponse.success({ room }).send(res);
});

const getRoomBySlug = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ slug: req.params.slug });
  if (!room) {
    throw ApiError.notFound('Room not found');
  }
  ApiResponse.success({ room }).send(res);
});

const createRoom = asyncHandler(async (req, res) => {
  const roomData = req.validated.body;
  const room = await Room.create(roomData);
  ApiResponse.created({ room }, 'Room created successfully').send(res);
});

const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.validated.body, {
    new: true,
    runValidators: true,
  });
  if (!room) {
    throw ApiError.notFound('Room not found');
  }
  ApiResponse.success({ room }, 'Room updated successfully').send(res);
});

const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    throw ApiError.notFound('Room not found');
  }
  if (room.images && room.images.length > 0) {
    const publicIds = room.images.map((img) => img.public_id);
    await cloudinaryService.deleteImages(publicIds);
  }
  if (room.thumbnail?.public_id) {
    await cloudinaryService.deleteImage(room.thumbnail.public_id);
  }
  await Room.findByIdAndDelete(req.params.id);
  ApiResponse.success(null, 'Room deleted successfully').send(res);
});

const uploadRoomImages = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    throw ApiError.notFound('Room not found');
  }
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No images uploaded');
  }
  const images = await cloudinaryService.uploadImages(req.files, 'fam/rooms');
  room.images.push(...images);
  if (!room.thumbnail && images.length > 0) {
    room.thumbnail = images[0];
  }
  await room.save();
  ApiResponse.success({ room }, 'Images uploaded successfully').send(res);
});

const deleteRoomImage = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    throw ApiError.notFound('Room not found');
  }
  const image = room.images.id(req.params.imageId);
  if (!image) {
    throw ApiError.notFound('Image not found');
  }
  await cloudinaryService.deleteImage(image.public_id);
  room.images.pull(req.params.imageId);
  if (room.thumbnail?.public_id === image.public_id) {
    room.thumbnail = room.images.length > 0 ? room.images[0] : undefined;
  }
  await room.save();
  ApiResponse.success({ room }, 'Image deleted successfully').send(res);
});

const checkAvailability = asyncHandler(async (req, res) => {
  const { checkIn, checkOut, roomId } = req.query;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    throw ApiError.badRequest('Check-out must be after check-in');
  }

  const filter = { isAvailable: true };
  if (roomId) filter._id = roomId;

  const rooms = await Room.find(filter);
  const availability = rooms.map((room) => {
    const isBooked = room.bookedDates.some((bd) => {
      const bdDate = new Date(bd.date);
      return bdDate >= checkInDate && bdDate < checkOutDate && bd.count >= room.totalRooms;
    });

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = room.discountPrice || room.pricePerNight * nights;

    return {
      room: {
        _id: room._id,
        name: room.name,
        slug: room.slug,
        pricePerNight: room.pricePerNight,
        discountPrice: room.discountPrice,
        capacity: room.capacity,
        thumbnail: room.thumbnail,
        amenities: room.amenities,
        bedType: room.bedType,
      },
      available: !isBooked,
      nights,
      totalPrice,
    };
  });

  ApiResponse.success({ availability, checkIn, checkOut }).send(res);
});

const getFeaturedRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ isFeatured: true, isAvailable: true }).limit(6);
  ApiResponse.success({ rooms }).send(res);
});

module.exports = {
  getRooms,
  getRoom,
  getRoomBySlug,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImages,
  deleteRoomImage,
  checkAvailability,
  getFeaturedRooms,
};
