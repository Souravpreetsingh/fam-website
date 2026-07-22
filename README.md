# Flamingo aur Maina — Luxury Boutique Café & Mountain Retreat

A luxury hospitality website for Flamingo aur Maina, a boutique café and mountain retreat in Jibhi, Himachal Pradesh.

## Features

- **Hero Frame Animation** — 240-frame scroll-driven video animation on the hero section
- **Page Transitions** — Smooth GSAP-powered exit/enter page transitions
- **Booking System** — Full booking flow with date selection, guest management, and payment (Razorpay)
- **Authentication** — User signup/login with email verification and JWT tokens
- **Admin Dashboard** — Manage bookings, rooms, users, reviews, and cafe menu
- **User Dashboard** — View bookings, profile, favorites, payment history
- **AI Concierge** — In-app knowledge base chatbot
- **Seasonal Themes** — Summer/Winter mode switching
- **Responsive Design** — Mobile-first layout using Tailwind CSS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript, Tailwind CSS |
| Backend | Node.js, Express, Mongoose, Socket.io |
| Database | MongoDB Atlas |
| Authentication | JWT (access + refresh tokens) |
| Payments | Razorpay |
| Media | Cloudinary |
| Email | Nodemailer (SMTP) |
| Animations | GSAP, ScrollTrigger |
| AI | Custom knowledge base chatbot |
| Deployment | Netlify (static), Render (backend) |

## Project Structure

```
├── public/              # Static HTML site (hero frames + pages)
│   ├── assets/frames/   # 240 hero frame images
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript (transitions, hero, animations)
│   └── pages/           # HTML pages (booking, rooms, explore, etc.)
├── backend/             # Express API server
│   ├── config/          # DB, Cloudinary, Nodemailer, Razorpay config
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, error handling, validation, upload
│   ├── models/          # Mongoose schemas (User, Room, Booking, etc.)
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── sockets/         # WebSocket (Socket.io)
│   └── validations/     # Zod schemas
├── api/                 # Netlify Functions wrapper
├── netlify.toml         # Netlify deployment config
└── render.yaml          # Render deployment config
```

## Getting Started

### 1. Static HTML Site

```bash
npx serve public -l 3000
```

Opens the hero frames + static pages at `http://localhost:3000`.

### 2. Backend

```bash
cd backend
npm install
# Set up backend/.env with your MongoDB URI and keys
npm start
```

Starts the API server at `http://localhost:5000` with Swagger docs at `/api-docs`.

## Environment Variables

Copy `.env.example` to `.env` and configure:

### Backend (backend/.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fam?retryWrites=true&w=majority
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=Flamingo aur Maina <noreply@flamingoaurmaina.com>
FRONTEND_URL=http://localhost:3000
```

## Deployment

- **Static Site**: Deploy `public/` to Netlify (auto-configured via `netlify.toml`)
- **Backend**: Deploy `backend/` to Render (auto-configured via `render.yaml`)

## API Documentation

When the backend is running, Swagger docs are available at `http://localhost:5000/api-docs`.

### Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/register` | User registration |
| `POST /api/v1/auth/login` | User login |
| `GET /api/v1/rooms` | List rooms |
| `GET /api/v1/rooms/:slug` | Room details |
| `POST /api/v1/bookings` | Create booking |
| `GET /api/v1/bookings` | User bookings |
| `POST /api/v1/payments/create-order` | Create Razorpay order |
| `POST /api/v1/contact` | Submit contact form |
| `GET /api/v1/admin/*` | Admin endpoints |
