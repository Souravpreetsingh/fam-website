# Flamingo aur Maina — Boutique Cafe & Stays

A premium multi-page hospitality website for a boutique cafe and stay in Jibhi, Himachal Pradesh.
Built with vanilla HTML, Tailwind CSS (CDN), and lightweight JavaScript.

**Live:** https://fam-mountain-retreat.vercel.app

---

## Live Features

| Feature | Description |
|---------|-------------|
| **Mountain Time Experience** | Page atmosphere auto-changes by visitor's local time (Morning / Afternoon / Sunset / Night) with animated stars, clouds, fireflies, bonfire glow |
| **Seasonal Mode** | Toggle between Green (default) and Winter — affects color palette, snowfall, floating leaves |
| **Cinematic Hero** | WebGL shader overlay, Ken Burns images, floating birds, parallax scroll |
| **GSAP Storytelling** | Scroll-triggered reveals, fog layers, bonfire embers, coffee steam, twinkling stars |
| **Responsive Design** | Desktop, tablet, and mobile layouts |

## File Structure

```
/
├── index.html                  # Homepage — hero, mountain time, story, rooms preview, CTA
├── css/
│   └── style.css               # Shared design system + all feature CSS
├── js/
│   ├── shader.js               # WebGL fog shader
│   ├── animations.js           # Scroll reveals, card parallax, hover effects
│   ├── seasonal.js             # Green/Winter mode toggle, snowflakes, leaves, birds
│   └── mountain-time.js        # Time-of-day detection, atmospheric particles, control panel
├── pages/
│   ├── rooms.html              # Room listings (Flamingo 1/2/3)
│   ├── life.html               # 7-chapter GSAP visual story
│   ├── explore.html            # Local attractions guide
│   ├── gallery.html            # Editorial collage gallery
│   └── amenities.html          # Amenity cards grid
├── images/                     # Static image assets
├── .github/workflows/ci.yml   # CI pipeline
├── vercel.json                 # Deployment configuration
└── package.json                # Build scripts (static site)
```

## Time Modes

| Mode | Hours | Atmosphere |
|------|-------|------------|
| 🌅 Morning | 5–11 AM | Golden sunrise, warm lighting, birds, coffee steam |
| ☀️ Afternoon | 11 AM–5 PM | Bright sky, drifting clouds, fresh greens, butterflies |
| 🌇 Sunset | 5–7 PM | Orange sky, golden light, bonfire glow, lanterns |
| 🌙 Night | 7 PM–5 AM | Stars, moonlight, fireflies, warm cabin glow, bonfire |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Souravpreetsingh/fam-website.git
cd fam-website

# Install dependencies (none required — just a lockfile)
npm install

# Start a local development server
npm start
# or open index.html directly in your browser
```

### Environment Variables

No environment variables are required for local development or production.
This is a static site with no server-side runtime.

See `.env.example` for any future API key placeholders.

## Development

- **Seasonal toggle** (top-right): 🌿 Green / ❄️ Winter
- **Time control** (bottom-center): Auto / Morning / Afternoon / Sunset / Night

Both preferences persist in `localStorage` and respect `prefers-reduced-motion`.

## Color System

- **Primary**: #0a341d (pine green)
- **Accent**: #C9A86A (gold)
- **Background**: #f8f4ec (warm cream)
- **Charcoal**: #1B1B1B
- **Typography**: Playfair Display (headings) + Inter (body)

## CI / CD

| Trigger | Action |
|---------|--------|
| **Push to `main`** | GitHub Actions runs `lint` + `build`; Vercel auto-deploys to production |
| **Pull Request** | GitHub Actions runs `lint` + `build`; Vercel creates a preview deployment |

### Pipeline

1. **GitHub Actions** — `.github/workflows/ci.yml`
   - Checks out code
   - Sets up Node.js LTS with npm cache
   - Runs `npm ci`
   - Runs `npm run lint` (if available)
   - Runs `npm run build`
   - Verifies build output exists

2. **Vercel** (auto-connected via GitHub)
   - Production: every push to `main`
   - Preview: every PR (comment includes preview URL)
   - Framework: static (`null` in vercel.json)

### Manual Steps (one-time)

1. Connect the repo in [Vercel Dashboard](https://vercel.com):
   - Import `Souravpreetsingh/fam-website`
   - Framework preset: **Other**
   - Build command: `npm run build`
   - Output directory: `.`
   - Root directory: `/`

2. Enable **GitHub Actions** on the repository (Settings → Actions → Allow all actions).

3. No environment variables need to be configured in the Vercel dashboard
   for this static site.
