/* ============================================================
   PromptOS: browser storage
   Favourites, recent prompts and small preferences. Everything
   stays in this browser. If storage is blocked (private mode,
   strict settings) the app keeps working in memory only.
   Keys are unchanged from earlier versions so saved favourites carry over.
   ============================================================ */
(function () {
  'use strict';

  const KEYS = { favorites: 'promptos:favorites', recent: 'promptos:recent', view: 'promptos:view', theme: 'promptos:theme' };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }

  /* ---------- Favourites ---------- */
  const favs = new Set((read(KEYS.favorites, []) || []).filter(Number.isFinite));
  const listeners = new Set();
  function notify() { listeners.forEach(fn => fn(favs)); }

  const FAVORITES = {
    has: id => favs.has(id),
    size: () => favs.size,
    all: () => Array.from(favs),
    toggle(id) {
      if (favs.has(id)) favs.delete(id); else favs.add(id);
      write(KEYS.favorites, Array.from(favs));
      notify();
      return favs.has(id);
    },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  };

  /* Keep other open tabs in sync. */
  window.addEventListener('storage', e => {
    if (e.key !== KEYS.favorites) return;
    favs.clear();
    (read(KEYS.favorites, []) || []).filter(Number.isFinite).forEach(id => favs.add(id));
    notify();
  });

  /* ---------- Recently opened prompts (newest first, max 6) ---------- */
  const RECENT = {
    all: () => (read(KEYS.recent, []) || []).filter(Number.isFinite),
    push(id) {
      const next = [id].concat(RECENT.all().filter(x => x !== id)).slice(0, 6);
      write(KEYS.recent, next);
    }
  };

  /* ---------- Simple preferences ---------- */
  const PREFS = {
    get: (name, fallback) => read(KEYS[name], fallback),
    set: (name, value) => write(KEYS[name], value)
  };

  window.PS = Object.assign(window.PS || {}, { FAVORITES, RECENT, PREFS, KEYS });
})();
