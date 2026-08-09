/* ============================================================
   PromptOS — Favourites page controller (favorites.html)
   ============================================================ */
(function(){
  const P = window.PROMPTS || [];
  const grid = document.getElementById('grid');
  const resultsText = document.getElementById('resultsText');
  let q = NAV.searchQuery || '';

  function render(){
    let L = P.filter(p => FAVORITES.has(p.id));
    if(q){
      const lq = q.toLowerCase();
      L = L.filter(p => p.t.toLowerCase().includes(lq) || p.c.toLowerCase().includes(lq) ||
                         p.s.toLowerCase().includes(lq) || p.x.toLowerCase().includes(lq));
    }

    if(resultsText){
      resultsText.innerHTML = L.length
        ? 'Showing <b>'+L.length+'</b> saved prompt'+(L.length>1?'s':'')
        : '';
    }

    if(!P.some(p=>FAVORITES.has(p.id))){
      grid.innerHTML =
        '<div class="empty">'+
          '<div class="fav-empty-icon">'+
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'+
          '</div>'+
          '<h3>No favourites yet</h3>'+
          '<p>Tap the star on any prompt to save it here for quick access.</p>'+
          '<a class="btn btn-primary" style="margin-top:18px" href="library.html">Browse the library</a>'+
        '</div>';
      return;
    }

    if(!L.length){
      grid.innerHTML = '<div class="empty">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'+
        '<h3>No matches in your favourites</h3><p>Try a different search term.</p></div>';
      return;
    }

    grid.innerHTML = L.map(card).join('');
    bindCardEvents(grid);
  }

  NAV.onSearch(val=>{ q = val; render(); });
  FAVORITES.onChange(render);
  render();
})();
