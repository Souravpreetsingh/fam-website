# Flamingo aur Maina — Luxury Boutique Café & Mountain Retreat

A luxury hospitality website for Flamingo aur Maina, a boutique café and mountain retreat in Jibhi, Himachal Pradesh.

## Tech Stack

| Layer        | Technology                                          |
| ------------ | --------------------------------------------------- |
| Frontend     | HTML, CSS, JavaScript, Tailwind CSS                  |
| Backend      | Node.js, Express, Mongoose                           |
| Database     | MongoDB Atlas                                       |
| Auth         | JWT (access + refresh tokens)                       |
| Payments     | Razorpay                                            |
| Media        | Cloudinary                                          |
| Email        | Nodemailer (SMTP)                                   |
| Animations   | GSAP, ScrollTrigger                                 |
| AI           | Custom knowledge base chatbot                        |
| Deployment   | Netlify (frontend), Render (backend)                 |

## Project Structure

```
.
├── public/              # Static HTML site (deployed to Netlify)
│   ├── assets/frames/   # 240 hero frame images
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript (transitions, hero, animations)
│   └── pages/           # HTML pages (booking, rooms, explore, etc.)
├── src/                 # React app (in development, not deployed)
├── api/                 # Netlify Functions wrapper
├── backend/             # Express API server (deployed on Render)
├── .github/workflows/   # CI/CD pipelines
├── netlify.toml         # Netlify deployment config
└── render.yaml          # Render deployment config
```

## Getting Started

### Prerequisites

- Node.js 20 (see `.nvmrc`)
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens the Vite dev server at `http://localhost:5173`.

### Code Quality

```bash
npm run lint       # ESLint via oxlint
npm run type-check # TypeScript type checking
npm run build      # Production build
```

## CI/CD

### GitHub Actions

| Workflow    | Trigger         | Purpose                                   |
| ----------- | --------------- | ----------------------------------------- |
| `ci.yml`    | Pull Request    | Validate required files exist             |
| `deploy.yml` | Push to `main`  | Deploy `public/` to Netlify               |

### Required GitHub Secrets

| Secret                | Description                                  |
| --------------------- | -------------------------------------------- |
| `NETLIFY_AUTH_TOKEN`  | Netlify Personal Access Token                |
| `NETLIFY_SITE_ID`     | Netlify site ID                              |

## Deployment

### Frontend (Static Site)

Every push to `main` triggers an automatic deployment via GitHub Actions:

1. Deploy `public/` to Netlify
2. Clean URLs: `/pages/room` → `/pages/room.html`
3. API proxy: `/api/*` → Render backend

Preview deployments are available via Netlify's GitHub integration.

### Backend (Render)

The backend API is deployed separately on Render (configured via `render.yaml`).

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=/api/v1
```

Backend variables are stored in `backend/.env` and deployed separately.

## API

The frontend communicates with the backend via a Netlify proxy:

```
/api/* → https://fam-backend.onrender.com/api/*
```

For local development, the Vite proxy forwards `/api/*` to `http://localhost:5000`.
