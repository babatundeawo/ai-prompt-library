/* ============================================================
   PromptOS — About page controller (about.html)
   Live stat numbers + accessible FAQ accordion.
   ============================================================ */
(function(){
  const P = window.PROMPTS || [];

  const totalEl = document.getElementById('aboutTotal');
  const catsEl = document.getElementById('aboutCats');
  const sourcesEl = document.getElementById('aboutSources');
  const fieldsEl = document.getElementById('aboutFields');
  if(totalEl) totalEl.textContent = P.length;
  if(catsEl) catsEl.textContent = CATS.length;
  if(sourcesEl) sourcesEl.textContent = new Set(P.map(p=>p.s)).size;
  if(fieldsEl) fieldsEl.textContent = P.reduce((sum,p)=>sum+p.ph, 0);

  document.querySelectorAll('.faq-item').forEach(item=>{
    const q = item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click', ()=>{
      const open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', String(open));
    });
  });
})();
