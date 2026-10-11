/* ============================================================
   PromptOS: home page (index.html)
   Live numbers, the interactive hero demo, the category grid and a
   handful of featured prompts. Everything is read from js/data.js.
   ============================================================ */
(function () {
  'use strict';

  const M = PS.model;

  /* ---------- Stats ---------- */
  const setStat = (id, n) => { const el = document.getElementById(id); if (el) PS.countUp(el, n); };
  setStat('statTotal', M.total);
  setStat('statCats', PS.CATS.filter(c => M.counts[c]).length);
  setStat('statCreators', M.creators.length);

  /* ---------- Category grid ---------- */
  const bento = document.getElementById('bento');
  if (bento) {
    const cats = PS.CATS.filter(c => M.counts[c]);
    const hero = cats.slice().sort((a, b) => M.counts[b] - M.counts[a])[0];
    const ordered = [hero].concat(cats.filter(c => c !== hero));
    const wideFrom = ordered.length - 2;
    bento.innerHTML = ordered.map((c, i) => {
      const titles = M.all.filter(p => p.c === c).slice(0, i === 0 ? 4 : 2).map(p => '<li>' + PS.esc(p.t) + '</li>').join('');
      const size = i === 0 ? ' tile--hero' : (ordered.length > 6 && i >= wideFrom ? ' tile--wide' : '');
      return '<article class="tile ' + PS.catClass(c) + size + '" data-reveal>' +
        '<div class="tile-top"><span class="tile-icon">' + PS.catIcon(c) + '</span><span class="tile-arrow">' + PS.ui('arrowUpRight') + '</span></div>' +
        '<div><h3><a class="tile-link" href="' + PS.catUrl(c) + '">' + PS.esc(c) + '</a></h3><span class="tile-count">' + PS.plural(M.counts[c], 'prompt') + '</span></div>' +
        '<ul class="tile-examples">' + titles + '</ul></article>';
    }).join('');
    bento.setAttribute('data-stagger', '');
    PS.reveal(bento.parentElement);
  }

  /* ---------- Featured prompts: one each from a spread of categories ---------- */
  const featured = document.getElementById('featuredGrid');
  if (featured) {
    const wanted = ['Career & Resume', 'Social Media', 'Productivity', 'Image Generation', 'Business Strategy', 'Presentations'];
    const picks = [];
    wanted.forEach(c => {
      const pool = M.all.filter(p => p.c === c);
      const good = pool.find(p => { const n = M.fieldCount(p); return n >= 2 && n <= 5; }) || pool[0];
      if (good) picks.push(good);
    });
    featured.innerHTML = picks.map(PS.card).join('');
    PS.bindCards(featured);
    featured.querySelectorAll('.card').forEach(c => c.setAttribute('data-reveal', ''));
    featured.setAttribute('data-stagger', '');
    PS.reveal(featured.parentElement);
  }

  /* ---------- Hero demo: a real prompt with fillable blanks ---------- */
  const demo = document.getElementById('demo');
  if (!demo) return;

  function pickDemo() {
    const ok = p => {
      const f = M.fields(p);
      return f.length >= 2 && f.length <= 3 && p.x.length < 520 && f.every(x => x.key.length < 60);
    };
    return M.all.find(p => p.c === 'Productivity' && ok(p)) || M.all.find(ok);
  }

  const p = pickDemo();
  if (!p) { demo.remove(); document.querySelector('.hero-grid').classList.add('is-single'); return; }

  const fields = M.fields(p);
  const values = {};
  const mirrors = {};   /* key -> spans repeating the same field */
  const text = document.getElementById('demoText');
  const frag = document.createDocumentFragment();

  const seen = new Set();
  M.tokenize(p.x).forEach(part => {
    if (!part.blank) { frag.appendChild(document.createTextNode(part.text)); return; }
    const key = part.text.slice(1, -1);
    const f = fields.find(x => x.key === key);
    if (!f) { frag.appendChild(document.createTextNode(part.text)); return; }
    if (seen.has(key)) {
      const s = document.createElement('span');
      s.className = 'tok';
      s.textContent = part.text;
      (mirrors[key] = mirrors[key] || []).push(s);
      frag.appendChild(s);
      return;
    }
    seen.add(key);
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'blank';
    input.placeholder = f.label.length > 22 ? f.label.slice(0, 21) + '…' : f.label;
    input.setAttribute('aria-label', f.label);
    input.autocomplete = 'off';
    input.spellcheck = false;
    const grow = () => { input.style.width = Math.max(input.placeholder.length + 2, Math.min(34, input.value.length + 2)) + 'ch'; };
    input.addEventListener('input', () => {
      values[key] = input.value;
      input.classList.toggle('is-filled', !!input.value.trim());
      (mirrors[key] || []).forEach(s => { s.textContent = input.value.trim() || part.text; });
      grow();
    });
    grow();
    frag.appendChild(input);
  });
  text.appendChild(frag);

  document.getElementById('demoTitle').textContent = p.t;
  document.getElementById('demoCatName').textContent = p.c;
  demo.querySelector('.card-cat').classList.add(PS.catClass(p.c));

  document.getElementById('demoCopy').addEventListener('click', e => {
    PS.copyText(M.render(p, values)).then(ok => {
      if (ok) { PS.flash(e.currentTarget, 'Copied'); PS.toast('Copied your filled prompt'); }
      else PS.toast('Could not copy. Select the text and copy it manually.', { type: 'error' });
    });
  });
  document.getElementById('demoOpen').addEventListener('click', () => PS.openPrompt(p.id));
})();
