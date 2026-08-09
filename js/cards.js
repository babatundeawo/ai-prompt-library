/* ============================================================
   PromptOS — Card template, copy/reset/favourite actions, toast
   Shared by library.html, favorites.html and the home page's
   featured-prompts strip.
   ============================================================ */
const ORIG = {};
(window.PROMPTS || []).forEach(p => { ORIG[p.id] = p.x; });

function esc(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function card(p){
  const col = COLORS[p.c] || {h:"#5B4FE8",bg:"rgba(91,79,232,.08)",bg2:"rgba(91,79,232,.14)",bo:"rgba(91,79,232,.2)"};
  const fv = FAVORITES.has(p.id);
  const ph = p.ph > 0 ? '<span class="field-pill">'+p.ph+' field'+(p.ph>1?'s':'')+'</span>' : '';
  const fname = cSlug(p.c)+'/'+String(p.id).padStart(3,'0')+'.prompt';

  return '<div class="card" style="--ch:'+col.h+';--cbg:'+col.bg+';--cbg2:'+col.bg2+';--cbo:'+col.bo+'">'+
    '<div class="card-tab">'+
      '<span class="card-tab-dot"></span>'+
      '<span class="card-tab-name">'+fname+'</span>'+
      '<span class="card-tab-cat">'+icon(p.c)+esc(p.c)+'</span>'+
    '</div>'+
    '<div class="card-head">'+
      '<div class="card-title">'+esc(p.t)+'</div>'+
      '<div class="card-meta">'+
        '<span class="src-tag">'+esc(p.s)+'</span>'+ph+
        '<div class="card-actions">'+
          '<button class="icon-btn'+(fv?' faved':'')+'" data-fav="'+p.id+'" title="'+(fv?'Remove from favourites':'Save to favourites')+'" aria-pressed="'+fv+'">'+
            '<svg viewBox="0 0 24 24" fill="'+(fv?'currentColor':'none')+'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'+
          '</button>'+
          '<button class="icon-btn" data-rst="'+p.id+'" title="Reset to original">'+
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>'+
          '</button>'+
          '<button class="copy-btn" data-cpy="'+p.id+'">'+
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'+
            '<span>Copy</span>'+
          '</button>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div class="card-body">'+
      '<textarea class="prompt-area" id="ta-'+p.id+'" spellcheck="false">'+esc(p.x)+'</textarea>'+
    '</div>'+
  '</div>';
}

function bindCardEvents(grid, onFavChange){
  if(grid._ev) grid.removeEventListener('click', grid._ev);
  grid._ev = e=>{
    const cpy = e.target.closest('[data-cpy]');
    const rst = e.target.closest('[data-rst]');
    const fav = e.target.closest('[data-fav]');
    if(cpy) doCopy(+cpy.dataset.cpy);
    if(rst) doReset(+rst.dataset.rst);
    if(fav) doFav(+fav.dataset.fav, onFavChange);
  };
  grid.addEventListener('click', grid._ev);
}

function doCopy(id){
  const ta = document.getElementById('ta-'+id);
  const text = ta ? ta.value : ((window.PROMPTS||[]).find(p=>p.id===id) || {}).x || '';
  navigator.clipboard.writeText(text).then(()=>{
    const btn = document.querySelector('[data-cpy="'+id+'"]');
    if(btn){
      const sv = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg><span>Copied</span>';
      btn.classList.add('copied');
      setTimeout(()=>{btn.innerHTML=sv;btn.classList.remove('copied');},2000);
    }
    showToast('Copied to clipboard');
  }).catch(()=>{
    showToast('Could not copy — select and copy manually');
  });
}

function doReset(id){
  const ta = document.getElementById('ta-'+id);
  if(ta) ta.value = ORIG[id];
}

function doFav(id, onFavChange){
  const on = FAVORITES.toggle(id);
  const btn = document.querySelector('[data-fav="'+id+'"]');
  if(btn){
    btn.classList.toggle('faved', on);
    btn.title = on ? 'Remove from favourites' : 'Save to favourites';
    btn.setAttribute('aria-pressed', String(on));
    btn.querySelector('svg').setAttribute('fill', on ? 'currentColor' : 'none');
  }
  if(typeof onFavChange === 'function') onFavChange(id, on);
}

let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  if(msg) t.querySelector('span[data-toast-msg]') && (t.querySelector('span[data-toast-msg]').textContent = msg);
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('on'), 2200);
}

window.esc = esc;
window.card = card;
window.bindCardEvents = bindCardEvents;
window.doCopy = doCopy;
window.doReset = doReset;
window.doFav = doFav;
window.showToast = showToast;
