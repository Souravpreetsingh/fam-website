(function () {
  'use strict';

  var isOpen = false;
  var hasLoaded = false;
  var knowledgeBase = [];
  var kbReady = false;

  var fallbackMsg = "I'm sorry, I don't have that information yet. Please contact our Property Manager at 98765 75673 or email flamingoaurmaina@gmail.com. We'll be happy to help.";

  var chipLabels = [
    { text:'Recommend a Room', icon:'🏡' },
    { text:'Plan My Trip', icon:'🗓️' },
    { text:'Nearby Attractions', icon:'📍' },
    { text:'Amenities', icon:'🚿' },
    { text:'Wi-Fi', icon:'📶' },
    { text:'Bonfire', icon:'🔥' },
    { text:'Cafe Menu', icon:'☕' },
    { text:'Contact FAM', icon:'📞' }
  ];

  var welcomeText =
    '<div class="cq-welcome">' +
      '<div class="cq-welcome-greeting">Hello 👋</div>' +
      '<div class="cq-welcome-title">Welcome to Flamingo aur Maina.</div>' +
      '<div class="cq-welcome-sub">I\'m your personal mountain concierge. I can help you with:</div>' +
      '<div class="cq-welcome-list">' +
        '<div class="cq-welcome-item"><span>🏡</span> Room recommendations</div>' +
        '<div class="cq-welcome-item"><span>📍</span> Nearby attractions</div>' +
        '<div class="cq-welcome-item"><span>🥾</span> Trek planning</div>' +
        '<div class="cq-welcome-item"><span>☕</span> Cafe &amp; dining info</div>' +
        '<div class="cq-welcome-item"><span>🔥</span> Bonfire bookings</div>' +
        '<div class="cq-welcome-item"><span>🚗</span> Cab services</div>' +
        '<div class="cq-welcome-item"><span>💻</span> Workcation</div>' +
        '<div class="cq-welcome-item"><span>🗓️</span> Trip planning</div>' +
      '</div>' +
    '</div>';

  /* === Load Knowledge Base === */
  function getKnowledgeBasePath() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src;
      if (src.indexOf('concierge.js') !== -1) {
        return src.replace('concierge.js', 'famKnowledgeBase.json');
      }
    }
    return 'js/famKnowledgeBase.json';
  }

  function loadKnowledgeBase(callback) {
    var path = getKnowledgeBasePath();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          knowledgeBase = JSON.parse(xhr.responseText);
          kbReady = true;
        } catch (e) {
          knowledgeBase = [];
        }
      }
      if (callback) callback();
    };
    xhr.onerror = function () {
      if (callback) callback();
    };
    xhr.send();
  }

  /* === Time === */
  function getTimestamp() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  }

  function smoothScroll(el) {
    var target = el.scrollTopMax !== undefined ? el.scrollTopMax : el.scrollHeight - el.clientHeight;
    var start = el.scrollTop;
    var diff = target - start;
    var duration = 300;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      el.scrollTop = start + diff * ease;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* === Matching === */
  function tokenize(str) {
    return str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  }

  function computeScore(queryTokens, keywordList) {
    var score = 0;
    var matched = {};
    for (var t = 0; t < queryTokens.length; t++) {
      var qt = queryTokens[t];
      for (var k = 0; k < keywordList.length; k++) {
        var kw = keywordList[k].toLowerCase();
        if (matched[kw]) continue;
        if (qt === kw) {
          score += 3;
          matched[kw] = true;
        } else if (kw.indexOf(qt) === 0 || qt.indexOf(kw) === 0) {
          score += 2;
          matched[kw] = true;
        } else if (kw.indexOf(qt) > 0 || qt.indexOf(kw) > 0) {
          score += 1;
          matched[kw] = true;
        }
      }
    }
    return score;
  }

  function findBestMatch(query) {
    if (!kbReady || !knowledgeBase.length) return null;
    var tokens = tokenize(query);
    if (!tokens.length) return null;

    var bestScore = 0;
    var bestEntry = null;

    for (var i = 0; i < knowledgeBase.length; i++) {
      var entry = knowledgeBase[i];
      var score = computeScore(tokens, entry.keywords);
      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    }

    return bestScore >= 1 ? bestEntry : null;
  }

  function formatAnswer(text) {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }

  /* === Magnetic Button === */
  function initMagnetic(btn) {
    var bound = btn.getBoundingClientRect();
    var cx = bound.left + bound.width / 2;
    var cy = bound.top + bound.height / 2;
    function move(e) {
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 120) { btn.style.transform = ''; return; }
      var strength = 0.25;
      btn.style.transform = 'translate(' + (dx * strength) + 'px, ' + (dy * strength) + 'px) scale(1.08)';
    }
    function reset() { btn.style.transform = ''; }
    btn.addEventListener('mousemove', move);
    btn.addEventListener('mouseleave', reset);
  }

  function createSparkle() {
    var sparkle = document.createElement('div');
    sparkle.className = 'cq-sparkle';
    sparkle.innerHTML = '✦';
    var btn = document.getElementById('concierge-btn');
    if (btn) {
      btn.appendChild(sparkle);
      setTimeout(function () { if (sparkle.parentNode) sparkle.remove(); }, 1200);
    }
  }

  /* === UI === */
  function buildButton() {
    if (document.getElementById('concierge-btn')) return;
    var btn = document.createElement('button');
    btn.className = 'concierge-btn';
    btn.id = 'concierge-btn';
    btn.setAttribute('aria-label', 'Open FAM Concierge');
    btn.innerHTML = '<span class="cq-btn-icon">' +
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 2a10 10 0 0 0-7.07 17.07L3 22l3.93-1.93A10 10 0 1 0 12 2z"/>' +
        '<path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/>' +
        '<path d="M9 14c.83.67 1.95 1 3 1s2.17-.33 3-1"/>' +
      '</svg></span>' +
      '<span class="concierge-tooltip">Ask FAM</span>';
    document.body.appendChild(btn);
    initMagnetic(btn);
    btn.addEventListener('click', toggle);
    setInterval(createSparkle, 6000);
  }

  function buildPanel() {
    if (document.getElementById('concierge-panel')) return;
    var panel = document.createElement('div');
    panel.className = 'concierge-panel';
    panel.id = 'concierge-panel';

    var loading = document.createElement('div');
    loading.className = 'concierge-loading';
    loading.id = 'concierge-loading';
    loading.innerHTML =
      '<div class="concierge-loading-icon">🤖</div>' +
      '<div class="concierge-loading-bar"></div>';

    var header = document.createElement('div');
    header.className = 'concierge-header';
    header.innerHTML =
      '<div class="cq-avatar">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M12 2a10 10 0 0 0-7.07 17.07L3 22l3.93-1.93A10 10 0 1 0 12 2z"/>' +
          '<path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/>' +
          '<path d="M9 14c.83.67 1.95 1 3 1s2.17-.33 3-1"/>' +
        '</svg>' +
      '</div>' +
      '<div class="concierge-header-text">' +
        '<div class="concierge-header-title">FAM Concierge</div>' +
        '<div class="concierge-header-sub">' +
          '<span class="concierge-online-dot"></span>Your Personal Mountain Assistant' +
        '</div>' +
      '</div>' +
      '<button class="concierge-close" id="concierge-close" aria-label="Close"><span class="material-symbols-outlined">close</span></button>';

    var messages = document.createElement('div');
    messages.className = 'concierge-messages';
    messages.id = 'concierge-messages';

    var welcome = document.createElement('div');
    welcome.className = 'cq-msg-wrapper bot';
    welcome.id = 'concierge-welcome';
    welcome.style.display = 'none';
    var welcomeBubble = document.createElement('div');
    welcomeBubble.className = 'cq-msg bot';
    welcomeBubble.innerHTML = welcomeText;
    var welcomeTime = document.createElement('div');
    welcomeTime.className = 'cq-time';
    welcomeTime.textContent = getTimestamp();
    welcome.appendChild(welcomeBubble);
    welcome.appendChild(welcomeTime);

    var typing = document.createElement('div');
    typing.className = 'cq-typing';
    typing.id = 'concierge-typing';
    typing.innerHTML = '<span class="cq-typing-label">Searching</span><span></span><span></span><span></span>';

    messages.appendChild(welcome);
    messages.appendChild(typing);

    var chips = document.createElement('div');
    chips.className = 'concierge-chips';
    chips.id = 'concierge-chips';
    chips.style.display = 'none';
    chipLabels.forEach(function (c) {
      var chip = document.createElement('button');
      chip.className = 'concierge-chip';
      chip.innerHTML = '<span class="cq-chip-icon">' + c.icon + '</span>' + c.text;
      chip.addEventListener('click', function () { handleChip(c.text); });
      chips.appendChild(chip);
    });

    var inputArea = document.createElement('div');
    inputArea.className = 'concierge-input-area';
    inputArea.id = 'concierge-input-area';
    inputArea.style.display = 'none';
    inputArea.innerHTML =
      '<button class="cq-attach" disabled aria-label="Attach"><span class="material-symbols-outlined">attach_file</span></button>' +
      '<input type="text" class="concierge-input" id="concierge-input" placeholder="Ask anything about FAM..." autocomplete="off">' +
      '<button class="concierge-send" id="concierge-send" aria-label="Send"><span class="material-symbols-outlined">arrow_upward</span></button>';

    var footer = document.createElement('div');
    footer.className = 'concierge-footer';
    footer.textContent = 'Powered by FAM Concierge';

    panel.appendChild(loading);
    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(chips);
    panel.appendChild(inputArea);
    panel.appendChild(footer);
    document.body.appendChild(panel);

    document.getElementById('concierge-close').addEventListener('click', close);
    document.getElementById('concierge-send').addEventListener('click', send);
    document.getElementById('concierge-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') send();
    });
  }

  function showWelcome() {
    var welcome = document.getElementById('concierge-welcome');
    var chips = document.getElementById('concierge-chips');
    var inputArea = document.getElementById('concierge-input-area');
    if (welcome) welcome.style.display = 'flex';
    if (chips) chips.style.display = 'flex';
    if (inputArea) inputArea.style.display = 'flex';
    var msgs = document.getElementById('concierge-messages');
    if (msgs) smoothScroll(msgs);
  }

  function toggle() {
    if (isOpen) close(); else open();
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    var panel = document.getElementById('concierge-panel');
    panel.classList.add('open');
    var btn = document.getElementById('concierge-btn');
    if (btn) btn.classList.add('active');

    if (!hasLoaded) {
      setTimeout(function () {
        var loading = document.getElementById('concierge-loading');
        if (loading) loading.classList.add('hide');
        setTimeout(function () {
          if (loading) loading.style.display = 'none';
          showWelcome();
          hasLoaded = true;
          var inp = document.getElementById('concierge-input');
          if (inp) inp.focus();
        }, 500);
      }, 1000);
    } else {
      var inp = document.getElementById('concierge-input');
      setTimeout(function () { if (inp) inp.focus(); }, 350);
    }
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    document.getElementById('concierge-panel').classList.remove('open');
    var btn = document.getElementById('concierge-btn');
    if (btn) btn.classList.remove('active');
  }

  function addBotMessage(text) {
    var msgs = document.getElementById('concierge-messages');
    var wrapper = document.createElement('div');
    wrapper.className = 'cq-msg-wrapper bot';
    var bubble = document.createElement('div');
    bubble.className = 'cq-msg bot';
    bubble.innerHTML = formatAnswer(text);
    var time = document.createElement('div');
    time.className = 'cq-time';
    time.textContent = getTimestamp();
    wrapper.appendChild(bubble);
    wrapper.appendChild(time);
    msgs.appendChild(wrapper);
    smoothScroll(msgs);
  }

  function addUserMessage(text) {
    var msgs = document.getElementById('concierge-messages');
    var wrapper = document.createElement('div');
    wrapper.className = 'cq-msg-wrapper user';
    var bubble = document.createElement('div');
    bubble.className = 'cq-msg user';
    bubble.textContent = text;
    var time = document.createElement('div');
    time.className = 'cq-time';
    time.textContent = getTimestamp();
    wrapper.appendChild(bubble);
    wrapper.appendChild(time);
    msgs.appendChild(wrapper);
    smoothScroll(msgs);
  }

  function send() {
    var inp = document.getElementById('concierge-input');
    var text = inp.value.trim();
    if (!text) return;
    inp.value = '';

    addUserMessage(text);

    var typing = document.getElementById('concierge-typing');
    typing.classList.add('show');
    var msgs = document.getElementById('concierge-messages');
    smoothScroll(msgs);

    var delay = 600 + Math.random() * 600;

    setTimeout(function () {
      if (!kbReady && knowledgeBase.length === 0) {
        typing.classList.remove('show');
        addBotMessage(fallbackMsg);
        return;
      }

      var match = findBestMatch(text);
      typing.classList.remove('show');

      if (match) {
        addBotMessage(match.answer);
      } else {
        addBotMessage(fallbackMsg);
      }
    }, delay);
  }

  /* === Chip Response Builders === */
  function buildRecommendRoomHTML() {
    return '<div class="cq-rec">' +
      '<div class="cq-rec-title">Here are my recommendations based on who you\'re travelling with:</div>' +
      '<div class="cq-rec-grid">' +
        '<div class="cq-rec-card"><div class="cq-rec-label">\uD83D\uDC91 Couple</div><div class="cq-rec-room">Maina 1</div><div class="cq-rec-type">Private Room &middot; 2 Guests</div><div class="cq-rec-price">\u20B92,500 / night</div><a href="pages/rooms.html" class="cq-rec-btn">Book Now \u2192</a></div>' +
        '<div class="cq-rec-card"><div class="cq-rec-label">\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66 Family</div><div class="cq-rec-room">Flamingo 3</div><div class="cq-rec-type">Duplex &middot; 4 Guests</div><div class="cq-rec-price">\u20B96,000 / night</div><a href="pages/rooms.html" class="cq-rec-btn">Book Now \u2192</a></div>' +
        '<div class="cq-rec-card"><div class="cq-rec-label">\uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1 Friends</div><div class="cq-rec-room">Flamingo 1</div><div class="cq-rec-type">Duplex &middot; 4 Guests</div><div class="cq-rec-price">\u20B96,000 / night</div><a href="pages/rooms.html" class="cq-rec-btn">Book Now \u2192</a></div>' +
        '<div class="cq-rec-card"><div class="cq-rec-label">\uD83E\uDDB3 Solo Traveller</div><div class="cq-rec-room">Maina 2</div><div class="cq-rec-type">Private Room &middot; 2 Guests</div><div class="cq-rec-price">\u20B92,000 / night</div><a href="pages/rooms.html" class="cq-rec-btn">Book Now \u2192</a></div>' +
      '</div></div>';
  }

  function buildTripPlannerHTML() {
    return '<div class="cq-trip">' +
      '<div class="cq-trip-title">\uD83D\uDCC5 3-Day Jibhi Itinerary</div>' +
      '<div class="cq-trip-day"><div class="cq-trip-day-label">Day 1 &mdash; Arrival &amp; Settle In</div><div>Arrive, check in, relax. Evening walk to Jibhi Waterfall. Bonfire night at FAM.</div></div>' +
      '<div class="cq-trip-day"><div class="cq-trip-day-label">Day 2 &mdash; Jalori Pass &amp; Serolsar Lake</div><div>Morning drive to Jalori Pass (15 km). Trek 2 km to Serolsar Lake. Return for evening tea.</div></div>' +
      '<div class="cq-trip-day"><div class="cq-trip-day-label">Day 3 &mdash; Explore &amp; Depart</div><div>Visit Chehni Kothi tower. Quick stop at Mini Thailand. Depart after lunch.</div></div>' +
      '<div class="cq-trip-detail"><strong>Recommended Room:</strong> Flamingo 1 Duplex (\u20B96,000/night)</div>' +
      '<div class="cq-trip-detail"><strong>Estimated Budget:</strong> \u20B912,000&ndash;\u20B915,000 (2 nights + food + local travel)</div>' +
      '<a href="pages/rooms.html" class="cq-rec-btn">Book Now \u2192</a></div>';
  }

  function buildAttractionsHTML() {
    var cards = [
      { name:'Jibhi Waterfall', img:'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=80', dist:'500 m &middot; 5 min walk', desc:'The closest nature escape from FAM. Beautiful year-round cascade through village paths.' },
      { name:'Jalori Pass', img:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80', dist:'15 km &middot; 45 min drive', desc:'At 3,120 m, offers stunning panoramic Himalayan views. Best visited March&ndash;June or Sep&ndash;Nov.' },
      { name:'Serolsar Lake', img:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80', dist:'2 km trek from Jalori Pass', desc:'Alpine lake through forests of oak and rhododendron. Crystal-clear waters. Best May&ndash;Oct.' },
      { name:'Chehni Kothi', img:'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?w=400&q=80', dist:'8 km &middot; 25 min drive', desc:'Ancient tower with historic architecture in a heritage village. A step back in time.' },
      { name:'Mini Thailand', img:'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80', dist:'2 km &middot; 10 min drive', desc:'Hidden riverside paradise with crystal-blue waters. Perfect for a peaceful afternoon dip.' }
    ];
    var html = '<div class="cq-rec-title">\uD83D\uDCCD Places to Explore Near FAM</div><div class="cq-attractions">';
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      html += '<div class="cq-attr-card">' +
        '<div class="cq-attr-img" style="background-image:url(' + c.img + ')"></div>' +
        '<div class="cq-attr-info">' +
          '<div class="cq-attr-name">' + c.name + '</div>' +
          '<div class="cq-attr-meta">' + c.dist + '</div>' +
          '<div class="cq-attr-desc">' + c.desc + '</div>' +
        '</div></div>';
    }
    html += '</div>';
    return html;
  }

  function buildAmenitiesHTML() {
    var items = [
      '\uD83D\uDCF6 High-Speed Wi-Fi',
      '\uD83D\uDD25 Heater',
      '\uD83D\uDECF\uFE0F Electric Heating Blankets',
      '\uD83D\uDD25 Bonfire',
      '\uD83E\uDDF7 Laundry (On Demand)',
      '\uD83D\uDC54 Ironing (On Demand)',
      '\uD83D\uDE95 Cab Service (On Demand)',
      '\uD83E\uDEF1 Luggage Assistance (On Demand)',
      '\uD83E\uDDCD Trek Guide (On Demand)'
    ];
    var html = '<div class="cq-rec-title">\uD83D\uDEBF All Amenities at FAM</div><div class="cq-amenities">';
    for (var i = 0; i < items.length; i++) {
      html += '<div class="cq-amenity-item">' + items[i] + '</div>';
    }
    html += '</div>';
    return html;
  }

  function buildContactHTML() {
    return '<div class="cq-rec-title">\uD83D\uDCDE Get in Touch</div><div class="cq-contact">' +
      '<div class="cq-contact-row"><span class="cq-contact-lbl">Property Manager</span><span class="cq-contact-val">98765 75673</span></div>' +
      '<div class="cq-contact-row"><span class="cq-contact-lbl">Founder</span><span class="cq-contact-val">98773 81864</span></div>' +
      '<div class="cq-contact-row"><span class="cq-contact-lbl">Email</span><span class="cq-contact-val">flamingoaurmaina@gmail.com</span></div>' +
      '<div class="cq-contact-addr">Opposite Forest Rest House, Rashala, Jibhi, Himachal Pradesh 175123</div>' +
      '<div class="cq-contact-btns">' +
        '<a href="tel:9876575673" class="cq-contact-btn">Call Now</a>' +
        '<a href="mailto:flamingoaurmaina@gmail.com" class="cq-contact-btn">Email</a>' +
        '<a href="https://www.google.com/maps?q=31.5787944,77.3668959" target="_blank" class="cq-contact-btn">Get Directions</a>' +
      '</div></div>';
  }

  function respondWithDelay(responseFn) {
    var typing = document.getElementById('concierge-typing');
    typing.classList.add('show');
    var msgs = document.getElementById('concierge-messages');
    smoothScroll(msgs);
    var delay = 600 + Math.random() * 600;
    setTimeout(function () {
      typing.classList.remove('show');
      addBotMessage(responseFn());
    }, delay);
  }

  function handleChip(text) {
    var chips = document.querySelectorAll('.concierge-chip');
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].textContent.trim() === text) {
        chips[i].classList.add('cq-chip-active');
        (function (el) {
          setTimeout(function () { el.classList.remove('cq-chip-active'); }, 400);
        })(chips[i]);
        break;
      }
    }
    var actions = {
      'Recommend a Room': function () {
        addUserMessage('Recommend a room');
        respondWithDelay(buildRecommendRoomHTML);
      },
      'Plan My Trip': function () {
        addUserMessage('Plan my trip');
        respondWithDelay(buildTripPlannerHTML);
      },
      'Nearby Attractions': function () { respondWithDelay(buildAttractionsHTML); },
      'Amenities': function () { respondWithDelay(buildAmenitiesHTML); },
      'Wi-Fi': function () {
        respondWithDelay(function () {
          return 'Yes! We provide high-speed Wi-Fi throughout the property, making FAM perfect for remote work, streaming, and video calls.';
        });
      },
      'Bonfire': function () {
        respondWithDelay(function () {
          return 'Bonfire experiences are available on request during the evening, subject to weather conditions.';
        });
      },
      'Cafe Menu': function () {
        respondWithDelay(function () {
          return 'Our boutique caf\u00e9 serves freshly prepared comfort food, hot beverages, coffee, tea, snacks, and local favourites.';
        });
      },
      'Contact FAM': function () { respondWithDelay(buildContactHTML); }
    };
    var action = actions[text];
    if (action) action();
  }

  function init() {
    if (document.getElementById('concierge-btn')) return;

    loadKnowledgeBase(function () {
      buildButton();
      buildPanel();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) close();
    });
    document.addEventListener('click', function (e) {
      if (!isOpen) return;
      var panel = document.getElementById('concierge-panel');
      var btnEl = document.getElementById('concierge-btn');
      if (!panel || !btnEl) return;
      if (!panel.contains(e.target) && !btnEl.contains(e.target)) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
