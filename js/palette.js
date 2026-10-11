/* ============================================================
   PromptOS: command palette
   Ctrl/Cmd + K from any page. Search every prompt, jump to a page or
   category, switch theme. Built on first use. Uses the ARIA combobox
   pattern so screen readers hear the active result.
   ============================================================ */
(function () {
  'use strict';

  let dlg = null, input = null, list = null;
  let items = [];       /* flat list of rendered, selectable items */
  let active = 0;
  let installPrompt = null;

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; });
  window.addEventListener('appinstalled', () => { installPrompt = null; });

  const PAGES = [
    { title: 'Home', href: 'index.html', icon: 'home' },
    { title: 'Prompt library', href: 'library.html', icon: 'library' },
    { title: 'Favourites', href: 'favorites.html', icon: 'star' },
    { title: 'About and shortcuts', href: 'about.html', icon: 'info' }
  ];

  function actions() {
    const dark = PS.theme.effective() === 'dark';
    const a = [{ title: 'Switch to ' + (dark ? 'light' : 'dark') + ' theme', icon: dark ? 'sun' : 'moon', run: () => PS.theme.toggle() }];
    if (document.documentElement.hasAttribute('data-theme')) a.push({ title: 'Use my system theme', icon: 'sun', run: () => PS.theme.set('system') });
    if (installPrompt) a.push({ title: 'Install PromptOS as an app', icon: 'download', run: () => installPrompt.prompt() });
    return a;
  }

  /* ---------- Build the result groups for a query ---------- */
  function groupsFor(q) {
    const query = q.trim();
    const groups = [];
    const match = text => PS.model.matches({ t: text, c: '', s: '', x: '' }, query);

    if (!query) {
      const recent = PS.RECENT.all().map(PS.model.byId).filter(Boolean).slice(0, 4);
      if (recent.length) groups.push({ label: 'Recent', rows: recent.map(promptRow) });
    } else {
      const found = PS.model.search(query);
      if (found.length) groups.push({ label: PS.plural(found.length, 'prompt') + (found.length > 8 ? ', showing 8' : ''), rows: found.slice(0, 8).map(promptRow) });
    }

    const pages = PAGES.filter(p => !query || match(p.title)).map(p => ({
      title: p.title, icon: PS.ui(p.icon), hint: 'Page', run: () => { location.href = p.href; }
    }));
    if (pages.length) groups.push({ label: 'Go to', rows: pages });

    const cats = PS.CATS.filter(c => !query || match(c)).map(c => ({
      title: c, sub: PS.plural(PS.model.counts[c] || 0, 'prompt'), cat: c, hint: 'Category', run: () => { location.href = PS.catUrl(c); }
    }));
    if (cats.length) groups.push({ label: 'Categories', rows: cats });

    const acts = actions().filter(a => !query || match(a.title)).map(a => ({ title: a.title, icon: PS.ui(a.icon), hint: 'Action', run: a.run }));
    if (acts.length) groups.push({ label: 'Actions', rows: acts });
    return groups;
  }

  function promptRow(p) {
    return { title: p.t, sub: p.c + (p.s ? '  ·  ' + p.s : ''), cat: p.c, hint: PS.model.fieldCount(p) ? PS.plural(PS.model.fieldCount(p), 'field') : '', run: () => PS.openPrompt(p.id) };
  }

  /* ---------- Render ---------- */
  function render() {
    const groups = groupsFor(input.value);
    items = [];
    let html = '';
    groups.forEach(g => {
      html += '<div class="pal-group" role="presentation">' + PS.esc(g.label) + '</div>';
      g.rows.forEach(r => {
        const i = items.push(r) - 1;
        const lead = r.cat ? '<span class="cat-dot ' + PS.catClass(r.cat) + '"></span>' : (r.icon || '');
        html += '<div class="pal-item" role="option" id="pal-' + i + '" data-i="' + i + '" aria-selected="false">' + lead +
          '<span class="pal-text"><span class="pal-title">' + PS.esc(r.title) + '</span>' + (r.sub ? '<span class="pal-sub">' + PS.esc(r.sub) + '</span>' : '') + '</span>' +
          (r.hint ? '<span class="pal-hint">' + PS.esc(r.hint) + '</span>' : '') + '</div>';
      });
    });
    if (!items.length) html = '<div class="pal-empty" role="presentation">No results for “' + PS.esc(input.value.trim()) + '”. Try fewer or different words.</div>';
    list.innerHTML = html;
    active = 0;
    mark(false);
    status.textContent = items.length ? PS.plural(items.length, 'result') + ' available' : 'No results';
  }
  let status;

  function mark(scroll) {
    list.querySelectorAll('.pal-item').forEach(el => el.setAttribute('aria-selected', String(+el.dataset.i === active)));
    const el = items.length ? document.getElementById('pal-' + active) : null;
    if (el) { input.setAttribute('aria-activedescendant', el.id); if (scroll) el.scrollIntoView({ block: 'nearest' }); }
    else input.removeAttribute('aria-activedescendant');
  }

  function choose(i) {
    const row = items[i];
    if (!row) return;
    PS.closeDialog(dlg);
    setTimeout(() => row.run(), 40);
  }

  /* ---------- Build once ---------- */
  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'palette';
    dlg.setAttribute('aria-label', 'Command palette');
    dlg.innerHTML =
      '<div class="pal-head">' + PS.ui('search') +
        '<input class="pal-input" type="text" role="combobox" aria-expanded="true" aria-controls="palList" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="Search prompts, pages, categories…" aria-label="Search prompts, pages and categories" />' +
        '<button type="button" class="icon-btn" data-close aria-label="Close" data-tip="Close">' + PS.ui('x') + '</button>' +
      '</div>' +
      '<div class="pal-list" id="palList" role="listbox" aria-label="Results"></div>' +
      '<div class="sr-only" role="status" aria-live="polite" id="palStatus"></div>' +
      '<div class="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>';
    document.body.appendChild(dlg);
    input = dlg.querySelector('.pal-input');
    list = dlg.querySelector('#palList');
    status = dlg.querySelector('#palStatus');
    PS.wireDialog(dlg);

    dlg.querySelector('[data-close]').addEventListener('click', () => PS.closeDialog(dlg));
    input.addEventListener('input', PS.debounce(render, 60));
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (items.length) { active = (active + 1) % items.length; mark(true); } }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (items.length) { active = (active - 1 + items.length) % items.length; mark(true); } }
      else if (e.key === 'Home') { e.preventDefault(); active = 0; mark(true); }
      else if (e.key === 'End') { e.preventDefault(); active = Math.max(0, items.length - 1); mark(true); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
    });
    list.addEventListener('mousemove', e => {
      const el = e.target.closest('.pal-item');
      if (el && +el.dataset.i !== active) { active = +el.dataset.i; mark(false); }
    });
    list.addEventListener('click', e => {
      const el = e.target.closest('.pal-item');
      if (el) choose(+el.dataset.i);
    });
  }

  function open(prefill) {
    if (!dlg) build();
    if (dlg.open) { input.focus(); return; }
    input.value = prefill || '';
    render();
    PS.openDialog(dlg);
    input.focus();
    if (prefill) input.setSelectionRange(prefill.length, prefill.length);
  }
  function close() { if (dlg) PS.closeDialog(dlg); }
  function toggle() { if (dlg && dlg.open) close(); else open(); }

  /* ---------- Global shortcuts ---------- */
  function typingTarget(t) {
    return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  }
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') { e.preventDefault(); toggle(); return; }
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !typingTarget(e.target)) {
      const inPage = document.getElementById('searchInput');
      e.preventDefault();
      if (inPage && !document.querySelector('dialog[open]')) inPage.focus(); else open();
    }
  });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-open-palette]')) open();
  });

  window.PS = Object.assign(window.PS || {}, { palette: { open, close, toggle } });
})();
