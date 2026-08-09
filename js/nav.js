/* ============================================================
   PromptOS — Shared site navigation
   Builds the sidebar, bottom tab bar and topbar search box on
   every page, wires the mobile drawer, keyboard shortcuts and
   the favourites counter. Runs on index.html, library.html,
   favorites.html and about.html alike.
   ============================================================ */
(function(){
  const PROMPTS = window.PROMPTS || [];
  const TOTAL = PROMPTS.length;
  const COUNTS = {};
  CATS.forEach(c => COUNTS[c] = PROMPTS.filter(p => p.c === c).length);

  const path = location.pathname.split('/').pop() || 'index.html';
  const params = new URLSearchParams(location.search);
  const activeCat = path === 'library.html' ? (params.get('cat') || 'All') : null;

  const PAGES = [
    {
      key:'home', href:'index.html', label:'Home',
      icon:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>'
    },
    {
      key:'library', href:'library.html', label:'All Prompts',
      icon:'<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
      count:()=>TOTAL
    },
    {
      key:'favorites', href:'favorites.html', label:'Favourites',
      icon:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      count:()=>FAVORITES.size()
    },
    {
      key:'about', href:'about.html', label:'About',
      icon:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
    }
  ];
  const pageKeyForFile = {'index.html':'home','library.html':'library','favorites.html':'favorites','about.html':'about'};
  const currentPageKey = pageKeyForFile[path] || 'home';

  function svg(inner, cls){
    return '<svg class="'+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+inner+'</svg>';
  }

  /* ---------------- Sidebar: primary pages ---------------- */
  function buildPrimaryNav(){
    const el = document.getElementById('navPrimary');
    if(!el) return;
    el.innerHTML = PAGES.map(pg=>{
      const on = pg.key === currentPageKey;
      const countHtml = pg.count ? '<span class="nav-all-count" data-count-for="'+pg.key+'">'+pg.count()+'</span>' : '';
      return '<a class="nav-all'+(on?' on':'')+'" href="'+pg.href+'" aria-current="'+(on?'page':'false')+'">'+
        svg(pg.icon) + '<span class="nav-all-lbl">'+pg.label+'</span>' + countHtml + '</a>';
    }).join('');
  }

  /* ---------------- Sidebar: categories ---------------- */
  function buildCategoryNav(){
    const el = document.getElementById('navCats');
    if(!el) return;
    el.innerHTML = CATS.map(c=>{
      const col = COLORS[c];
      const on = activeCat === c;
      return '<a class="nav-item'+(on?' on':'')+'" href="'+catUrl(c)+'" style="--ch:'+col.h+';--cbg:'+col.bg+';--cbg2:'+col.bg2+'">'+
        icon(c) + '<span class="nav-item-lbl">'+c+'</span>' +
        '<span class="nav-item-count">'+COUNTS[c]+'</span></a>';
    }).join('');
  }

  /* ---------------- Bottom tab bar (mobile) ---------------- */
  function buildBottomNav(){
    const el = document.getElementById('bottomNav');
    if(!el) return;
    el.innerHTML = PAGES.map(pg=>{
      const on = pg.key === currentPageKey;
      return '<a class="bn-btn'+(on?' active':'')+'" href="'+pg.href+'">'+svg(pg.icon)+'<span>'+pg.label+'</span></a>';
    }).join('');
  }

  /* ---------------- Stat chips in sidebar head ---------------- */
  function fillStats(){
    const t = document.getElementById('statTotal');
    const c = document.getElementById('statCats');
    if(t) t.textContent = TOTAL;
    if(c) c.textContent = CATS.length;
  }

  /* ---------------- Favourites counters (kept in sync) ---------------- */
  function refreshFavCounts(){
    document.querySelectorAll('[data-count-for="favorites"]').forEach(n=>n.textContent = FAVORITES.size());
    const favLabel = document.getElementById('favCount');
    if(favLabel){
      favLabel.textContent = '('+FAVORITES.size()+')';
      favLabel.style.display = FAVORITES.size() > 0 ? '' : 'none';
    }
  }
  FAVORITES.onChange(refreshFavCounts);

  /* ---------------- Mobile sidebar drawer ---------------- */
  function wireDrawer(){
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const menuBtn = document.getElementById('menuBtn');
    if(!sidebar || !overlay || !menuBtn) return;
    function open(){ sidebar.classList.add('open'); overlay.classList.add('on'); document.body.style.overflow='hidden'; }
    function close(){ sidebar.classList.remove('open'); overlay.classList.remove('on'); document.body.style.overflow=''; }
    menuBtn.addEventListener('click', open);
    overlay.addEventListener('click', close);
    sidebar.querySelectorAll('a').forEach(a=>a.addEventListener('click', close));
    window.closeSidebar = close;
  }

  /* ---------------- Search box (topbar) ---------------- */
  // Pages that render their own results live (library.html) call
  // window.NAV.onSearch(handler) to receive keystrokes directly.
  // Every other page falls back to submitting the query to the library.
  let liveHandler = null;
  function wireSearch(){
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const kbdHint = document.getElementById('kbdHint');
    if(!input) return;

    const q = params.get('q') || '';
    if(q){ input.value = q; if(clearBtn) clearBtn.classList.add('show'); if(kbdHint) kbdHint.classList.add('hide'); }

    input.addEventListener('input', e=>{
      const val = e.target.value;
      if(clearBtn) clearBtn.classList.toggle('show', val.length>0);
      if(kbdHint) kbdHint.classList.toggle('hide', val.length>0);
      if(liveHandler) liveHandler(val);
    });
    input.addEventListener('keydown', e=>{
      if(e.key === 'Enter' && !liveHandler){
        const val = input.value.trim();
        location.href = val ? 'library.html?q='+encodeURIComponent(val) : 'library.html';
      }
    });
    if(clearBtn){
      clearBtn.addEventListener('click', ()=>{
        input.value=''; clearBtn.classList.remove('show');
        if(kbdHint) kbdHint.classList.remove('hide');
        input.focus();
        if(liveHandler) liveHandler('');
      });
    }
  }

  /* ---------------- Keyboard shortcuts ---------------- */
  function wireKeyboard(){
    document.addEventListener('keydown', e=>{
      const input = document.getElementById('searchInput');
      if(e.key === '/' && document.activeElement !== input && document.activeElement.tagName !== 'TEXTAREA'){
        if(input){ e.preventDefault(); input.focus(); }
      }
      if(e.key === 'Escape'){
        if(document.activeElement === input) input.blur();
        if(window.closeSidebar) window.closeSidebar();
      }
    });
  }

  buildPrimaryNav();
  buildCategoryNav();
  buildBottomNav();
  fillStats();
  refreshFavCounts();
  wireDrawer();
  wireSearch();
  wireKeyboard();

  window.NAV = {
    counts: COUNTS,
    total: TOTAL,
    activeCat: activeCat,
    searchQuery: params.get('q') || '',
    onSearch(fn){ liveHandler = fn; }
  };
})();
