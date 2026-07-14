# Flamingo aur Maina — Boutique Cafe & Stays

A premium multi-page hospitality website for a boutique cafe and stay in Jibhi, Himachal Pradesh. Built with vanilla HTML, Tailwind CSS, and lightweight JavaScript.

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
└── pages/
    ├── rooms.html              # Room listings (Flamingo 1/2/3)
    ├── life.html               # 7-chapter GSAP visual story
    ├── gallery.html            # Editorial collage gallery
    └── amenities.html          # Amenity cards grid
```

## Time Modes

| Mode | Hours | Atmosphere |
|------|-------|------------|
| 🌅 Morning | 5–11 AM | Golden sunrise, warm lighting, birds, coffee steam |
| ☀️ Afternoon | 11 AM–5 PM | Bright sky, drifting clouds, fresh greens, butterflies |
| 🌇 Sunset | 5–7 PM | Orange sky, golden light, bonfire glow, lanterns |
| 🌙 Night | 7 PM–5 AM | Stars, moonlight, fireflies, warm cabin glow, bonfire |

## Usage

Open `index.html` in any browser. No build step required.

- **Seasonal toggle** (top-right): 🌿 Green / ❄ Winter
- **Time control** (bottom-center): Auto / Morning / Afternoon / Sunset / Night

Both preferences persist in `localStorage` and respect `prefers-reduced-motion`.

## Color System

- **Primary**: #0a341d (pine green)
- **Accent**: #C9A86A (gold)
- **Background**: #f8f4ec (warm cream)
- **Charcoal**: #1B1B1B
- **Typography**: Playfair Display (headings) + Inter (body)
