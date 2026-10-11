/* ============================================================
   PromptOS: prompt model
   Reads window.PROMPTS (js/data.js) and provides: lookups, counts,
   the fill-in-the-blank [FIELD] parser, and search.
   Field counts are derived from each prompt's text, so editing a
   prompt never leaves a stale number behind.
   ============================================================ */
(function () {
  'use strict';

  const ALL = window.PROMPTS || [];
  const BY_ID = new Map(ALL.map(p => [p.id, p]));

  /* A field is square brackets containing at least one letter, e.g. [BRAND NAME]
     or [OUTFIT, e.g. red jacket]. Brackets with no letters (like [0:00-0:02] timecodes)
     are part of the template, not blanks. */
  const TOKEN_SRC = '\\[([^\\[\\]\\n]*[A-Za-z][^\\[\\]\\n]*)\\]';

  function sentenceCase(s) {
    const t = s.trim();
    const letters = t.replace(/[^A-Za-z]/g, '');
    if (letters.length > 3 && letters === letters.toUpperCase()) {
      const lower = t.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function describe(inner) {
    /* "LABEL, e.g. example"  |  "LABEL e.g. example"  |  "LABEL — note"  |  "LABEL: note" */
    const m = inner.match(/^(.*?)(?:,\s*e\.g\.?\s*|\s+e\.g\.?\s+|\s+[—–]\s+|:\s+)(.+)$/i);
    const label = sentenceCase(m ? m[1] : inner);
    const hint = m ? m[2].trim() : '';
    const long = label.length > 48 || hint.length > 60 || /^(paste|describe|list|write|provide|include)\b/i.test(label);
    return { key: inner, label, hint, kind: long ? 'area' : 'line' };
  }

  const fieldCache = new Map();
  function fields(p) {
    if (fieldCache.has(p.id)) return fieldCache.get(p.id);
    const seen = new Set();
    const out = [];
    const re = new RegExp(TOKEN_SRC, 'g');
    let m;
    while ((m = re.exec(p.x))) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      out.push(describe(m[1]));
    }
    fieldCache.set(p.id, out);
    return out;
  }

  /* Replace each field with its value; empty fields stay as [FIELD]. */
  function render(p, values) {
    const v = values || {};
    return p.x.replace(new RegExp(TOKEN_SRC, 'g'), (whole, inner) => {
      const val = (v[inner] || '').trim();
      return val ? val : whole;
    });
  }

  /* Split text into plain and field parts, so the UI can build nodes safely. */
  function tokenize(text, values) {
    const v = values || {};
    const parts = [];
    const re = new RegExp(TOKEN_SRC, 'g');
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parts.push({ text: text.slice(last, m.index) });
      const val = (v[m[1]] || '').trim();
      parts.push(val ? { text: val, filled: true } : { text: m[0], blank: true });
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ text: text.slice(last) });
    return parts;
  }

  /* Escaped HTML with fields highlighted (used for card snippets). */
  function highlight(text) {
    return PS.esc(text).replace(new RegExp(TOKEN_SRC, 'g'), '<span class="tok">[$1]</span>');
  }

  /* ---------- Counts ---------- */
  const counts = {};
  PS.CATS.forEach(c => { counts[c] = 0; });
  ALL.forEach(p => { counts[p.c] = (counts[p.c] || 0) + 1; });

  const creatorCounts = new Map();
  ALL.forEach(p => { if (p.s && p.s !== 'Merged') creatorCounts.set(p.s, (creatorCounts.get(p.s) || 0) + 1); });
  const creators = Array.from(creatorCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  /* ---------- Search ---------- */
  const INDEX = ALL.map(p => ({ p, t: p.t.toLowerCase(), c: p.c.toLowerCase(), s: (p.s || '').toLowerCase(), x: p.x.toLowerCase() }));

  /* Every word must match somewhere; title and category matches rank higher. */
  function search(query) {
    const words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return ALL.slice();
    const hits = [];
    INDEX.forEach(e => {
      let score = 0;
      for (const w of words) {
        let s = 0;
        if (e.t.startsWith(w)) s += 12; else if (e.t.includes(w)) s += 8;
        if (e.c.includes(w)) s += 4;
        if (e.s.includes(w)) s += 3;
        if (e.x.includes(w)) s += 1;
        if (!s) return;
        score += s;
      }
      hits.push({ p: e.p, score });
    });
    hits.sort((a, b) => b.score - a.score || a.p.id - b.p.id);
    return hits.map(h => h.p);
  }

  function matches(p, query) {
    const q = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!q.length) return true;
    const hay = (p.t + ' ' + p.c + ' ' + p.s + ' ' + p.x).toLowerCase();
    return q.every(w => hay.includes(w));
  }

  window.PS = Object.assign(window.PS || {}, {
    model: {
      all: ALL, total: ALL.length, byId: id => BY_ID.get(id),
      counts, creators, fields, fieldCount: p => fields(p).length,
      render, tokenize, highlight, search, matches
    }
  });
})();
