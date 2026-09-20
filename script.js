(function () {
  'use strict';

  var weddingConfig = {
    coupleNames: { groom: 'Gagandeep', bride: 'Riya' },
    weddingDate: '2026-11-03',
    displayDate: '3 November 2026',
    countdownStartDate: '2026-07-02',
    assets: {
      logo: 'assets/wedding_logo.jpeg',
      coupleDefault: { bride: 'assets/Bride_wb.png', groom: 'assets/Groom_wb.png' }
    },
    /*
     * Extensible Event-Specific Timeline:
     * Easily add custom bride/groom or couple artwork for specific dates/events.
     * If no custom image is configured, falls back to coupleDefault.
     */
    weddingTimeline: [
      {
        date: '2026-11-01',
        type: 'haldi',
        title: 'Haldi Ceremony',
        brideImage: '', // e.g. 'assets/couple/bride-haldi.png'
        groomImage: '', // e.g. 'assets/couple/groom-haldi.png'
        coupleImage: ''
      },
      {
        date: '2026-11-02',
        type: 'sangeet',
        title: 'Sangeet & DJ',
        brideImage: '',
        groomImage: '',
        coupleImage: ''
      },
      {
        date: '2026-11-03',
        type: 'wedding',
        title: 'The Sacred Wedding',
        brideImage: '',
        groomImage: '',
        coupleImage: ''
      }
    ],
    googleMapsUrl: 'https://maps.app.goo.gl/2PMkmit66McSwjfk7?g_st=iw'
  };

  var intro = document.getElementById('intro');
  var ganesh = document.getElementById('ganeshHolder');
  var ganeshImg = document.getElementById('ganeshImg');
  var omButton = document.getElementById('omButton');
  var body = document.body;
  var track = document.getElementById('galleryTrack');
  var petalField = document.getElementById('petalField');
  var themeToggle = document.getElementById('themeToggle');
  var portraitFrame = document.getElementById('portraitCard') || document.getElementById('portraitFrame');

  var weddingDate = new Date(weddingConfig.weddingDate + 'T00:00:00');
  var countdownStartDate = new Date(weddingConfig.countdownStartDate + 'T00:00:00');
  var dateOverride = new URLSearchParams(window.location.search).get('weddingDate');
  var nowDate = dateOverride && /^\d{4}-\d{2}-\d{2}$/.test(dateOverride)
    ? new Date(dateOverride + 'T12:00:00')
    : new Date();

  var distanceMeter = document.querySelector('.wedding-distance');
  var daysValue = document.getElementById('days');
  var hoursValue = document.getElementById('hours');
  var minutesValue = document.getElementById('minutes');
  var secondsValue = document.getElementById('seconds');
  var distancePeople = document.querySelectorAll('.distance-person');

  var scratchCard = document.getElementById('scratchCard');
  var scratchCanvas = document.getElementById('scratchCanvas');
  var revealDateButton = document.getElementById('revealDateButton');
  var dateStorageKey = 'weddingDateRevealed';
  var lockedSections = document.querySelectorAll('.post-reveal');
  var introStarted = false;
  var isDateRevealed = false;

  // Redraw hook for scratch canvas when theme toggles
  var redrawScratchFoil = null;

  /* ============================================================
     THEME MANAGEMENT
  ============================================================= */
  function setTheme(isNight) {
    body.classList.toggle('night-theme', isNight);
    if (themeToggle) {
      themeToggle.setAttribute('aria-checked', isNight ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', isNight ? 'Switch original theme' : 'Switch night theme');
    }
    try {
      localStorage.setItem('weddingTheme', isNight ? 'night' : 'original');
    } catch (error) {
      // localStorage may be restricted in private browsing
    }
    if (redrawScratchFoil && !isDateRevealed) {
      redrawScratchFoil();
    }
  }

  function loadTheme() {
    var savedTheme = 'original';
    try {
      savedTheme = localStorage.getItem('weddingTheme') || 'original';
    } catch (error) {
      savedTheme = 'original';
    }
    setTheme(savedTheme === 'night');
  }

  loadTheme();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(!body.classList.contains('night-theme'));
    });
  }

  /* ============================================================
     DATE & TIMELINE HELPERS
  ============================================================= */
  function getIsoDate(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function getActiveArtworkPair(dateStr) {
    var matched = weddingConfig.weddingTimeline.find(function (item) {
      return item.date === dateStr;
    });

    if (matched && matched.brideImage && matched.groomImage) {
      return { bride: matched.brideImage, groom: matched.groomImage };
    }
    return weddingConfig.assets.coupleDefault;
  }

  function preloadCharacterStates() {
    weddingConfig.weddingTimeline.forEach(function (item) {
      if (item.brideImage) {
        var imgB = new Image();
        imgB.src = item.brideImage;
      }
      if (item.groomImage) {
        var imgG = new Image();
        imgG.src = item.groomImage;
      }
    });
  }

  /* ============================================================
     DYNAMIC GHIBLI BRIDE & GROOM POSITIONING
     Calculated from real-time countdown progression
  ============================================================= */
  function updateDistanceThread() {
    if (!distanceMeter) return;

    var totalDuration = weddingDate - countdownStartDate;
    var currentElapsed = nowDate - countdownStartDate;
    var progress = totalDuration > 0 ? currentElapsed / totalDuration : 0;
    progress = Math.max(0, Math.min(1, progress));

    distanceMeter.style.setProperty('--distance-progress', progress.toFixed(4));

    var todayIso = getIsoDate(nowDate);
    var artworkPair = getActiveArtworkPair(todayIso);

    distancePeople.forEach(function (person) {
      person.style.setProperty('--distance-progress', progress.toFixed(4));
      var role = person.classList.contains('distance-person-left') ? 'groom' : 'bride';
      var src = artworkPair[role] || weddingConfig.assets.coupleDefault[role];
      if (person.getAttribute('src') !== src) {
        person.src = src;
      }
    });
  }

  /* ============================================================
     COUNTDOWN TIMER
  ============================================================= */
  function updateCountdown() {
    var now = new Date();
    if (!dateOverride) nowDate = now;
    var diff = weddingDate - now;

    if (diff <= 0) {
      updateDistanceThread();
      if (daysValue) daysValue.textContent = '00';
      if (hoursValue) hoursValue.textContent = '00';
      if (minutesValue) minutesValue.textContent = '00';
      if (secondsValue) secondsValue.textContent = '00';
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysValue) daysValue.textContent = String(days).padStart(2, '0');
    if (hoursValue) hoursValue.textContent = String(hours).padStart(2, '0');
    if (minutesValue) minutesValue.textContent = String(minutes).padStart(2, '0');
    if (secondsValue) secondsValue.textContent = String(seconds).padStart(2, '0');

    updateDistanceThread();
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
  preloadCharacterStates();
  updateDistanceThread();

  /* ============================================================
     PETAL AMBIENCE
  ============================================================= */
  function createPetals() {
    if (!petalField) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var isSmallScreen = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    var petalCount = isSmallScreen ? 14 : 24;

    for (var i = 0; i < petalCount; i += 1) {
      var petal = document.createElement('span');
      var size = 12 + Math.random() * 13;
      var sway = (Math.random() * 180 - 90).toFixed(0) + 'px';
      var spin = (180 + Math.random() * 420).toFixed(0) + 'deg';
      var duration = (15 + Math.random() * 14).toFixed(2) + 's';
      var delay = (-Math.random() * 26).toFixed(2) + 's';
      var scale = (.72 + Math.random() * .62).toFixed(2);
      var opacity = (.42 + Math.random() * .32).toFixed(2);
      var tilt = (10 + Math.random() * 38).toFixed(0) + 'deg';
      var blur = Math.random() > .72 ? (.35 + Math.random() * .45).toFixed(2) + 'px' : '0px';

      petal.className = 'petal';
      petal.style.setProperty('--petal-left', (Math.random() * 100).toFixed(2) + 'vw');
      petal.style.setProperty('--petal-size', size.toFixed(1) + 'px');
      petal.style.setProperty('--petal-sway', sway);
      petal.style.setProperty('--petal-spin', spin);
      petal.style.setProperty('--petal-duration', duration);
      petal.style.setProperty('--petal-delay', delay);
      petal.style.setProperty('--petal-scale', scale);
      petal.style.setProperty('--petal-opacity', opacity);
      petal.style.setProperty('--petal-tilt', tilt);
      petal.style.setProperty('--petal-blur', blur);
      petalField.appendChild(petal);
    }
  }

  createPetals();

  if (track) {
    track.innerHTML += track.innerHTML;
  }

  /* ============================================================
     GANESHA OPENING SCREEN
  ============================================================= */
  function showGanesha() {
    if (ganesh) {
      ganesh.classList.add('glow');
      ganesh.classList.add('visible');
    }
    if (ganeshImg) {
      ganeshImg.classList.add('visible');
    }
  }

  if (ganeshImg) {
    ganeshImg.addEventListener('animationend', function (e) {
      if (e.animationName && (e.animationName.indexOf('ganeshaAppear') !== -1 || e.animationName.indexOf('medallionIn') !== -1)) {
        showGanesha();
      }
    }, { once: true });
  }
  setTimeout(showGanesha, 1800);

  // 3D Photo Flip
  if (portraitFrame) {
    portraitFrame.addEventListener('click', function () {
      portraitFrame.classList.toggle('is-flipped');
    });
  }

  /* ============================================================
     PROGRESSIVE INTRODUCTION ANIMATIONS
  ============================================================= */
  function beginIntroduction() {
    if (introStarted) return;
    introStarted = true;
    body.classList.add('typing-started');

    // Initialize scratch card so it's ready when scrolled into view
    initializeScratchCard();
  }

  document.querySelectorAll('.venue-map').forEach(function (link) {
    link.href = weddingConfig.googleMapsUrl;
  });
  document.querySelectorAll('#scratchDate, #revealedDate').forEach(function (dateElement) {
    dateElement.textContent = weddingConfig.displayDate;
  });

  if (omButton) {
    omButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (intro) {
        intro.classList.add('done');
      }
      body.classList.remove('locked');

      setTimeout(function () {
        if (intro) {
          intro.style.display = 'none';
        }
      }, 950);

      beginIntroduction();
    });
  }

  /* ============================================================
     UNLOCKED POST-REVEAL SECTIONS
  ============================================================= */
  function setRevealed() {
    isDateRevealed = true;
    body.classList.add('date-revealed');
    lockedSections.forEach(function (section) {
      section.inert = false;
      section.removeAttribute('aria-hidden');
    });
    try {
      localStorage.setItem(dateStorageKey, 'true');
    } catch (error) {}
    if (scratchCard) scratchCard.setAttribute('aria-hidden', 'true');
  }

  /* ============================================================
     AUTHENTIC CANVAS SCRATCH CARD
  ============================================================= */
  function initializeScratchCard() {
    if (!scratchCanvas || !scratchCard) return;
    var context = scratchCanvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var revealed = false;
    var scratching = false;
    var lastPoint = null;
    var strokeCount = 0;
    var bounds;

    function drawScratchSurface() {
      if (revealed) return;
      var ratio = window.devicePixelRatio || 1;
      bounds = scratchCanvas.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      scratchCanvas.width = Math.max(1, Math.floor(bounds.width * ratio));
      scratchCanvas.height = Math.max(1, Math.floor(bounds.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      var isNight = body.classList.contains('night-theme');
      var width = bounds.width;
      var height = bounds.height;

      // Base Metallic Foil Gradient (Theme-specific palettes)
      var foilGradient = context.createLinearGradient(0, 0, width, height);
      if (isNight) {
        foilGradient.addColorStop(0, '#0c2563');
        foilGradient.addColorStop(0.28, '#1b4a9b');
        foilGradient.addColorStop(0.52, '#edd08d');
        foilGradient.addColorStop(0.74, '#143884');
        foilGradient.addColorStop(1, '#051233');
      } else {
        foilGradient.addColorStop(0, '#df9f43');
        foilGradient.addColorStop(0.22, '#fff4cc');
        foilGradient.addColorStop(0.5, '#e4b05a');
        foilGradient.addColorStop(0.75, '#c98322');
        foilGradient.addColorStop(1, '#f7df99');
      }

      context.globalCompositeOperation = 'source-over';
      context.fillStyle = foilGradient;
      context.fillRect(0, 0, width, height);

      // Distinct Ornamental Pattern for each theme
      if (isNight) {
        // Celestial Starlight and Astral Grid
        context.globalAlpha = 0.22;
        context.strokeStyle = '#fff2cf';
        context.lineWidth = 1;
        var step = 14;
        for (var x = -height; x < width + height; x += step) {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x + height, height);
          context.stroke();
        }

        // Diamond constellation cross lines
        context.globalAlpha = 0.12;
        for (var y = -width; y < width + height; y += step * 1.5) {
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(width, y + width);
          context.stroke();
        }

        // Celestial Gold & Cyan inner rim
        context.globalAlpha = 0.65;
        context.strokeStyle = '#fde29f';
        context.lineWidth = 1.5;
        context.strokeRect(7, 7, width - 14, height - 14);

        // Constellation star accents
        context.globalAlpha = 0.85;
        context.font = '12px Cinzel, serif';
        context.fillStyle = '#ffdf93';
        context.fillText('✦', 18, 22);
        context.fillText('✦', width - 24, 22);
        context.fillText('✦', 18, height - 12);
        context.fillText('✦', width - 24, height - 12);
        context.fillText('✧', width / 2 - 80, height / 2 + 5);
        context.fillText('✧', width / 2 + 80, height / 2 + 5);

        // Typography
        context.globalAlpha = 0.98;
        context.fillStyle = '#fff7e0';
        context.font = 'bold 15px Cormorant Garamond, serif';
        context.textAlign = 'center';
        context.fillText('✦ Scratch to Reveal Date ✦', width / 2, height / 2 + 5);
      } else {
        // Light Theme: Traditional Royal Gold & Wine Filigree Lattice
        context.globalAlpha = 0.32;
        context.strokeStyle = '#ffffff';
        context.lineWidth = 1;
        var step = 10;
        for (var x = -height; x < width + height; x += step) {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x + height, height);
          context.stroke();
        }
        // Cross-hatch diamond lattice
        context.globalAlpha = 0.2;
        for (var x2 = width + height; x2 > -height; x2 -= step) {
          context.beginPath();
          context.moveTo(x2, 0);
          context.lineTo(x2 - height, height);
          context.stroke();
        }

        // Royal Wine & Gold Double Rim
        context.globalAlpha = 0.55;
        context.strokeStyle = '#6b1429';
        context.lineWidth = 1;
        context.strokeRect(6, 6, width - 12, height - 12);

        context.globalAlpha = 0.45;
        context.strokeStyle = '#ffffff';
        context.strokeRect(9, 9, width - 18, height - 18);

        // Ornamental Indian Paisley / Sparkle Corner Accents
        context.globalAlpha = 0.85;
        context.font = '12px Cinzel, serif';
        context.fillStyle = '#4a0e20';
        context.fillText('❖', 18, 22);
        context.fillText('❖', width - 24, 22);
        context.fillText('❖', 18, height - 12);
        context.fillText('❖', width - 24, height - 12);

        // Typography with high-contrast wine tone
        context.globalAlpha = 1;
        context.fillStyle = '#3a0c1a';
        context.font = 'bold 16px Cormorant Garamond, serif';
        context.textAlign = 'center';
        context.fillText('✦ Scratch to Reveal Date ✦', width / 2, height / 2 + 5);
      }

      context.globalAlpha = 1;
    }

    redrawScratchFoil = drawScratchSurface;

    function launchCelebrationSparkles() {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var card = document.getElementById('scratchCard');
      if (!card) return;
      var rect = card.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;

      var container = document.createElement('div');
      container.className = 'celebration-burst-container';
      document.body.appendChild(container);

      var glyphs = ['✦', '✧', '★', '❖', '❦', '✦', '✧'];
      var colorsLight = ['#d9a566', '#eccb8a', '#c98a2e', '#9c3455', '#5c1327', '#ffffff'];
      var colorsNight = ['#eccb8a', '#ffdf93', '#fff4d4', '#91adff', '#edd08d', '#ffffff'];
      var isNight = body.classList.contains('night-theme');
      var colors = isNight ? colorsNight : colorsLight;

      var particleCount = 38;
      for (var i = 0; i < particleCount; i++) {
        var particle = document.createElement('span');
        particle.className = 'celebration-particle';
        particle.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];

        var color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.color = color;

        var size = 11 + Math.random() * 15;
        particle.style.fontSize = size.toFixed(0) + 'px';

        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';

        var angle = Math.random() * Math.PI * 2;
        var distanceMid = 55 + Math.random() * 85;
        var distanceEnd = distanceMid + (35 + Math.random() * 75);

        var txMid = Math.cos(angle) * distanceMid;
        var tyMid = Math.sin(angle) * distanceMid - 25; // upward bounce

        var txEnd = Math.cos(angle) * distanceEnd + (Math.random() * 24 - 12);
        var tyEnd = Math.sin(angle) * distanceEnd + (50 + Math.random() * 70); // graceful fall

        var rotMid = (Math.random() * 360 - 180).toFixed(0) + 'deg';
        var rotEnd = (Math.random() * 720 - 360).toFixed(0) + 'deg';
        var duration = (1.9 + Math.random() * 0.7).toFixed(2) + 's';
        var delay = (Math.random() * 0.12).toFixed(2) + 's';

        particle.style.setProperty('--tx-mid', txMid.toFixed(0) + 'px');
        particle.style.setProperty('--ty-mid', tyMid.toFixed(0) + 'px');
        particle.style.setProperty('--tx-end', txEnd.toFixed(0) + 'px');
        particle.style.setProperty('--ty-end', tyEnd.toFixed(0) + 'px');
        particle.style.setProperty('--rot-mid', rotMid);
        particle.style.setProperty('--rot-end', rotEnd);
        particle.style.setProperty('--duration', duration);
        particle.style.setProperty('--delay', delay);

        container.appendChild(particle);
      }

      window.setTimeout(function () {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 2700);
    }

    function triggerReveal() {
      if (revealed) return;
      revealed = true;
      scratchCanvas.classList.add('is-cleared');
      launchCelebrationSparkles();

      if (reducedMotion) {
        setRevealed();
      } else {
        window.setTimeout(setRevealed, 550);
      }
    }

    function eraseAt(x, y) {
      context.globalCompositeOperation = 'destination-out';
      context.beginPath();
      context.arc(x, y, 24, 0, Math.PI * 2);
      context.fill();
    }

    function interpolateStroke(p1, p2) {
      var dx = p2.x - p1.x;
      var dy = p2.y - p1.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var steps = Math.max(1, Math.floor(dist / 6));
      for (var i = 0; i <= steps; i++) {
        var t = i / steps;
        eraseAt(p1.x + dx * t, p1.y + dy * t);
      }
    }

    function checkScratchProgress() {
      var width = scratchCanvas.width;
      var height = scratchCanvas.height;
      if (width === 0 || height === 0) return;

      var imgData = context.getImageData(0, 0, width, height).data;
      var transparentCount = 0;
      var sampleStep = 16;
      var totalSamples = 0;

      for (var i = 3; i < imgData.length; i += 4 * sampleStep) {
        totalSamples++;
        if (imgData[i] < 45) {
          transparentCount++;
        }
      }

      if (totalSamples > 0) {
        var percentage = transparentCount / totalSamples;
        // Reveal threshold ~58% (meets the 55-70% requirement)
        if (percentage >= 0.58) {
          triggerReveal();
        }
      }
    }

    function getCoords(event) {
      var clientX = event.clientX;
      var clientY = event.clientY;
      if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      }
      bounds = scratchCanvas.getBoundingClientRect();
      return {
        x: clientX - bounds.left,
        y: clientY - bounds.top
      };
    }

    function onPointerDown(event) {
      if (revealed) return;
      scratching = true;
      try {
        scratchCanvas.setPointerCapture(event.pointerId);
      } catch (e) {}

      var pt = getCoords(event);
      lastPoint = pt;
      eraseAt(pt.x, pt.y);
    }

    function onPointerMove(event) {
      if (!scratching || revealed) return;
      var pt = getCoords(event);

      if (lastPoint) {
        interpolateStroke(lastPoint, pt);
      } else {
        eraseAt(pt.x, pt.y);
      }
      lastPoint = pt;
      strokeCount++;

      if (strokeCount % 6 === 0) {
        checkScratchProgress();
      }
    }

    function onPointerUp() {
      if (!scratching) return;
      scratching = false;
      lastPoint = null;
      checkScratchProgress();
    }

    drawScratchSurface();
    window.addEventListener('resize', drawScratchSurface);

    scratchCanvas.addEventListener('pointerdown', onPointerDown);
    scratchCanvas.addEventListener('pointermove', onPointerMove);
    scratchCanvas.addEventListener('pointerup', onPointerUp);
    scratchCanvas.addEventListener('pointercancel', onPointerUp);

    // Prevent page scroll only while dragging inside the canvas
    scratchCanvas.addEventListener('touchmove', function (event) {
      if (scratching) {
        event.preventDefault();
      }
    }, { passive: false });

    if (revealDateButton) {
      revealDateButton.addEventListener('click', triggerReveal);
    }

    try {
      if (localStorage.getItem(dateStorageKey) === 'true') {
        setRevealed();
      }
    } catch (error) {}
  }

  // Initial locking of post-reveal sections
  lockedSections.forEach(function (section) {
    section.inert = true;
    section.setAttribute('aria-hidden', 'true');
  });
})();