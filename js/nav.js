/* ============================================================
   PromptOS: site header and mobile menu
   Compact-on-scroll header with a reading-progress line, favourites
   counter, and the full-screen mobile menu. The header markup itself
   lives in each HTML page so it works before JavaScript loads.
   ============================================================ */
(function () {
  'use strict';

  const header = document.getElementById('siteHeader');

  /* ---------- Scroll state + progress line ---------- */
  function onScroll() {
    if (!header) return;
    const y = window.scrollY || 0;
    header.classList.toggle('is-scrolled', y > 8);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty('--progress', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
  }
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; onScroll(); });
  }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- Favourites counter ---------- */
  function paintFavCount() {
    const n = PS.FAVORITES.size();
    document.querySelectorAll('[data-fav-count]').forEach(el => {
      el.textContent = n;
      el.setAttribute('data-zero', String(n === 0));
      el.setAttribute('aria-label', PS.plural(n, 'saved prompt'));
    });
  }
  PS.FAVORITES.onChange(paintFavCount);
  paintFavCount();

  /* ---------- Mobile menu ---------- */
  const menu = document.getElementById('menuDialog');
  if (menu) {
    PS.wireDialog(menu);
    document.addEventListener('click', e => {
      if (e.target.closest('[data-open-menu]')) PS.openDialog(menu);
      else if (e.target.closest('[data-close-menu]')) PS.closeDialog(menu);
      else if (menu.open && e.target.closest('#menuDialog a')) PS.closeDialog(menu);
    });
    /* If the window grows past the mobile breakpoint, drop the menu. */
    window.matchMedia('(min-width: 881px)').addEventListener('change', e => { if (e.matches && menu.open) PS.closeDialog(menu); });
  }

  PS.setModifierKeys();
  PS.reveal();
})();
