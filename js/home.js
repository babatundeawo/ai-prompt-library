/* ============================================================
   PromptOS — Home page controller (index.html)
   Category showcase grid + a small featured-prompts strip.
   ============================================================ */
(function(){
  const P = window.PROMPTS || [];

  /* ---------------- Hero stat numbers ---------------- */
  const heroTotal = document.getElementById('heroStatTotal');
  const heroCats = document.getElementById('heroStatCats');
  const heroSources = document.getElementById('heroStatSources');
  if(heroTotal) heroTotal.textContent = P.length;
  if(heroCats) heroCats.textContent = CATS.length;
  if(heroSources) heroSources.textContent = new Set(P.map(p=>p.s)).size + '+';

  /* ---------------- Category showcase grid ---------------- */
  const catGrid = document.getElementById('catShowcase');
  if(catGrid){
    catGrid.innerHTML = CATS.map(c=>{
      const col = COLORS[c];
      return '<a class="cat-card" href="'+catUrl(c)+'" style="--ch:'+col.h+';--cbg:'+col.bg+';--cbo:'+col.bo+'">'+
        '<span class="cat-card-icon">'+icon(c)+'</span>'+
        '<span class="cat-card-body">'+
          '<span class="cat-card-title">'+c+'</span>'+
          '<span class="cat-card-count">'+NAV.counts[c]+' prompt'+(NAV.counts[c]>1?'s':'')+'</span>'+
        '</span>'+
        '<span class="cat-card-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span>'+
      '</a>';
    }).join('');
  }

  /* ---------------- Featured prompts strip ---------------- */
  const featuredGrid = document.getElementById('featuredGrid');
  if(featuredGrid){
    const seen = new Set();
    const picks = [];
    for(const p of P){
      if(seen.has(p.c)) continue;
      seen.add(p.c);
      picks.push(p);
      if(picks.length >= 6) break;
    }
    featuredGrid.innerHTML = picks.map(card).join('');
    bindCardEvents(featuredGrid);
  }
})();
