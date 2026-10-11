/* ============================================================
   PromptOS: library page (library.html)
   Search, category filter, sort, favourites-only and grid / list
   view. The URL always reflects the current view, so any state is
   a shareable link: library.html?cat=Social+Media&q=hook
   ============================================================ */
(function () {
  'use strict';

  const M = PS.model;
  const params = new URLSearchParams(location.search);
  const validCat = c => (c && PS.CATS.indexOf(c) !== -1 ? c : 'All');

  const state = {
    cat: validCat(params.get('cat')),
    q: params.get('q') || '',
    sort: ['az', 'fields-desc', 'fields-asc'].indexOf(params.get('sort')) !== -1 ? params.get('sort') : 'default',
    favOnly: params.get('fav') === '1'
  };

  const grid = document.getElementById('grid');
  const line = document.getElementById('resultsLine');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  const sortSel = document.getElementById('sortSel');
  const favBtn = document.getElementById('favOnly');
  const rail = document.getElementById('railList');
  const chips = document.getElementById('chipRow');
  const viewBtns = document.querySelectorAll('[data-view]');
  const more = document.getElementById('loadMore');

  /* Cards are added in batches so the page stays fast even with hundreds of prompts. */
  const BATCH = 48;
  let pieces = [];
  let shown = 0;
  function paintMore() {
    const next = pieces.slice(shown, shown + BATCH);
    if (next.length) grid.insertAdjacentHTML('beforeend', next.join(''));
    shown += next.length;
    more.hidden = shown >= pieces.length;
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { if (es[0].isIntersecting && !more.hidden) paintMore(); }, { rootMargin: '800px 0px' }).observe(more);
  }
  more.querySelector('button').addEventListener('click', paintMore);

  /* ---------- Category navigation (rail on desktop, chips on mobile) ---------- */
  function navHtml() {
    const cats = PS.CATS.filter(c => M.counts[c]);
    const railHtml = '<a class="rail-link" href="library.html" data-cat="All">' + PS.ui('library') + '<span>All prompts</span><span class="n">' + M.total + '</span></a>' +
      cats.map(c => '<a class="rail-link ' + PS.catClass(c) + '" href="' + PS.catUrl(c) + '" data-cat="' + PS.esc(c) + '">' + PS.catIcon(c) + '<span>' + PS.esc(c) + '</span><span class="n">' + M.counts[c] + '</span></a>').join('');
    const chipHtml = '<a class="chip" href="library.html" data-cat="All">All <span class="n">' + M.total + '</span></a>' +
      cats.map(c => '<a class="chip" href="' + PS.catUrl(c) + '" data-cat="' + PS.esc(c) + '">' + PS.esc(c) + ' <span class="n">' + M.counts[c] + '</span></a>').join('');
    return { railHtml, chipHtml };
  }
  const nav = navHtml();
  rail.innerHTML = nav.railHtml;
  chips.innerHTML = nav.chipHtml;

  function markNav() {
    document.querySelectorAll('[data-cat]').forEach(a => {
      const on = a.dataset.cat === state.cat;
      a.setAttribute('aria-current', on ? 'true' : 'false');
      if (on && a.classList.contains('chip') && chips.scrollWidth > chips.clientWidth) {
        const left = a.offsetLeft - (chips.clientWidth - a.offsetWidth) / 2;
        chips.scrollTo({ left, behavior: PS.reduceMotion.matches ? 'auto' : 'smooth' });
      }
    });
  }

  /* ---------- Filtering and sorting ---------- */
  function visible() {
    let list = state.q ? M.search(state.q) : M.all.slice();
    if (state.cat !== 'All') list = list.filter(p => p.c === state.cat);
    if (state.favOnly) list = list.filter(p => PS.FAVORITES.has(p.id));
    if (state.sort === 'az') list.sort((a, b) => a.t.localeCompare(b.t));
    else if (state.sort === 'fields-desc') list.sort((a, b) => M.fieldCount(b) - M.fieldCount(a) || a.id - b.id);
    else if (state.sort === 'fields-asc') list.sort((a, b) => M.fieldCount(a) - M.fieldCount(b) || a.id - b.id);
    return list;
  }

  const filtered = () => state.cat !== 'All' || state.q || state.favOnly;

  /* ---------- Render ---------- */
  function render() {
    const list = visible();
    const grouped = state.cat === 'All' && !state.q && state.sort === 'default' && !state.favOnly;

    line.innerHTML = '<span>Showing <b>' + list.length + '</b> of <b>' + M.total + '</b> prompts' +
      (state.cat !== 'All' ? ' in <b>' + PS.esc(state.cat) + '</b>' : '') + '</span>' +
      (filtered() ? '<button type="button" class="btn btn--ghost btn--sm" data-clear>' + PS.ui('x') + 'Clear filters</button>' : '');

    document.title = (state.cat === 'All' ? 'Prompt library' : state.cat + ' prompts') + ' | PromptOS';
    clearBtn.hidden = !state.q;
    sortSel.value = state.sort;
    favBtn.setAttribute('aria-pressed', String(state.favOnly));
    document.querySelector('option[value="default"]').textContent = state.q ? 'Best match' : 'Curated order';

    if (!list.length) {
      const favEmpty = state.favOnly && !PS.FAVORITES.size();
      grid.innerHTML = '<div class="empty"><div class="empty-icon">' + PS.ui(favEmpty ? 'star' : 'search') + '</div>' +
        '<h2>' + (favEmpty ? 'No favourites yet' : 'No prompts found') + '</h2>' +
        '<p>' + (favEmpty ? 'Tap the star on any prompt to keep it here.' : 'Try fewer or different words, or clear your filters.') + '</p>' +
        '<button type="button" class="btn" data-clear>Clear filters</button></div>';
      pieces = []; shown = 0; more.hidden = true;
      return;
    }

    if (grouped) {
      const by = {};
      list.forEach(p => { (by[p.c] = by[p.c] || []).push(p); });
      pieces = [];
      PS.CATS.filter(c => by[c]).forEach(c => {
        pieces.push('<div class="group-head ' + PS.catClass(c) + '"><span class="cat-dot"></span><h2>' + PS.esc(c) + '</h2><span class="n">' + by[c].length + '</span></div>');
        by[c].forEach(p => pieces.push(PS.card(p)));
      });
    } else {
      pieces = list.map(PS.card);
    }
    grid.innerHTML = '';
    shown = 0;
    paintMore();
  }

  /* ---------- URL sync ---------- */
  function urlFor() {
    const u = new URLSearchParams();
    if (state.cat !== 'All') u.set('cat', state.cat);
    if (state.q) u.set('q', state.q);
    if (state.sort !== 'default') u.set('sort', state.sort);
    if (state.favOnly) u.set('fav', '1');
    const s = u.toString();
    return 'library.html' + (s ? '?' + s : '');
  }
  function sync(push) {
    const url = urlFor();
    if (push) history.pushState({ cat: state.cat }, '', url); else history.replaceState(history.state, '', url);
  }

  function update(opts) {
    const o = opts || {};
    sync(!!o.push);
    markNav();
    render();
    if (o.scroll) {
      const top = grid.getBoundingClientRect().top + window.scrollY - 140;
      if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: PS.reduceMotion.matches ? 'auto' : 'smooth' });
    }
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-cat]');
    if (a && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button)) {
      e.preventDefault();
      state.cat = a.dataset.cat;
      update({ push: true, scroll: true });
      return;
    }
    if (e.target.closest('[data-clear]')) {
      state.cat = 'All'; state.q = ''; state.favOnly = false; state.sort = 'default';
      update({ push: true });
      searchInput.focus({ preventScroll: true });
    }
  });

  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(location.search);
    state.cat = validCat(p.get('cat'));
    state.q = p.get('q') || '';
    state.favOnly = p.get('fav') === '1';
    state.sort = ['az', 'fields-desc', 'fields-asc'].indexOf(p.get('sort')) !== -1 ? p.get('sort') : 'default';
    searchInput.value = state.q;
    markNav(); render();
  });

  const onType = PS.debounce(() => { state.q = searchInput.value.trim(); update(); }, 120);
  searchInput.addEventListener('input', onType);
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape' && searchInput.value) { e.preventDefault(); searchInput.value = ''; state.q = ''; update(); }
  });
  clearBtn.addEventListener('click', () => { searchInput.value = ''; state.q = ''; update(); searchInput.focus(); });
  sortSel.addEventListener('change', () => { state.sort = sortSel.value; update(); });
  favBtn.addEventListener('click', () => { state.favOnly = !state.favOnly; update(); });

  function applyView(v) {
    grid.classList.toggle('is-list', v === 'list');
    viewBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
  }
  viewBtns.forEach(b => b.addEventListener('click', () => { applyView(b.dataset.view); PS.PREFS.set('view', b.dataset.view); }));
  applyView(PS.PREFS.get('view', 'grid') === 'list' ? 'list' : 'grid');

  /* A favourites-only view must update when a star is toggled. */
  PS.FAVORITES.onChange(() => { if (state.favOnly) render(); });

  PS.bindCards(grid);
  searchInput.value = state.q;
  markNav();
  render();
})();
