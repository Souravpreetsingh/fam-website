import React from 'react';
import ReactDOM from 'react-dom/client';
import HeroSection from './HeroSection';

const mountEl = document.getElementById('hero-react-mount');
if (mountEl) {
  const root = ReactDOM.createRoot(mountEl);
  root.render(<HeroSection />);
}
