/* ============================================================
   PromptOS: prompt sheet
   A slide-over for one prompt. "Fill fields" turns every [FIELD]
   into a labelled input with a live preview; "Edit text" lets you
   change the wording freely. Nothing is saved; Copy takes the result.
   Built on first use and shared by every page.
   ============================================================ */
(function () {
  'use strict';

  let dlg = null;
  let els = {};
  let cur = null;   /* { p, fields, values, mode, manual, dirty } */

  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'sheet';
    dlg.id = 'sheet';
    dlg.setAttribute('aria-labelledby', 'sheetTitle');
    dlg.innerHTML =
      '<div class="sheet-head">' +
        '<div class="sheet-head-text">' +
          '<span class="card-cat" data-s="cat"><span class="cat-dot"></span><span data-s="catName"></span></span>' +
          '<h2 class="sheet-title" id="sheetTitle" tabindex="-1" data-s="title"></h2>' +
          '<div class="sheet-meta" data-s="meta"></div>' +
        '</div>' +
        '<button type="button" class="icon-btn" data-s="close" aria-label="Close" data-tip="Close">' + PS.ui('x') + '</button>' +
      '</div>' +
      '<div class="sheet-body">' +
        '<div class="seg" role="tablist" aria-label="How to customise this prompt" data-s="seg">' +
          '<button type="button" role="tab" id="tabFill" aria-controls="panelFill" data-mode="fill">Fill fields</button>' +
          '<button type="button" role="tab" id="tabEdit" aria-controls="panelEdit" data-mode="edit">Edit text</button>' +
        '</div>' +
        '<div role="tabpanel" id="panelFill" aria-labelledby="tabFill" data-s="panelFill" class="fields-grid">' +
          '<div class="fields-progress"><span data-s="progressText"></span><span class="bar"><i data-s="bar"></i></span></div>' +
          '<div class="fields-grid" data-s="fields"></div>' +
          '<div><div class="preview-label"><span class="eyebrow">Preview</span></div><div class="preview" data-s="preview" tabindex="0" role="region" aria-label="Prompt preview"></div></div>' +
        '</div>' +
        '<div role="tabpanel" id="panelEdit" aria-labelledby="tabEdit" data-s="panelEdit" hidden class="fields-grid">' +
          '<div class="note">' + PS.ui('info') + '<span data-s="editNote">Changes apply to this copy only and are not saved. Reset restores the original wording.</span></div>' +
          '<label class="sr-only" for="editArea">Prompt text</label>' +
          '<textarea class="textarea edit-area" id="editArea" spellcheck="false" data-s="edit"></textarea>' +
        '</div>' +
      '</div>' +
      '<div class="sheet-foot">' +
        '<button type="button" class="btn btn--primary" data-s="copy">' + PS.ui('copy') + '<span data-label>Copy prompt</span></button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-s="reset" aria-label="Reset to the original prompt">' + PS.ui('reset') + '<span class="hide-sm">Reset</span></button>' +
        '<span class="grow"></span>' +
        '<button type="button" class="icon-btn fav-btn" data-s="fav" data-tip="Save" aria-label="Save to favourites">' + PS.ui('star') + '</button>' +
        '<button type="button" class="icon-btn" data-s="share" data-tip="Copy link" aria-label="Copy link to this prompt">' + PS.ui('link') + '</button>' +
      '</div>';
    document.body.appendChild(dlg);
    dlg.querySelectorAll('[data-s]').forEach(n => { els[n.dataset.s] = n; });
    PS.wireDialog(dlg, onClosed);

    els.close.addEventListener('click', () => PS.closeDialog(dlg));
    els.seg.addEventListener('click', e => {
      const b = e.target.closest('[data-mode]');
      if (b) setMode(b.dataset.mode);
    });
    els.seg.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      setMode(cur.mode === 'fill' ? 'edit' : 'fill');
      dlg.querySelector('[data-mode="' + cur.mode + '"]').focus();
    });
    els.edit.addEventListener('input', () => { cur.manual = els.edit.value; cur.dirty = true; });
    els.copy.addEventListener('click', copy);
    els.reset.addEventListener('click', reset);
    els.share.addEventListener('click', share);
    els.fav.addEventListener('click', () => {
      const on = PS.FAVORITES.toggle(cur.p.id);
      PS.toast(on ? 'Saved to favourites' : 'Removed from favourites');
    });
    dlg.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); copy(); }
    });
  }

  /* ---------- Rendering ---------- */
  function fieldHtml(f, i) {
    const id = 'fld-' + i;
    const tag = f.kind === 'area' ? 'textarea class="textarea" rows="3"' : 'input class="input" type="text"';
    const ph = f.hint ? PS.esc('e.g. ' + f.hint) : 'Type here';
    const close = f.kind === 'area' ? '></textarea>' : '/>';
    return '<div class="field" data-i="' + i + '">' +
      '<label class="field-label" for="' + id + '"><span>' + PS.esc(f.label) + '</span></label>' +
      '<' + tag + ' id="' + id + '" data-i="' + i + '" placeholder="' + ph + '" autocomplete="off" spellcheck="false"' + close +
    '</div>';
  }

  function paintPreview() {
    const parts = PS.model.tokenize(cur.p.x, cur.values);
    const frag = document.createDocumentFragment();
    parts.forEach(part => {
      if (part.blank || part.filled) {
        const s = document.createElement('span');
        s.className = part.blank ? 'tok' : 'tok is-filled';
        s.textContent = part.text;
        frag.appendChild(s);
      } else frag.appendChild(document.createTextNode(part.text));
    });
    els.preview.replaceChildren(frag);
    const total = cur.fields.length;
    const done = cur.fields.filter(f => (cur.values[f.key] || '').trim()).length;
    els.progressText.textContent = done + ' of ' + total + ' filled';
    els.bar.style.setProperty('--p', total ? done / total : 0);
    return { done, total };
  }

  function setMode(mode) {
    cur.mode = mode;
    const isFill = mode === 'fill';
    els.panelFill.hidden = !isFill;
    els.panelEdit.hidden = isFill;
    dlg.querySelectorAll('[data-mode]').forEach(b => {
      const on = b.dataset.mode === mode;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    if (!isFill) {
      els.edit.value = cur.dirty ? cur.manual : PS.model.render(cur.p, cur.values);
      cur.manual = els.edit.value;
    } else if (cur.dirty) {
      PS.toast('Your wording changes stay in Edit text until you reset.');
    }
  }

  function currentText() {
    return cur.mode === 'edit' ? els.edit.value : PS.model.render(cur.p, cur.values);
  }

  /* ---------- Actions ---------- */
  function copy() {
    const text = currentText();
    const unfilled = cur.mode === 'fill' ? paintPreview() : null;
    PS.copyText(text).then(ok => {
      if (!ok) { PS.toast('Could not copy. Select the text and copy it manually.', { type: 'error' }); return; }
      PS.flash(els.copy, 'Copied');
      const left = unfilled ? unfilled.total - unfilled.done : 0;
      PS.toast(left ? 'Copied. ' + PS.plural(left, 'field') + ' still empty.' : 'Copied to clipboard');
    });
  }

  function reset() {
    cur.values = {};
    cur.manual = null;
    cur.dirty = false;
    els.fields.querySelectorAll('input, textarea').forEach(i => { i.value = ''; i.closest('.field').classList.remove('is-filled'); });
    els.edit.value = cur.p.x;
    paintPreview();
    PS.toast('Reset to the original prompt');
  }

  function share() {
    const url = new URL('library.html?p=' + cur.p.id, location.href).href;
    PS.copyText(url).then(ok => PS.toast(ok ? 'Link copied' : 'Could not copy the link', ok ? undefined : { type: 'error' }));
  }

  function onClosed() {
    const u = new URL(location.href);
    if (u.searchParams.has('p')) {
      u.searchParams.delete('p');
      history.replaceState(history.state, '', u.pathname + (u.search || '') + u.hash);
    }
    cur = null;
  }

  /* ---------- Public ---------- */
  function openPrompt(id) {
    const p = PS.model.byId(id);
    if (!p) { PS.toast('That prompt no longer exists.', { type: 'error' }); return; }
    if (!dlg) build();
    PS.RECENT.push(id);
    const fields = PS.model.fields(p);
    cur = { p, fields, values: {}, mode: fields.length ? 'fill' : 'edit', manual: null, dirty: false };

    dlg.className = 'sheet ' + PS.catClass(p.c);
    els.catName.textContent = p.c;
    els.title.textContent = p.t;
    els.meta.textContent = '';
    const bits = [];
    if (p.s) bits.push('By ' + p.s);
    bits.push(fields.length ? PS.plural(fields.length, 'field') : 'No fields to fill');
    bits.push(PS.plural(p.x.length, 'character'));
    els.meta.textContent = bits.join('  ·  ');

    els.seg.hidden = !fields.length;
    els.fields.innerHTML = fields.map(fieldHtml).join('');
    els.fields.oninput = e => {
      const t = e.target.closest('[data-i]');
      if (!t || t.dataset.i === undefined || !t.matches('input, textarea')) return;
      const f = cur.fields[+t.dataset.i];
      cur.values[f.key] = t.value;
      t.closest('.field').classList.toggle('is-filled', !!t.value.trim());
      paintPreview();
    };
    els.edit.value = p.x;
    els.editNote.textContent = fields.length
      ? 'Changes apply to this copy only and are not saved. Reset restores the original wording.'
      : 'This prompt has no fields. Edit the wording if you like; changes are not saved.';
    els.fav.setAttribute('data-fav', p.id);
    els.fav.setAttribute('aria-pressed', String(PS.FAVORITES.has(p.id)));
    els.fav.setAttribute('data-tip', PS.FAVORITES.has(p.id) ? 'Saved' : 'Save');

    paintPreview();
    setMode(cur.mode);
    PS.openDialog(dlg);
    els.title.focus({ preventScroll: true });
    els.title.scrollIntoView({ block: 'nearest' });
  }

  function closePrompt() { if (dlg) PS.closeDialog(dlg); }

  /* Honour shared links like library.html?p=12 on any page. */
  function openFromUrl() {
    const id = Number(new URL(location.href).searchParams.get('p'));
    if (id && PS.model.byId(id)) openPrompt(id);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openFromUrl);
  else openFromUrl();

  window.PS = Object.assign(window.PS || {}, { openPrompt, closePrompt });
})();
