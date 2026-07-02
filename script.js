(function () {
  var intro = document.getElementById('intro');
  var ganesh = document.getElementById('ganeshHolder');
  var omButton = document.getElementById('omButton');
  var body = document.body;
  var track = document.getElementById('galleryTrack');

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