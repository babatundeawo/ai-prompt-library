/* ============================================================
   PromptOS — Category constants: icons, colors, ordered list
   ============================================================ */
const ICONS = {
"Image Generation":'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
"Social Media":'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>',
"Career & Resume":'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
"Presentations":'<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
"Business Strategy":'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
"Productivity":'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
"Graphic Design":'<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
"AI Image Templates":'<rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="9" height="7" rx="1"/><rect x="16" y="14" width="5" height="7" rx="1"/>',
"Video & Content":'<rect x="2" y="2" width="20" height="20" rx="2.2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>',
"ChatGPT Design":'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/>',
"Special Prompts":'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
};

const COLORS = {
"Image Generation":  {h:"#EA580C",bg:"rgba(234,88,12,.08)", bg2:"rgba(234,88,12,.14)", bo:"rgba(234,88,12,.28)"},
"Social Media":       {h:"#DB2777",bg:"rgba(219,39,119,.08)",bg2:"rgba(219,39,119,.14)",bo:"rgba(219,39,119,.28)"},
"Career & Resume":    {h:"#2563EB",bg:"rgba(37,99,235,.08)", bg2:"rgba(37,99,235,.14)", bo:"rgba(37,99,235,.28)"},
"Presentations":      {h:"#7C3AED",bg:"rgba(124,58,237,.08)",bg2:"rgba(124,58,237,.14)",bo:"rgba(124,58,237,.28)"},
"Business Strategy":  {h:"#0D9488",bg:"rgba(13,148,136,.08)",bg2:"rgba(13,148,136,.14)",bo:"rgba(13,148,136,.28)"},
"Productivity":       {h:"#CA8A04",bg:"rgba(202,138,4,.08)", bg2:"rgba(202,138,4,.14)", bo:"rgba(202,138,4,.28)"},
"Graphic Design":     {h:"#9333EA",bg:"rgba(147,51,234,.08)",bg2:"rgba(147,51,234,.14)",bo:"rgba(147,51,234,.28)"},
"AI Image Templates": {h:"#059669",bg:"rgba(5,150,105,.08)", bg2:"rgba(5,150,105,.14)", bo:"rgba(5,150,105,.28)"},
"Video & Content":    {h:"#E11D48",bg:"rgba(225,29,72,.08)", bg2:"rgba(225,29,72,.14)", bo:"rgba(225,29,72,.28)"},
"ChatGPT Design":     {h:"#0891B2",bg:"rgba(8,145,178,.08)", bg2:"rgba(8,145,178,.14)", bo:"rgba(8,145,178,.28)"},
"Special Prompts":    {h:"#4F46E5",bg:"rgba(79,70,229,.08)", bg2:"rgba(79,70,229,.14)", bo:"rgba(79,70,229,.28)"}
};

const CATS = ["Image Generation","Social Media","Career & Resume","Presentations","Business Strategy","Productivity","Graphic Design","AI Image Templates","Video & Content","ChatGPT Design","Special Prompts"];

function icon(c,cls){
  return '<svg class="'+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[c]||'')+'</svg>';
}
function cSlug(c){return c.toLowerCase().replace(/ & /g,'-').replace(/ /g,'-');}

// Builds a link from the current page to the library, pre-filtered
// by category. Every page's category links point here.
function catUrl(c){
  return (c === 'All') ? 'library.html' : 'library.html?cat=' + encodeURIComponent(c);
}

window.ICONS = ICONS;
window.COLORS = COLORS;
window.CATS = CATS;
window.icon = icon;
window.cSlug = cSlug;
window.catUrl = catUrl;
