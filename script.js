(function () {
  var intro = document.getElementById('intro');
  var ganesh = document.getElementById('ganeshHolder');
  var omButton = document.getElementById('omButton');
  var body = document.body;
  var track = document.getElementById('galleryTrack');
  var petalField = document.getElementById('petalField');
  var themeToggle = document.getElementById('themeToggle');
  
  // Kept your original reference, added a check for the new card ID structure
  var portraitFrame = document.getElementById('portraitCard') || document.getElementById('portraitFrame');
  
  var weddingDate = new Date('2026-11-03T00:00:00');
  var countdownStartDate = new Date('2026-07-02T00:00:00');
  var distanceMeter = document.querySelector('.wedding-distance');
  var daysValue = document.getElementById('days');
  var hoursValue = document.getElementById('hours');
  var minutesValue = document.getElementById('minutes');
  var secondsValue = document.getElementById('seconds');
  function setTheme(isNight) {
    body.classList.toggle('night-theme', isNight);
    if (themeToggle) {
      themeToggle.setAttribute('aria-checked', isNight ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', isNight ? 'Switch original theme' : 'Switch night theme');
    }
    try {
      localStorage.setItem('weddingTheme', isNight ? 'night' : 'original');
    } catch (error) {
      // localStorage can be unavailable in some privacy modes.
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

  function updateDistanceThread(diff) {
    if (!distanceMeter) return;

    var total = weddingDate - countdownStartDate;
    var progress = total > 0 ? diff / total : 0;
    progress = Math.max(0, Math.min(1, progress));
    distanceMeter.style.setProperty('--distance-progress', progress.toFixed(4));
  }

  function updateCountdown() {
    var now = new Date();
    var diff = weddingDate - now;

    if (diff <= 0) {
      updateDistanceThread(0);
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
    updateDistanceThread(diff);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
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

  // Give the Ganesha medallion a soft golden glow once its entrance
  // animation has finished.
  // Ensure the medallion becomes visible and then glow continuously until Om is clicked.
  var ganeshImg = document.getElementById('ganeshImg');

  function showGanesha() {
    if (ganesh) {
      ganesh.classList.add('glow');
      ganesh.classList.add('visible');
    }
    if (ganeshImg) {
      ganeshImg.classList.add('visible');
    }
  }

  // If the image animation ends, mark visible immediately; otherwise fall back to timeout.
  if (ganeshImg) {
    ganeshImg.addEventListener('animationend', function (e) {
      // only react to the entrance animation
      if (e.animationName && (e.animationName.indexOf('ganeshaAppear') !== -1 || e.animationName.indexOf('medallionIn') !== -1)) {
        showGanesha();
      }
    }, { once: true });
  }

  // Fallback in case animationend doesn't fire
  setTimeout(showGanesha, 1800);

  // Updated smoothly to toggle the flip on whichever element is active
  if (portraitFrame) {
    portraitFrame.addEventListener('click', function () {
      portraitFrame.classList.toggle('is-flipped');
    });
  }

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
    });
  }
})();
