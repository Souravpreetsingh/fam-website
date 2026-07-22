const Room = require('../models/Room');
const Booking = require('../models/Booking');
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
      { 'amenities': { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.amenities) {
    const amenities = req.query.amenities.split(',');
    filter.amenities = { $all: amenities };
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.bedType) {
    filter.bedType = { $regex: req.query.bedType, $options: 'i' };
  }

  if (req.query.checkIn && req.query.checkOut) {
    const checkInDate = new Date(req.query.checkIn);
    const checkOutDate = new Date(req.query.checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    const bookedRoomIds = await Booking.find({
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
      status: { $in: ['pending', 'confirmed', 'checked_in', 'checked_out'] },
    }).distinct('room');

    filter._id = { $nin: bookedRoomIds };
    filter.isAvailable = true;
    filter.status = { $nin: ['maintenance', 'out_of_service'] };
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

  const responseData = {
    rooms,
    pagination: paginationResponse(total, page, limit),
  };

  if (req.query.checkIn && req.query.checkOut) {
    const checkInDate = new Date(req.query.checkIn);
    const checkOutDate = new Date(req.query.checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    responseData.rooms = rooms.map((room) => {
      const obj = room.toObject();
      obj.totalPrice = (room.discountPrice || room.pricePerNight) * nights;
      obj.nights = nights;
      return obj;
    });
  }

  ApiResponse.success(responseData).send(res);
});

const getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw ApiError.notFound('Room not found');
  ApiResponse.success({ room }).send(res);
});

const getRoomBySlug = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ slug: req.params.slug });
  if (!room) throw ApiError.notFound('Room not found');
  ApiResponse.success({ room }).send(res);
});

const createRoom = asyncHandler(async (req, res) => {
  const roomData = req.validated?.body || {};
  const room = await Room.create(roomData);
  ApiResponse.created({ room }, 'Room created successfully').send(res);
});

const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.validated?.body || {}, {
    new: true,
    runValidators: true,
  });
  if (!room) throw ApiError.notFound('Room not found');
  ApiResponse.success({ room }, 'Room updated successfully').send(res);
});

const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw ApiError.notFound('Room not found');
  if (room.images && room.images.length > 0) {
    await cloudinaryService.deleteImages(room.images.map((img) => img.public_id));
  }
  if (room.thumbnail?.public_id) {
    await cloudinaryService.deleteImage(room.thumbnail.public_id);
  }
  await Room.findByIdAndDelete(req.params.id);
  ApiResponse.success(null, 'Room deleted successfully').send(res);
});

const uploadRoomImages = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw ApiError.notFound('Room not found');
  if (!req.files || req.files.length === 0) throw ApiError.badRequest('No images uploaded');
  const images = await cloudinaryService.uploadImages(req.files, 'fam/rooms');
  room.images.push(...images);
  if (!room.thumbnail && images.length > 0) room.thumbnail = images[0];
  await room.save();
  ApiResponse.success({ room }, 'Images uploaded successfully').send(res);
});

const deleteRoomImage = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw ApiError.notFound('Room not found');
  const image = room.images.id(req.params.imageId);
  if (!image) throw ApiError.notFound('Image not found');
  await cloudinaryService.deleteImage(image.public_id);
  room.images.pull(req.params.imageId);
  if (room.thumbnail?.public_id === image.public_id) {
    room.thumbnail = room.images.length > 0 ? room.images[0] : undefined;
  }
  await room.save();
  ApiResponse.success({ room }, 'Image deleted successfully').send(res);
});

const checkAvailability = asyncHandler(async (req, res) => {
  const { checkIn, checkOut, roomId } = req.validated?.query || req.query;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) throw ApiError.badRequest('Check-out must be after check-in');

  const filter = {};
  if (roomId) filter._id = roomId;

  const rooms = await Room.find(filter);
  const availability = rooms.map((room) => {
    const isBooked = room.bookedDates.some((bd) => {
      const bdDate = new Date(bd.date);
      return bdDate >= checkInDate && bdDate < checkOutDate && bd.count >= room.totalRooms;
    });

    const isMaintenance = room.isDateBlockedForMaintenance(checkInDate) ||
      room.isDateBlockedForMaintenance(new Date(checkOutDate.getTime() - 86400000));

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = (room.discountPrice || room.pricePerNight) * nights;

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
        status: room.status,
        minStay: room.minStay,
        maxStay: room.maxStay,
      },
      available: !isBooked && !isMaintenance && room.status !== 'maintenance' && room.status !== 'out_of_service',
      nights,
      totalPrice,
      reason: isBooked ? 'fully_booked' : isMaintenance ? 'maintenance' : room.status === 'maintenance' ? 'maintenance' : room.status === 'out_of_service' ? 'out_of_service' : null,
    };
  });

  ApiResponse.success({ availability, checkIn, checkOut }).send(res);
});

const getFeaturedRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ isFeatured: true, isAvailable: true }).limit(6);
  ApiResponse.success({ rooms }).send(res);
});

const updateRoomStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['available', 'booked', 'occupied', 'cleaning', 'maintenance', 'out_of_service'];
  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const room = await Room.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!room) throw ApiError.notFound('Room not found');

  if (status === 'available') {
    room.isAvailable = true;
    await room.save();
  } else if (status === 'maintenance' || status === 'out_of_service') {
    room.isAvailable = false;
    await room.save();
  }

  ApiResponse.success({ room }, `Room status updated to ${status}`).send(res);
});

const blockForMaintenance = asyncHandler(async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  if (!startDate || !endDate) throw ApiError.badRequest('Start and end dates required');

  const room = await Room.findById(req.params.id);
  if (!room) throw ApiError.notFound('Room not found');

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start >= end) throw ApiError.badRequest('End date must be after start date');

  const overlapping = await Booking.findOne({
    room: req.params.id,
    checkIn: { $lt: end },
    checkOut: { $gt: start },
    status: { $in: ['confirmed', 'checked_in', 'pending'] },
  });
  if (overlapping) {
    throw ApiError.conflict('Cannot block dates: there are existing bookings in this period');
  }

  room.maintenanceBlocks.push({
    startDate: start,
    endDate: end,
    reason: reason || 'Scheduled maintenance',
  });
  room.status = 'maintenance';
  room.isAvailable = false;
  await room.save();

  ApiResponse.success({ room }, 'Room blocked for maintenance').send(res);
});

const removeMaintenanceBlock = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw ApiError.notFound('Room not found');

  room.maintenanceBlocks = room.maintenanceBlocks.filter(
    (block) => block._id.toString() !== req.params.blockId
  );

  if (room.maintenanceBlocks.length === 0 && room.status === 'maintenance') {
    room.status = 'available';
    room.isAvailable = true;
  }
  await room.save();

  ApiResponse.success({ room }, 'Maintenance block removed').send(res);
});

const getRoomCalendar = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const m = parseInt(month) || new Date().getMonth();
  const y = parseInt(year) || new Date().getFullYear();

  const startDate = new Date(y, m, 1);
  const endDate = new Date(y, m + 1, 0, 23, 59, 59);

  const rooms = await Room.find({});

  const allRoomsStats = await Promise.all(
    rooms.map(async (room) => {
      const bookings = await Booking.find({
        room: room._id,
        checkIn: { $lte: endDate },
        checkOut: { $gte: startDate },
        status: { $in: ['confirmed', 'checked_in', 'checked_out', 'pending'] },
      });

      const days = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayBookings = bookings.filter((b) => {
          const ci = new Date(b.checkIn).toISOString().split('T')[0];
          const co = new Date(b.checkOut).toISOString().split('T')[0];
          return dateStr >= ci && dateStr < co;
        });
        const isMaintenance = room.isDateBlockedForMaintenance(d);
        days.push({
          date: dateStr,
          available: room.isDateAvailable(d) && !isMaintenance,
          booked: dayBookings.length > 0,
          bookingCount: dayBookings.length,
          maintenance: isMaintenance,
          checkIns: dayBookings.filter((b) => new Date(b.checkIn).toISOString().split('T')[0] === dateStr).map((b) => ({ bookingId: b._id, guest: b.user?.toString() })),
          checkOuts: dayBookings.filter((b) => new Date(b.checkOut).toISOString().split('T')[0] === dateStr).map((b) => ({ bookingId: b._id, guest: b.user?.toString() })),
        });
      }

      return {
        room: { _id: room._id, name: room.name, slug: room.slug, status: room.status, totalRooms: room.totalRooms },
        days,
      };
    })
  );

  ApiResponse.success({ calendar: allRoomsStats, month: m, year: y }).send(res);
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
  updateRoomStatus,
  blockForMaintenance,
  removeMaintenanceBlock,
  getRoomCalendar,
};
