/* ============================================================
   PromptOS: shared constants and small helpers
   Defines the global namespace `PS` that every other script uses.
   ============================================================ */
(function () {
  'use strict';

  /* Line icons for each category (inner SVG markup, 24x24 viewBox). */
  const CAT_ICONS = {
    'Image Generation': '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    'Social Media': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>',
    'Career & Resume': '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    'Presentations': '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
    'Business Strategy': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    'Productivity': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    'Graphic Design': '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
    'AI Image Templates': '<rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="9" height="7" rx="1"/><rect x="16" y="14" width="5" height="7" rx="1"/>',
    'Video & Content': '<rect x="2" y="2" width="20" height="20" rx="2.2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>',
    'ChatGPT Design': '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/>',
    'Special Prompts': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
  };

  /* Display order. The position in this list also picks the colour class (.c-0 ... .c-10). */
  const CATS = ['Image Generation', 'Social Media', 'Career & Resume', 'Presentations', 'Business Strategy', 'Productivity', 'Graphic Design', 'AI Image Templates', 'Video & Content', 'ChatGPT Design', 'Special Prompts'];

  /* Interface icons (inner SVG markup, 24x24 viewBox). */
  const UI = {
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
    star: '<polygon points="12 2.5 15.1 8.8 22 9.8 17 14.7 18.2 21.5 12 18.3 5.8 21.5 7 14.7 2 9.8 8.9 8.8 12 2.5"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4.5A2.5 2.5 0 0 1 2 12.5v-8A2.5 2.5 0 0 1 4.5 2h8A2.5 2.5 0 0 1 15 4.5V5"/>',
    check: '<path d="m4.5 12.5 5 5 10-11"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
    library: '<path d="M4 4.5v15M9 4.5v15"/><rect x="13.5" y="4.5" width="6" height="15" rx="1" transform="rotate(-8 16.5 12)"/>',
    info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16.5V12M12 8h.01"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    corner: '<path d="M9 10 4 15l5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>'
  };

  const SVG_ATTR = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

  function svg(inner, cls) {
    return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' ' + SVG_ATTR + '>' + inner + '</svg>';
  }
  function ui(name, cls) { return svg(UI[name] || '', cls); }

  /* Categories found in the data but missing from CATS are appended, so adding a
     prompt with a brand-new category never breaks the site. */
  function allCats() {
    const extra = [];
    (window.PROMPTS || []).forEach(p => {
      if (CATS.indexOf(p.c) === -1 && extra.indexOf(p.c) === -1) extra.push(p.c);
    });
    return CATS.concat(extra);
  }
  const ORDER = allCats();

  function catIndex(c) { const i = ORDER.indexOf(c); return i < 0 ? 0 : i; }
  function catClass(c) { return 'c-' + (catIndex(c) % 11); }
  function catIcon(c, cls) { return svg(CAT_ICONS[c] || CAT_ICONS['Special Prompts'], cls); }
  function catUrl(c) { return !c || c === 'All' ? 'library.html' : 'library.html?cat=' + encodeURIComponent(c); }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }

  window.PS = Object.assign(window.PS || {}, {
    CATS: ORDER, svg, ui, esc, plural, catIndex, catClass, catIcon, catUrl
  });
})();
