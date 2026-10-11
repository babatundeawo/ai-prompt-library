/* ============================================================
   PromptOS: shared UI helpers
   Toasts, modal dialogs, clipboard, scroll reveals, pointer glow,
   animated counters.
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');

  /* ---------- Toasts ---------- */
  function region() {
    let r = document.getElementById('toastRegion');
    if (!r) {
      r = document.createElement('div');
      r.id = 'toastRegion';
      r.className = 'toast-region';
      r.setAttribute('popover', 'manual');
      r.setAttribute('role', 'status');
      r.setAttribute('aria-live', 'polite');
      document.body.appendChild(r);
    }
    return r;
  }
  /* Toasts live in the browser's top layer so they stay visible above open dialogs. */
  function raise(r) {
    try { r.hidePopover(); r.showPopover(); } catch { /* popover API unavailable: z-index is enough */ }
  }

  function toast(message, opts) {
    const o = opts || {};
    const el = document.createElement('div');
    el.className = 'toast' + (o.type === 'error' ? ' toast--error' : '');
    el.innerHTML = PS.ui(o.type === 'error' ? 'x' : 'check') + '<span></span>';
    el.querySelector('span').textContent = message;
    if (o.action) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = o.action.label;
      b.addEventListener('click', () => { o.action.onClick(); dismiss(); });
      el.appendChild(b);
    }
    const r = region();
    while (r.children.length > 2) r.firstChild.remove();
    r.appendChild(el);
    raise(r);
    let timer = setTimeout(dismiss, o.duration || (o.action ? 8000 : 2600));
    function dismiss() {
      clearTimeout(timer);
      if (!el.isConnected) return;
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 220);
    }
    return dismiss;
  }

  /* ---------- Dialogs ---------- */
  let openCount = 0;
  function syncScrollLock() { document.documentElement.classList.toggle('modal-open', openCount > 0); }

  function openDialog(dlg) {
    if (dlg.open) return;
    dlg.classList.remove('is-closing');
    dlg.showModal();
    openCount++; syncScrollLock();
  }

  function finishClose(dlg) {
    dlg.classList.remove('is-closing');
    if (dlg.open) dlg.close();
  }

  function closeDialog(dlg) {
    if (!dlg.open || dlg.classList.contains('is-closing')) return;
    if (reduceMotion.matches) { finishClose(dlg); return; }
    dlg.classList.add('is-closing');
    let done = false;
    const end = () => { if (done) return; done = true; finishClose(dlg); };
    dlg.addEventListener('animationend', function h(e) {
      if (e.target !== dlg) return;
      dlg.removeEventListener('animationend', h);
      end();
    });
    setTimeout(end, 320);   /* safety net if animationend never fires */
  }

  /* Wire a dialog once: Esc, backdrop click, scroll-lock bookkeeping. */
  function wireDialog(dlg, onClose) {
    dlg.addEventListener('cancel', e => { e.preventDefault(); closeDialog(dlg); });
    let downOnBackdrop = false;
    dlg.addEventListener('pointerdown', e => { downOnBackdrop = e.target === dlg; });
    dlg.addEventListener('click', e => { if (e.target === dlg && downOnBackdrop) closeDialog(dlg); });
    dlg.addEventListener('close', () => {
      openCount = Math.max(0, openCount - 1); syncScrollLock();
      if (onClose) onClose();
    });
  }

  /* ---------- Clipboard ---------- */
  function copyText(text) {
    const fallback = () => new Promise(resolve => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      let ok;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      resolve(ok);
    });
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => true, fallback);
    }
    return fallback();
  }

  /* Briefly flip a button into a "done" state. */
  function flash(btn, doneLabel) {
    if (!btn || btn.classList.contains('is-done')) return;
    const label = btn.querySelector('[data-label]');
    const prevHtml = btn.innerHTML;
    const prevTip = btn.getAttribute('data-tip');
    btn.classList.add('is-done');
    if (label) label.textContent = doneLabel || 'Copied';
    else { btn.innerHTML = PS.ui('check'); if (prevTip) btn.setAttribute('data-tip', doneLabel || 'Copied'); }
    setTimeout(() => {
      btn.classList.remove('is-done');
      btn.innerHTML = prevHtml;
      if (prevTip) btn.setAttribute('data-tip', prevTip);
    }, 1800);
  }

  /* ---------- Scroll reveals ---------- */
  let io = null;
  function reveal(root) {
    const scope = root || document;
    const items = scope.querySelectorAll('[data-reveal]:not(.in)');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      items.forEach(el => el.classList.add('in'));
      return;
    }
    if (!io) {
      io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    scope.querySelectorAll('[data-stagger]').forEach(group => {
      Array.from(group.querySelectorAll(':scope > [data-reveal]')).forEach((el, i) => el.style.setProperty('--i', Math.min(i, 8)));
    });
    items.forEach(el => io.observe(el));
  }

  /* ---------- Pointer glow on cards and tiles (mouse only) ---------- */
  function initGlow() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    let raf = 0, last = null;
    document.addEventListener('pointermove', e => {
      const t = e.target.closest && e.target.closest('.card, .tile');
      if (!t) return;
      last = { t, x: e.clientX, y: e.clientY };
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = last.t.getBoundingClientRect();
        last.t.style.setProperty('--mx', (last.x - r.left) + 'px');
        last.t.style.setProperty('--my', (last.y - r.top) + 'px');
      });
    }, { passive: true });
  }

  /* ---------- Animated counters ---------- */
  function countUp(el, target, suffix) {
    const text = n => String(n) + (suffix || '');
    if (reduceMotion.matches || !('IntersectionObserver' in window)) { el.textContent = text(target); return; }
    el.textContent = text(0);
    const obs = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return;
      obs.disconnect();
      const t0 = performance.now(), dur = 900;
      (function tick(now) {
        const k = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = text(Math.round(target * eased));
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    });
    obs.observe(el);
  }

  /* Show the right modifier key on every <kbd data-mod>. */
  function setModifierKeys() {
    document.querySelectorAll('[data-mod]').forEach(k => { k.textContent = isMac ? '⌘' : 'Ctrl'; });
  }

  function debounce(fn, ms) { let t; return function () { const a = arguments; clearTimeout(t); t = setTimeout(() => fn.apply(null, a), ms); }; }

  initGlow();

  window.PS = Object.assign(window.PS || {}, {
    isMac, reduceMotion, toast, openDialog, closeDialog, wireDialog, copyText, flash, reveal, countUp, setModifierKeys, debounce
  });
})();
