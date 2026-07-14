// FAM Website - Scroll Animations & Interactions
(function(global) {
  'use strict';

  const FAM = global.FAM || {};
  FAM.Animations = {};

  // ---- IntersectionObserver Reveal ----
  FAM.Animations.initReveal = function() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    els.forEach(el => observer.observe(el));
  };

  // ---- IntersectionObserver for .reveal-hidden ----
  FAM.Animations.initRevealHidden = function() {
    const els = document.querySelectorAll('.reveal-hidden');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    els.forEach(el => observer.observe(el));
  };

  // ---- Parallax on Scroll ----
  FAM.Animations.initParallax = function() {
    const imgs = document.querySelectorAll('.parallax-img');
    if (!imgs.length) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      imgs.forEach(img => {
        const speed = parseFloat(img.dataset.speed) || 0.15;
        img.style.transform = `translate3d(0, ${scrolled * speed}px, 0) scale(1.1)`;
      });
    });
  };

  // ---- Navbar Reveal at 65% Scroll ----
  FAM.Animations.initNavbar = function() {
    const nav = document.getElementById('main-nav') || document.getElementById('navbar');
    if (!nav) return;

    const revealAt = window.innerHeight * 0.65;
    let revealed = false;

    nav.classList.add('nav-hidden');

    window.addEventListener('scroll', () => {
      if (window.scrollY > revealAt) {
        if (!revealed) {
          nav.classList.add('nav-visible');
          nav.classList.remove('nav-hidden');
          revealed = true;
        }
      } else {
        if (revealed) {
          nav.classList.remove('nav-visible');
          nav.classList.add('nav-hidden');
          revealed = false;
        }
      }
    });
  };

  // ---- Glass Card 3D Mouse Parallax ----
  FAM.Animations.initCardParallax = function() {
    const card = document.querySelector('[data-card-parallax]');
    if (!card) return;

    document.addEventListener('mousemove', (e) => {
      if (window.innerWidth > 1024) {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        card.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  };

  // ---- GSAP Reveal (load GSAP first) ----
  FAM.Animations.initGSAPReveal = function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // Retry after GSAP loads
      setTimeout(FAM.Animations.initGSAPReveal, 500);
      return;
    }

    // .gsap-reveal: fade + slide up
    gsap.utils.toArray('.gsap-reveal').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
      });
    });

    // .gsap-mask: clip-path reveal
    gsap.utils.toArray('.gsap-mask').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        clipPath: 'inset(0 0 100% 0)',
        duration: 1.4,
        ease: 'power3.out'
      });
    });

    // Parallax sections
    gsap.utils.toArray('[data-speed]').forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.5;
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        },
        y: (el.offsetHeight * speed) / 2,
        ease: 'none'
      });
    });
  };

  // ---- Lenis Smooth Scroll ----
  FAM.Animations.initLenis = function() {
    if (typeof Lenis === 'undefined') {
      setTimeout(FAM.Animations.initLenis, 500);
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5
    });

    if (typeof gsap !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    FAM.lenis = lenis;
  };

  // ---- Init All ----
  FAM.Animations.init = function(opts) {
    opts = opts || {};
    
    if (opts.reveal !== false) FAM.Animations.initReveal();
    if (opts.revealHidden !== false) FAM.Animations.initRevealHidden();
    if (opts.parallax !== false) FAM.Animations.initParallax();
    if (opts.navbar !== false) FAM.Animations.initNavbar();
    if (opts.cardParallax !== false) FAM.Animations.initCardParallax();
    if (opts.gsap !== false) FAM.Animations.initGSAPReveal();
    if (opts.lenis !== false) FAM.Animations.initLenis();
  };

  global.FAM = FAM;

})(window);
