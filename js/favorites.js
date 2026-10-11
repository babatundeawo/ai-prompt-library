/* ============================================================
   PromptOS: favourites page (favorites.html)
   Saved prompts live in this browser only (localStorage).
   ============================================================ */
(function () {
  'use strict';

  const M = PS.model;
  const grid = document.getElementById('grid');
  const line = document.getElementById('resultsLine');
  const searchWrap = document.getElementById('searchWrap');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  let q = '';

  function render() {
    const saved = M.all.filter(p => PS.FAVORITES.has(p.id));
    const list = q ? saved.filter(p => M.matches(p, q)) : saved;

    searchWrap.hidden = !saved.length;
    clearBtn.hidden = !q;
    line.innerHTML = saved.length ? 'Showing <b>' + list.length + '</b> of <b>' + saved.length + '</b> saved' : '';

    if (!saved.length) {
      grid.innerHTML = '<div class="empty"><div class="empty-icon">' + PS.ui('star') + '</div>' +
        '<h2>No favourites yet</h2><p>Tap the star on any prompt to keep it here for quick access. Favourites are stored in this browser only.</p>' +
        '<a class="btn btn--primary" href="library.html">Browse the library' + PS.ui('arrow', 'arrow') + '</a></div>';
      return;
    }
    if (!list.length) {
      grid.innerHTML = '<div class="empty"><div class="empty-icon">' + PS.ui('search') + '</div><h2>No matches in your favourites</h2><p>Try a different word.</p></div>';
      return;
    }
    grid.innerHTML = list.map(PS.card).join('');
  }

  searchInput.addEventListener('input', PS.debounce(() => { q = searchInput.value.trim(); render(); }, 100));
  clearBtn.addEventListener('click', () => { searchInput.value = ''; q = ''; render(); searchInput.focus(); });
  PS.FAVORITES.onChange(render);
  PS.bindCards(grid);
  render();
})();
