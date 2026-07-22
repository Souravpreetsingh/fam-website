# Flamingo aur Maina — Luxury Boutique Café & Mountain Retreat

A luxury hospitality website for Flamingo aur Maina, a boutique café and mountain retreat in Jibhi, Himachal Pradesh.

## Tech Stack

| Layer        | Technology                                          |
| ------------ | --------------------------------------------------- |
| Frontend     | React 19, TypeScript 6, Vite 8, Tailwind CSS 4      |
| Backend      | Node.js, Express, Mongoose                           |
| Database     | MongoDB Atlas                                       |
| Auth         | JWT (access + refresh tokens)                       |
| Payments     | Razorpay                                            |
| Media        | Cloudinary                                          |
| Email        | Nodemailer (SMTP)                                   |
| Animations   | GSAP, ScrollTrigger, Three.js, Framer Motion        |
| AI           | Custom knowledge base chatbot                        |
| Deployment   | Netlify (frontend), Render (backend)                 |

## Project Structure

```
.
├── public/              # Static assets (hero frames, images)
│   ├── assets/frames/   # 240 hero frame images
│   ├── css/             # Static CSS files
│   ├── js/              # Static JS files
│   └── pages/           # Static HTML pages
├── src/                 # React application
│   ├── admin/           # Admin dashboard
│   ├── api/             # API client
│   ├── assets/          # React assets
│   ├── components/      # Reusable components
│   ├── context/         # React contexts
│   ├── dashboard/       # User dashboard
│   ├── data/            # Static data
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities
│   ├── pages/           # Route pages
│   └── types/           # TypeScript types
├── api/                 # Netlify Functions (legacy)
├── backend/             # Express API server (deployed separately)
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

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Pull Request | Lint, type-check, build verification |
| `deploy.yml` | Push to `main` | Build + deploy to Netlify |

The CI pipeline runs automatically on every Pull Request and must pass before merging.

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `NETLIFY_AUTH_TOKEN` | Netlify Personal Access Token |
| `NETLIFY_SITE_ID` | Netlify site ID |

### Branch Protection

Configure the following branch protection rules on `main`:

- Require pull request reviews (1 reviewer)
- Require status checks: `Lint, TypeCheck & Build`
- Require branches to be up-to-date

## Deployment

### Frontend (Netlify)

Every push to `main` triggers an automatic deployment via GitHub Actions:

1. Build: `npm run build` (outputs to `dist/`)
2. Deploy: `netlify deploy --prod --dir=dist`
3. SPA routing handled by `netlify.toml`

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
