/* ============================================
   FAM Website - Seasonal Mode Toggle (Green / Winter)
   ============================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'fam-seasonal-mode';
  const SNOWFLAKE_COUNT = 40;

  let currentMode = 'green';
  let snowflakes = [];
  let snowInterval;
  let prefersReducedMotion = false;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion = mediaQuery.matches;
  mediaQuery.addEventListener('change', function (e) {
    prefersReducedMotion = e.matches;
    if (currentMode === 'winter') {
      if (prefersReducedMotion) {
        destroySnowflakes();
      } else {
        spawnSnowflakes();
      }
    }
  });

  /* --- Snowflake management --- */
  function createSnowflake() {
    var el = document.createElement('div');
    el.className = 'seasonal-snowflake';
    el.textContent = '❄';
    el.style.left = Math.random() * 100 + '%';
    var size = 8 + Math.random() * 12;
    el.style.fontSize = size + 'px';
    el.style.opacity = 0.2 + Math.random() * 0.5;
    var duration = 6 + Math.random() * 10;
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = -(Math.random() * duration) + 's';
    document.body.appendChild(el);
    return el;
  }

  function spawnSnowflakes() {
    if (prefersReducedMotion) return;
    if (snowflakes.length > 0) return;
    if (window.innerWidth < 1024) return;
    for (var i = 0; i < SNOWFLAKE_COUNT; i++) {
      var flake = createSnowflake();
      snowflakes.push(flake);
    }
  }

  function destroySnowflakes() {
    snowflakes.forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    snowflakes = [];
  }

  /* --- Leaves (green mode) --- */
  function createLeaf(container) {
    var el = document.createElement('div');
    el.className = 'leaf seasonal-leaf';
    el.style.cssText =
      'position:fixed;pointer-events:none;z-index:50;font-size:18px;opacity:0.5;animation:leafFloat linear infinite;user-select:none;';
    el.style.left = Math.random() * 100 + '%';
    el.style.animationDuration = 8 + Math.random() * 10 + 's';
    var size = 14 + Math.random() * 12;
    el.style.fontSize = size + 'px';
    el.textContent = ['🍃', '🌿', '🍂'][Math.floor(Math.random() * 3)];
    container.appendChild(el);
    return el;
  }

  function spawnLeaves() {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 1024) return;
    var container = document.getElementById('seasonal-leaves');
    if (container) container.remove();
    container = document.createElement('div');
    container.id = 'seasonal-leaves';
    document.body.appendChild(container);
    for (var i = 0; i < 6; i++) {
      createLeaf(container);
    }
  }

  function destroyLeaves() {
    var container = document.getElementById('seasonal-leaves');
    if (container) container.remove();
  }

  /* --- Birds removed --- */

  /* --- Frost overlay --- */
  function ensureFrostOverlay() {
    if (!document.querySelector('.seasonal-frost-overlay')) {
      var div = document.createElement('div');
      div.className = 'seasonal-frost-overlay';
      document.body.appendChild(div);
    }
  }

  /* --- Winter glow --- */
  function ensureWinterGlow() {
    if (!document.querySelector('.seasonal-winter-glow')) {
      var div = document.createElement('div');
      div.className = 'seasonal-winter-glow';
      document.body.appendChild(div);
    }
  }

  /* --- Apply mode --- */
  function applyMode(mode, animate) {
    currentMode = mode;
    var html = document.documentElement;

    if (mode === 'winter') {
      html.classList.add('mode-winter');
      html.classList.remove('mode-green');
      spawnSnowflakes();
      destroyLeaves();
      ensureFrostOverlay();
      ensureWinterGlow();
    } else {
      html.classList.remove('mode-winter');
      html.classList.add('mode-green');
      destroySnowflakes();
      spawnLeaves();
      var frost = document.querySelector('.seasonal-frost-overlay');
      if (frost) frost.remove();
      var glow = document.querySelector('.seasonal-winter-glow');
      if (glow) glow.remove();
    }

    updateActiveButton(mode);
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) { /* no-op */ }
  }

  /* --- Toggle UI --- */
  function buildToggle() {
    var toggle = document.createElement('div');
    toggle.className = 'seasonal-toggle';

    var greenBtn = document.createElement('button');
    greenBtn.className = 'seasonal-toggle-btn';
    greenBtn.setAttribute('data-mode', 'green');
    greenBtn.innerHTML = '<span>🌿</span> Green';

    var winterBtn = document.createElement('button');
    winterBtn.className = 'seasonal-toggle-btn';
    winterBtn.setAttribute('data-mode', 'winter');
    winterBtn.innerHTML = '<span>❄</span> Winter';

    toggle.appendChild(greenBtn);
    toggle.appendChild(winterBtn);

    greenBtn.addEventListener('click', function () {
      applyMode('green', true);
    });
    winterBtn.addEventListener('click', function () {
      applyMode('winter', true);
    });

    document.body.appendChild(toggle);
  }

  function updateActiveButton(mode) {
    var btns = document.querySelectorAll('.seasonal-toggle-btn');
    btns.forEach(function (btn) {
      btn.classList.remove('active');
      if (btn.getAttribute('data-mode') === mode) {
        btn.classList.add('active');
      }
    });
  }

  /* --- Handle resize for mobile cleanup --- */
  function handleResize() {
    var isMobile = window.innerWidth < 1024;
    if (isMobile) {
      destroySnowflakes();
      destroyLeaves();
    } else if (currentMode === 'winter') {
      spawnSnowflakes();
    } else if (currentMode === 'green') {
      spawnLeaves();
    }
  }

  /* --- Init --- */
  function init() {
    buildToggle();

    var saved = 'green';
    try { var stored = localStorage.getItem(STORAGE_KEY); if (stored) saved = stored; } catch (e) { /* */ }

    applyMode(saved, false);

    window.addEventListener('resize', handleResize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
