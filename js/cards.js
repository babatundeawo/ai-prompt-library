/* ============================================================
   PromptOS: prompt cards
   Markup for a card plus one delegated click handler that covers
   open / favourite / copy for every grid on every page.
   ============================================================ */
(function () {
  'use strict';

  const SNIPPET_CHARS = 340;

  function card(p) {
    const fav = PS.FAVORITES.has(p.id);
    const n = PS.model.fieldCount(p);
    const fieldsLabel = n ? PS.plural(n, 'field') : 'No fields';
    return '<article class="card ' + PS.catClass(p.c) + '" data-id="' + p.id + '">' +
      '<div class="card-top">' +
        '<span class="card-cat"><span class="cat-dot"></span>' + PS.esc(p.c) + '</span>' +
        '<span class="card-fields">' + fieldsLabel + '</span>' +
      '</div>' +
      '<h3 class="card-title"><button type="button" class="card-open" data-open="' + p.id + '">' + PS.esc(p.t) + '</button></h3>' +
      '<p class="card-snippet">' + PS.model.highlight(p.x.slice(0, SNIPPET_CHARS)) + '</p>' +
      '<div class="card-foot">' +
        '<span class="card-by">' + PS.esc(p.s || '') + '</span>' +
        '<div class="card-actions">' +
          '<button type="button" class="icon-btn fav-btn" data-fav="' + p.id + '" aria-pressed="' + fav + '" aria-label="Save to favourites: ' + PS.esc(p.t) + '" data-tip="' + (fav ? 'Saved' : 'Save') + '">' + PS.ui('star') + '</button>' +
          '<button type="button" class="icon-btn" data-copy="' + p.id + '" aria-label="Copy prompt: ' + PS.esc(p.t) + '" data-tip="Copy">' + PS.ui('copy') + '</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function setFavUi(btn, on) {
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('data-tip', on ? 'Saved' : 'Save');
  }

  /* Attach once per container; works for content rendered later. */
  function bind(root) {
    if (root._cardsBound) return;
    root._cardsBound = true;
    root.addEventListener('click', e => {
      const open = e.target.closest('[data-open]');
      const fav = e.target.closest('[data-fav]');
      const copy = e.target.closest('[data-copy]');
      if (open) { PS.openPrompt(+open.dataset.open); return; }
      if (fav) {
        const id = +fav.dataset.fav;
        const on = PS.FAVORITES.toggle(id);
        PS.toast(on ? 'Saved to favourites' : 'Removed from favourites', on ? undefined : { action: { label: 'Undo', onClick: () => PS.FAVORITES.toggle(id) } });
        return;
      }
      if (copy) {
        const p = PS.model.byId(+copy.dataset.copy);
        if (!p) return;
        PS.copyText(p.x).then(ok => {
          if (ok) { PS.flash(copy, 'Copied'); PS.toast('Copied. Fill in the [FIELDS] before you use it.'); }
          else PS.toast('Could not copy. Open the prompt and select the text.', { type: 'error' });
        });
      }
    });
  }

  /* Keep every visible star in step with the store (other tabs, sheet, palette). */
  PS.FAVORITES.onChange(() => {
    document.querySelectorAll('[data-fav]').forEach(b => setFavUi(b, PS.FAVORITES.has(+b.dataset.fav)));
  });

  window.PS = Object.assign(window.PS || {}, { card, bindCards: bind });
})();
