/* ============================================================
   PromptOS: light / dark theme
   Follows the system setting until the visitor picks a theme with the
   toggle; the choice is remembered. (js/theme-init.js applies it
   before first paint, so there is no flash.)
   ============================================================ */
(function () {
  'use strict';

  const root = document.documentElement;
  const KEY = 'promptos:theme';
  const dark = window.matchMedia('(prefers-color-scheme: dark)');

  function effective() {
    const forced = root.getAttribute('data-theme');
    return forced || (dark.matches ? 'dark' : 'light');
  }

  function syncChrome() {
    const mode = effective();
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => {
      m.setAttribute('content', mode === 'dark' ? '#0F0E0B' : '#FBF9F5');
      m.removeAttribute('media');
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(b => {
      const next = mode === 'dark' ? 'light' : 'dark';
      b.setAttribute('aria-label', 'Switch to ' + next + ' theme');
      b.setAttribute('data-tip', 'Switch to ' + next + ' theme');
    });
  }

  function set(mode) {
    root.classList.add('theme-fade');
    if (mode === 'light' || mode === 'dark') {
      root.setAttribute('data-theme', mode);
      try { localStorage.setItem(KEY, mode); } catch { /* blocked: choice lasts for this visit */ }
    } else {
      root.removeAttribute('data-theme');
      try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    }
    syncChrome();
    setTimeout(() => root.classList.remove('theme-fade'), 450);
  }

  function toggle() { set(effective() === 'dark' ? 'light' : 'dark'); }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-theme-toggle]')) toggle();
  });
  dark.addEventListener('change', syncChrome);
  window.addEventListener('storage', e => {
    if (e.key !== KEY) return;
    if (e.newValue === 'light' || e.newValue === 'dark') root.setAttribute('data-theme', e.newValue);
    else root.removeAttribute('data-theme');
    syncChrome();
  });

  syncChrome();
  window.PS = Object.assign(window.PS || {}, { theme: { set, toggle, effective } });
})();
