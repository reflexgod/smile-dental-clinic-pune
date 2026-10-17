// Runs before first paint: enables reveal animations without a flash of content.
// If the main module fails to start within 3s, content is shown without animations.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  setTimeout(function () {
    if (!root.classList.contains('app-ready')) root.classList.remove('js');
  }, 3000);
})();
