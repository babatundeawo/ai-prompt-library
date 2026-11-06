/* ============================================================
   PromptOS: offline support and updates
   Registers the service worker (sw.js) so the whole library works
   offline after the first visit. When a newer version has been
   downloaded in the background, shows a "Reload" message and only
   switches versions when the visitor asks for it.
   ============================================================ */
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;
  const secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!secure) return;

  const hadController = !!navigator.serviceWorker.controller;
  let reloadRequested = false;
  let announced = false;

  /* Reload only when this tab asked for the update, never behind the visitor's back. */
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && reloadRequested) location.reload();
  });

  function announce(worker) {
    if (announced) return;
    announced = true;
    PS.toast('A new version is ready.', {
      action: { label: 'Reload', onClick: () => { reloadRequested = true; worker.postMessage({ type: 'SKIP_WAITING' }); } },
      duration: 15000
    });
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { scope: './' }).then(reg => {
      if (reg.waiting && navigator.serviceWorker.controller) announce(reg.waiting);

      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) announce(worker);
        });
      });

      /* Look for a new release when the app is reopened or comes back into view. */
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => { /* offline: try again later */ });
      });
    }).catch(() => { /* offline mode simply stays off */ });
  });
})();
