/* ============================================================
   PromptOS — Library page controller (library.html)
   Search, category filter, sort, favourites-only, grid/list view.
   Category links use real hrefs (library.html?cat=X) so they are
   shareable and work without JS, but are intercepted for instant,
   no-reload filtering when already on this page.
   ============================================================ */
(function(){
  const P = window.PROMPTS || [];
  const params = new URLSearchParams(location.search);

  const state = {
    cat: params.get('cat') || 'All',
    q: params.get('q') || '',
    sort: 'd',
    favOnly: params.get('fav') === '1'
  };

  const grid = document.getElementById('grid');
  const resultsText = document.getElementById('resultsText');
  const searchInput = document.getElementById('searchInput');

  /* ---------------- Hero: mini category grid + stat pills ---------------- */
  function buildHero(){
    const cmg = document.getElementById('cmg');
    const pills = document.getElementById('heroPills');
    if(cmg){
      cmg.innerHTML = CATS.map(c=>{
        const col = COLORS[c];
        const short = c.split(' ')[0];
        const on = state.cat === c;
        return '<a class="cat-tile'+(on?' on':'')+'" href="'+catUrl(c)+'" style="--ch:'+col.h+';--cbg:'+col.bg+';--cbo:'+col.bo+'">'+
          icon(c)+'<span>'+short+'</span><span class="cat-tile-ct">'+NAV.counts[c]+'</span></a>';
      }).join('');
    }
    if(pills){
      pills.innerHTML = CATS.map(c=>{
        const col = COLORS[c];
        const short = c.split(' ')[0];
        return '<div class="pill"><span class="pdot" style="background:'+col.h+'"></span>'+NAV.counts[c]+' '+short+'</div>';
      }).join('');
    }
  }

  /* ---------------- Filter + sort ---------------- */
  function filt(){
    let L = P.filter(p=>{
      if(state.cat !== 'All' && p.c !== state.cat) return false;
      if(state.favOnly && !FAVORITES.has(p.id)) return false;
      if(!state.q) return true;
      const lq = state.q.toLowerCase();
      return p.t.toLowerCase().includes(lq) || p.c.toLowerCase().includes(lq) ||
             p.s.toLowerCase().includes(lq) || p.x.toLowerCase().includes(lq);
    });
    if(state.sort === 'az') L.sort((a,b)=>a.t.localeCompare(b.t));
    if(state.sort === 'ph↓') L.sort((a,b)=>b.ph-a.ph);
    if(state.sort === 'ph↑') L.sort((a,b)=>a.ph-b.ph);
    return L;
  }

  /* ---------------- Render ---------------- */
  function render(){
    const L = filt();
    const groups = state.cat === 'All' && !state.q && state.sort === 'd' && !state.favOnly;

    if(resultsText){
      resultsText.innerHTML = 'Showing <b>'+L.length+'</b> of <b>'+P.length+'</b> prompts';
    }
    document.title = (state.cat === 'All' ? 'All Prompts' : state.cat) + ' — PromptOS';

    if(!L.length){
      grid.innerHTML = '<div class="empty">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'+
        '<h3>No prompts found</h3><p>Try different keywords or clear your filters.</p></div>';
      return;
    }

    if(groups){
      const byCat = {};
      L.forEach(p=>{ (byCat[p.c] = byCat[p.c] || []).push(p); });
      let html='';
      CATS.forEach(c=>{
        if(!byCat[c] || !byCat[c].length) return;
        const col = COLORS[c];
        html += '<div class="cat-heading" style="color:'+col.h+';--cbo:'+col.bo+'">'+
          icon(c)+' '+c+' <span class="cat-heading-count">('+byCat[c].length+')</span>'+
          '<span class="cat-heading-line"></span></div>';
        byCat[c].forEach(p=>html+=card(p));
      });
      grid.innerHTML = html;
    } else {
      grid.innerHTML = L.map(card).join('');
    }

    bindCardEvents(grid);
  }

  /* ---------------- Category switching (instant, no reload) ---------------- */
  function markActiveCat(){
    document.querySelectorAll('.nav-item').forEach(a=>{
      const c = new URL(a.href).searchParams.get('cat');
      a.classList.toggle('on', c === state.cat);
    });
    document.querySelectorAll('.nav-all[href="library.html"]').forEach(a=>a.classList.toggle('on', state.cat==='All' && !state.q));
    document.querySelectorAll('.cat-tile').forEach(a=>{
      const url = new URL(a.href);
      const c = url.searchParams.get('cat') || 'All';
      a.classList.toggle('on', c === state.cat);
    });
  }

  function setCategory(c, push){
    state.cat = c;
    if(searchInput && state.q){ /* keep search term across category switches */ }
    markActiveCat();
    render();
    if(push){
      const url = c === 'All' ? 'library.html' : ('library.html?cat=' + encodeURIComponent(c));
      history.pushState({cat:c}, '', url);
    }
    if(window.closeSidebar) window.closeSidebar();
  }

  document.addEventListener('click', e=>{
    const a = e.target.closest('a[href^="library.html?cat="], a[href="library.html"]');
    if(!a) return;
    // Let modified clicks (new tab, etc.) behave normally.
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const url = new URL(a.href);
    setCategory(url.searchParams.get('cat') || 'All', true);
  });

  window.addEventListener('popstate', ()=>{
    const p = new URLSearchParams(location.search);
    state.cat = p.get('cat') || 'All';
    markActiveCat();
    render();
  });

  /* ---------------- Sort / favourites-only / view toggle ---------------- */
  const sortSel = document.getElementById('sortSel');
  if(sortSel) sortSel.addEventListener('change', e=>{ state.sort = e.target.value; render(); });

  const favBtn = document.getElementById('favBtn');
  if(favBtn){
    if(state.favOnly) favBtn.classList.add('on');
    favBtn.addEventListener('click', ()=>{
      state.favOnly = !state.favOnly;
      favBtn.classList.toggle('on', state.favOnly);
      render();
    });
  }

  const gridBtn = document.getElementById('gridBtn');
  const listBtn = document.getElementById('listBtn');
  if(gridBtn && listBtn){
    gridBtn.addEventListener('click', ()=>{
      grid.classList.remove('lv');
      gridBtn.classList.add('on'); listBtn.classList.remove('on');
    });
    listBtn.addEventListener('click', ()=>{
      grid.classList.add('lv');
      listBtn.classList.add('on'); gridBtn.classList.remove('on');
    });
  }

  // Re-render whenever a favourite is toggled, so a favourites-only
  // view updates live and any category grouping counts stay correct.
  FAVORITES.onChange(()=>{ if(state.favOnly) render(); });

  /* ---------------- Search (live) ---------------- */
  NAV.onSearch(val=>{ state.q = val; render(); });

  /* ---------------- Init ---------------- */
  buildHero();
  markActiveCat();
  render();
})();
