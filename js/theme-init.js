/* Runs before first paint (loaded synchronously in <head>) so the saved theme
   is applied with no flash, and so CSS can tell that JavaScript is running. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  try {
    var saved = localStorage.getItem('promptos:theme');
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch { /* storage blocked: follow the system setting */ }
})();
