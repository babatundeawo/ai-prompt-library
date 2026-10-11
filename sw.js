/* PromptOS service worker: makes the site work offline.
   Strategy: pre-store the app shell on install, then answer every request from
   the cache immediately and refresh it in the background (stale-while-revalidate).
   The deploy workflow replaces __BUILD__ with the commit id, so each release
   gets a fresh cache and old ones are deleted. */
const BUILD = '__BUILD__';
const CACHE = 'promptos-' + BUILD;

const SHELL = [
  './', 'index.html', 'library.html', 'favorites.html', 'about.html', '404.html',
  'manifest.webmanifest', 'favicon.ico',
  'css/tokens.css', 'css/base.css', 'css/layout.css', 'css/components.css', 'css/pages.css',
  'js/theme-init.js', 'js/data.js', 'js/constants.js', 'js/storage.js', 'js/fields.js', 'js/ui.js', 'js/theme.js',
  'js/cards.js', 'js/sheet.js', 'js/palette.js', 'js/nav.js', 'js/pwa.js',
  'js/home.js', 'js/library.js', 'js/favorites.js', 'js/about.js',
  'assets/fonts/geist-latin-wght-normal.woff2', 'assets/fonts/geist-mono-latin-wght-normal.woff2',
  'assets/fonts/instrument-serif-latin-400-normal.woff2', 'assets/fonts/instrument-serif-latin-400-italic.woff2',
  'assets/icons/favicon.svg', 'assets/icons/icon-192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('promptos-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
    const network = fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { event.waitUntil(network); return cached; }
    const res = await network;
    if (res) return res;
    if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
    return Response.error();
  })());
});
