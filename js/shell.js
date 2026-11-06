/* ============================================================
   PromptOS: app shell
   - Install prompt: a quiet banner on Chrome and Android, and a short
     illustrated guide for iPhone and iPad (Safari has no install event).
   - Offline indicator: says plainly when the connection is gone.
   - Back-to-top button on long pages.
   - Opens every FAQ answer when the page is printed.
   Everything here is optional: the site works without it.
   ============================================================ */
(function () {
  'use strict';

  const DISMISS_KEY = 'promptos:install-dismissed';
  const DISMISS_DAYS = 30;
  const SHOW_AFTER_MS = 20000;

  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standaloneQuery = window.matchMedia('(display-mode: standalone)');
  const isStandalone = () => standaloneQuery.matches || navigator.standalone === true;

  let deferred = null;       /* the browser's install prompt, when it offers one */
  let banner = null;
  let guide = null;
  let shown = false;

  /* ---------- Remembering "Not now" ---------- */
  function dismissedRecently() {
    try {
      const t = Number(localStorage.getItem(DISMISS_KEY));
      return t > 0 && Date.now() - t < DISMISS_DAYS * 864e5;
    } catch { return false; }
  }
  function rememberDismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* storage blocked: it may show again next visit */ }
  }

  /* ---------- Install: browser prompt or iOS guide ---------- */
  function canInstall() { return !isStandalone() && (!!deferred || isIOS); }

  function runInstall() {
    if (deferred) {
      const ev = deferred;
      deferred = null;
      ev.prompt();
      ev.userChoice.then(choice => {
        hideBanner();
        if (choice && choice.outcome === 'dismissed') rememberDismiss();
      }).catch(() => hideBanner());
    } else if (isIOS) {
      openGuide();
    }
  }

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferred = e;
    scheduleBanner();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    hideBanner();
    PS.toast('PromptOS is installed.');
  });

  /* ---------- The banner ---------- */
  function scheduleBanner() {
    if (shown || isStandalone() || dismissedRecently()) return;
    shown = true;
    setTimeout(function tryShow() {
      /* Never interrupt an open dialog or a hidden tab. */
      if (document.visibilityState !== 'visible' || document.querySelector('dialog[open]')) { setTimeout(tryShow, 8000); return; }
      if (!canInstall()) return;
      showBanner();
    }, SHOW_AFTER_MS);
  }

  function showBanner() {
    if (banner) return;
    const ios = !deferred && isIOS;
    banner = document.createElement('aside');
    banner.className = 'install-banner';
    banner.setAttribute('aria-label', 'Install PromptOS');
    banner.innerHTML =
      '<img src="assets/icons/icon-192.png" alt="" width="48" height="48"/>' +
      '<div class="install-copy"><strong>Install PromptOS</strong>' +
      '<span>' + (ios ? 'Add it to your Home Screen to open it like an app, even offline.' : 'Open it like an app, even offline.') + '</span></div>' +
      '<div class="install-actions">' +
      '<button type="button" class="btn btn--primary btn--sm" data-install-go>' + (ios ? 'Show me how' : 'Install') + '</button>' +
      '<button type="button" class="btn btn--ghost btn--sm" data-install-no>Not now</button>' +
      '</div>';
    banner.querySelector('[data-install-go]').addEventListener('click', () => { hideBanner(); runInstall(); });
    banner.querySelector('[data-install-no]').addEventListener('click', () => { rememberDismiss(); hideBanner(); });
    document.body.appendChild(banner);
    document.documentElement.classList.add('has-install-banner');
  }

  function hideBanner() {
    if (!banner) return;
    banner.remove();
    banner = null;
    document.documentElement.classList.remove('has-install-banner');
  }

  /* ---------- iPhone and iPad guide ---------- */
  function buildGuide() {
    const shareIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
    const addIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
    const doneIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 12.5 5 5 10-11"/></svg>';
    const dlg = document.createElement('dialog');
    dlg.className = 'ios-guide';
    dlg.setAttribute('aria-labelledby', 'iosGuideTitle');
    dlg.innerHTML =
      '<div class="ios-guide-body">' +
      '<div class="ios-guide-head"><h2 id="iosGuideTitle">Add PromptOS to your Home Screen</h2>' +
      '<button type="button" class="icon-btn" data-ios-close aria-label="Close">' + PS.ui('x') + '</button></div>' +
      '<p class="ios-guide-lede">Open this page in Safari, then follow three steps. iPhone and iPad work the same way.</p>' +
      '<ol class="ios-steps">' +
      '<li><span class="ios-ico">' + shareIcon + '</span><div><strong>Tap the Share button</strong><span>The square with an arrow pointing up. On iPhone it is at the bottom of Safari; on iPad it is at the top.</span></div></li>' +
      '<li><span class="ios-ico">' + addIcon + '</span><div><strong>Choose Add to Home Screen</strong><span>Scroll down the list of actions if you do not see it.</span></div></li>' +
      '<li><span class="ios-ico">' + doneIcon + '</span><div><strong>Tap Add</strong><span>PromptOS now sits on your Home Screen and opens full screen, even with no signal.</span></div></li>' +
      '</ol>' +
      '<button type="button" class="btn btn--primary" data-ios-close>Got it</button>' +
      '</div>';
    dlg.querySelectorAll('[data-ios-close]').forEach(b => b.addEventListener('click', () => PS.closeDialog(dlg)));
    PS.wireDialog(dlg);
    document.body.appendChild(dlg);
    return dlg;
  }

  function openGuide() {
    if (!guide) guide = buildGuide();
    PS.openDialog(guide);
  }

  /* Used by the command palette. */
  PS.install = {
    available: canInstall,
    label: () => (deferred ? 'Install PromptOS as an app' : 'Add PromptOS to your Home Screen'),
    run: runInstall
  };

  if (isIOS) scheduleBanner();

  /* ---------- Offline indicator ---------- */
  let netBar = null;
  function showOffline() {
    if (netBar) return;
    netBar = document.createElement('div');
    netBar.className = 'net-status';
    netBar.setAttribute('role', 'status');
    netBar.textContent = 'You are offline. The library and your favourites still work.';
    document.body.appendChild(netBar);
  }
  function hideOffline(announce) {
    if (!netBar) return;
    netBar.remove();
    netBar = null;
    if (announce) PS.toast('Back online.');
  }
  window.addEventListener('offline', showOffline);
  window.addEventListener('online', () => hideOffline(true));
  if (navigator.onLine === false) showOffline();

  /* ---------- Back to top ---------- */
  const topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.className = 'to-top';
  topBtn.hidden = true;
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.innerHTML = PS.ui('arrow');
  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: PS.reduceMotion.matches ? 'auto' : 'smooth' });
    const main = document.getElementById('main');
    if (main) { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
  });
  document.body.appendChild(topBtn);

  let ticking = false;
  function onScroll() {
    ticking = false;
    topBtn.hidden = (window.scrollY || 0) < window.innerHeight * 1.5;
  }
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  /* ---------- Printing: open every FAQ answer, then restore ---------- */
  const reopened = [];
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('details:not([open])').forEach(d => { d.open = true; reopened.push(d); });
  });
  window.addEventListener('afterprint', () => {
    while (reopened.length) reopened.pop().open = false;
  });
})();
