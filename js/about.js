/* ============================================================
   PromptOS: about page (about.html)
   Live numbers and the list of credited creators, both read from
   js/data.js so they are always accurate.
   ============================================================ */
(function () {
  'use strict';

  const M = PS.model;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  set('aboutTotal', M.total);
  set('aboutCats', PS.CATS.filter(c => M.counts[c]).length);
  set('aboutCreators', M.creators.length);
  set('aboutFields', M.all.reduce((sum, p) => sum + M.fieldCount(p), 0));

  const credits = document.getElementById('credits');
  if (credits) {
    credits.innerHTML = M.creators.map(c => '<li class="credit">' + PS.esc(c[0]) + '<i>' + c[1] + '</i></li>').join('');
  }
})();
