(function () {
  var intro = document.getElementById('intro');
  var ganesh = document.getElementById('ganeshHolder');
  var omButton = document.getElementById('omButton');
  var body = document.body;
  var track = document.getElementById('galleryTrack');
  
  // Kept your original reference, added a check for the new card ID structure
  var portraitFrame = document.getElementById('portraitCard') || document.getElementById('portraitFrame');
  
  var weddingDate = new Date('2026-11-03T00:00:00');
  var countdownStartDate = new Date('2026-07-02T00:00:00');
  var distanceMeter = document.querySelector('.wedding-distance');
  var daysValue = document.getElementById('days');
  var hoursValue = document.getElementById('hours');
  var minutesValue = document.getElementById('minutes');
  var secondsValue = document.getElementById('seconds');

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
