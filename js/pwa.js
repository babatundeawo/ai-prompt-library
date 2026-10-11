/* ============================================================
   PromptOS: offline support
   Registers the service worker (sw.js) so the whole library works
   offline after the first visit, and offers a reload when a newer
   version of the site has been downloaded in the background.
   ============================================================ */
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;
  const secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!secure) return;

  const hadController = !!navigator.serviceWorker.controller;
  let notified = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || notified) return;   /* first install is not an update */
    notified = true;
    PS.toast('A new version is ready.', { action: { label: 'Reload', onClick: () => location.reload() }, duration: 12000 });
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => { /* offline mode simply stays off */ });
  });
})();
