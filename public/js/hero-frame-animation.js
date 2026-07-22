(function () {
  'use strict';

  console.log('[hero-frame] Script loaded');

  var CONFIG = {
    total: 240,
    padding: 3,
    format: 'jpg',
    prefix: 'ezgif-frame-',
    path: '/assets/frames/'
  };
  var canvas = null;
  var ctx = null;
  var frames = [];
  var totalFrames = 0;
  var currentIndex = -1;

  function pad(n, len) {
    var s = String(n);
    while (s.length < len) s = '0' + s;
    return s;
  }

  function frameSrc(idx) {
    return CONFIG.path + CONFIG.prefix + pad(idx + 1, CONFIG.padding) + '.' + CONFIG.format;
  }

  function fetchConfig() {
    return fetch('/assets/frames/frame-count.json')
      .then(function (r) { if (!r.ok) throw Error('HTTP ' + r.status); return r.json(); })
      .then(function (cfg) { CONFIG = cfg; console.log('[hero-frame] Config loaded:', CONFIG); })
      .catch(function (e) { console.warn('[hero-frame] Config fetch failed, using defaults:', e); });
  }

  function loadImage(idx) {
    return new Promise(function (resolve) {
      var img = new Image();
      var src = frameSrc(idx);
      img.onload = function () {
        frames[idx] = img;
        resolve(true);
      };
      img.onerror = function () {
        resolve(false);
      };
      img.src = src;
      if (img.complete && img.naturalWidth > 0) {
        frames[idx] = img;
        resolve(true);
      } else if (img.complete) {
        resolve(false);
      }
    });
  }

  function setupCanvas() {
    canvas = document.getElementById('hero-canvas');
    if (!canvas) { console.error('[hero-frame] #hero-canvas not found'); return false; }
    canvas.style.setProperty('display', 'block', 'important');
    canvas.style.setProperty('visibility', 'visible', 'important');
    canvas.style.opacity = '1';
    ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) { console.error('[hero-frame] 2d context failed'); return false; }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    resizeCanvas();
    console.log('[hero-frame] Canvas ready:', canvas.width, 'x', canvas.height);
    return true;
  }

  function resizeCanvas() {
    if (!canvas) return;
    var dpr = window.devicePixelRatio || 1;
    var w = Math.round(window.innerWidth * dpr);
    var h = Math.round(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }
  }

  function drawFrame(idx) {
    if (idx === currentIndex) return;
    var img = frames[idx];
    if (!img) { console.warn('[hero-frame] Frame', idx, 'not loaded'); return; }
    if (!img.complete || !img.naturalWidth) { console.warn('[hero-frame] Frame', idx, 'incomplete'); return; }
    currentIndex = idx;
    var cw = canvas.width, ch = canvas.height;
    if (cw === 0 || ch === 0) return;
    ctx.clearRect(0, 0, cw, ch);
    var scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    var sx = (cw - img.naturalWidth * scale) / 2;
    var sy = (ch - img.naturalHeight * scale) / 2;
    ctx.drawImage(img, sx, sy, img.naturalWidth * scale, img.naturalHeight * scale);
    canvas.style.opacity = '1';
  }

  function initScrollBehavior() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[hero-frame] GSAP not available');
      return;
    }
    var hero = document.querySelector('.hero-root');
    if (!hero) return;
    gsap.registerPlugin(ScrollTrigger);
    var SCROLL_DISTANCE = '+=300vh';
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: SCROLL_DISTANCE,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 1.5,
      onUpdate: function (self) {
        var idx = Math.round(self.progress * (totalFrames - 1));
        idx = Math.max(0, Math.min(idx, totalFrames - 1));
        drawFrame(idx);
      }
    });
    console.log('[hero-frame] ScrollTrigger active');
  }

  function boot() {
    console.log('[hero-frame] boot()');

    if (!setupCanvas()) return;

    fetchConfig().then(function () {
      totalFrames = CONFIG.total;
      console.log('[hero-frame] totalFrames =', totalFrames);

      loadImage(0).then(function (ok) {
        if (ok) {
          drawFrame(0);
          console.log('[hero-frame] Frame 001 displayed');
        } else {
          console.error('[hero-frame] Frame 001 FAILED');
        }
      });

      (function loadBatch(start) {
        if (start >= totalFrames) return;
        var end = Math.min(start + 6, totalFrames);
        var promises = [];
        for (var i = start; i < end; i++) {
          if (i === 0) continue;
          promises.push(loadImage(i));
        }
        Promise.all(promises).then(function () {
          loadBatch(end);
        });
      })(1);

      setTimeout(initScrollBehavior, 100);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
