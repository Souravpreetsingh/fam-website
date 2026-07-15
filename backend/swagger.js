const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flamingo aur Maina - Luxury Boutique Stay API',
      version: '1.0.0',
      description: `RESTful API for Flamingo aur Maina luxury hotel booking platform.

## Features
- User authentication (JWT with refresh tokens)
- Room management with image uploads
- Online booking system
- Razorpay payment integration
- Reviews and ratings
- Contact form and newsletter
- Admin dashboard and analytics
- Real-time updates via Socket.io`,
      contact: {
        name: 'Flamingo aur Maina Support',
        email: 'support@flamingoaurmaina.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000/api/v1',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['guest', 'admin'] },
            isVerified: { type: 'boolean' },
            avatar: {
              type: 'object',
              properties: {
                public_id: { type: 'string' },
                url: { type: 'string' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Room: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            shortDescription: { type: 'string' },
            pricePerNight: { type: 'number' },
            discountPrice: { type: 'number' },
            currency: { type: 'string' },
            capacity: {
              type: 'object',
              properties: {
                adults: { type: 'integer' },
                children: { type: 'integer' },
                maxGuests: { type: 'integer' },
              },
            },
            amenities: { type: 'array', items: { type: 'string' } },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  public_id: { type: 'string' },
                  url: { type: 'string' },
                  alt: { type: 'string' },
                },
              },
            },
            isAvailable: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            totalRooms: { type: 'integer' },
            rating: { type: 'number' },
            numReviews: { type: 'integer' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            room: { type: 'string' },
            checkIn: { type: 'string', format: 'date' },
            checkOut: { type: 'string', format: 'date' },
            guests: {
              type: 'object',
              properties: {
                adults: { type: 'integer' },
                children: { type: 'integer' },
              },
            },
            totalAmount: { type: 'number' },
            amountPaid: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'] },
            paymentStatus: { type: 'string', enum: ['pending', 'partial', 'paid', 'refunded', 'failed'] },
            nights: { type: 'integer' },
            specialRequests: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            room: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            title: { type: 'string' },
            comment: { type: 'string' },
            isApproved: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            booking: { type: 'string' },
            razorpayOrderId: { type: 'string' },
            razorpayPaymentId: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            status: { type: 'string', enum: ['created', 'attempted', 'paid', 'failed', 'refunded'] },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User profile management' },
      { name: 'Rooms', description: 'Room catalog and management' },
      { name: 'Bookings', description: 'Booking operations' },
      { name: 'Payments', description: 'Razorpay payment integration' },
      { name: 'Reviews', description: 'Room reviews and ratings' },
      { name: 'Contact', description: 'Contact form and newsletter' },
      { name: 'Admin', description: 'Admin dashboard and management' },
      { name: 'Health', description: 'Server health check' },
    ],
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
