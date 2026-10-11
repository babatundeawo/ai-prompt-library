/* Site sanity checks. Runs in GitHub Actions on every push and pull request.
   Fails (red cross) only for real problems: broken data, missing files,
   or links that point nowhere. Zero dependencies. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const errors = [];
const warnings = [];
const fail = m => errors.push(m);
const warn = m => warnings.push(m);
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const exists = f => fs.existsSync(path.join(root, f));

/* ---------- 1. Prompt data ---------- */
const sandbox = { window: {} };
try {
  vm.runInNewContext(read('js/data.js') + '\n;window.__P = typeof PROMPTS !== "undefined" ? PROMPTS : null;', sandbox);
} catch (err) { fail('js/data.js does not parse: ' + err.message); }
const prompts = sandbox.window.__P || [];
if (!prompts.length) fail('js/data.js defines no prompts');

const knownCats = new Set(['Image Generation', 'Social Media', 'Career & Resume', 'Presentations', 'Business Strategy', 'Productivity', 'Graphic Design', 'AI Image Templates', 'Video & Content', 'ChatGPT Design', 'Special Prompts']);
const ids = new Set();
for (const p of prompts) {
  const where = 'prompt #' + p.id + ' ("' + (p.t || '?') + '")';
  if (!Number.isInteger(p.id)) fail(where + ': id must be a whole number');
  if (ids.has(p.id)) fail(where + ': duplicate id');
  ids.add(p.id);
  for (const key of ['c', 't', 'x']) if (typeof p[key] !== 'string' || !p[key].trim()) fail(where + ': missing "' + key + '"');
  if (p.c && !knownCats.has(p.c)) warn(where + ': new category "' + p.c + '" (it will still work; add an icon in js/constants.js)');
  if (p.x && /\[\s*\]/.test(p.x)) warn(where + ': contains an empty [] field');
}

/* ---------- 2. Local references in HTML, CSS, manifest, service worker ---------- */
const pages = fs.readdirSync(root).filter(f => f.endsWith('.html'));
const refRe = /(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g;
for (const page of pages) {
  const html = read(page).replace(/<base [^>]*>/g, '');
  let m;
  while ((m = refRe.exec(html))) {
    const ref = m[1];
    if (/^(https?:|mailto:|data:|\/\/)/.test(ref)) continue;
    if (!exists(ref.replace(/^\.\//, '')) && ref !== './') fail(page + ' links to a missing file: ' + ref);
  }
  if (/\sstyle="/.test(html)) fail(page + ' has an inline style attribute, which the Content Security Policy blocks');
  if (!/<title>[^<]{10,}<\/title>/.test(html)) fail(page + ' needs a descriptive <title>');
  if (!/name="description" content="[^"]{50,}"/.test(html)) warn(page + ' has a short or missing meta description');
}

for (const css of fs.readdirSync(path.join(root, 'css'))) {
  const text = read('css/' + css);
  for (const m of text.matchAll(/url\(["']?(?!data:|https?:)([^"')]+)["']?\)/g)) {
    const target = path.normalize(path.join('css', m[1]));
    if (!exists(target)) fail('css/' + css + ' references a missing file: ' + m[1]);
  }
}

const manifest = JSON.parse(read('manifest.webmanifest'));
for (const icon of manifest.icons) if (!exists(icon.src)) fail('manifest icon missing: ' + icon.src);

const sw = read('sw.js');
const shell = [...sw.slice(sw.indexOf('SHELL = ['), sw.indexOf('];', sw.indexOf('SHELL = ['))).matchAll(/'([^']+)'/g)].map(m => m[1]);
for (const f of shell) if (f !== './' && !exists(f)) fail('sw.js caches a file that does not exist: ' + f);
for (const f of fs.readdirSync(path.join(root, 'js'))) {
  if (f !== 'pwa.js' && !shell.includes('js/' + f)) warn('js/' + f + ' is not in the offline cache list in sw.js');
}

/* ---------- 3. Sitemap ---------- */
for (const m of read('sitemap.xml').matchAll(/<loc>[^<]*\/ai-prompt-library\/([^<]*)<\/loc>/g)) {
  const f = m[1] || 'index.html';
  if (!exists(f)) fail('sitemap.xml lists a page that does not exist: ' + f);
}

/* ---------- Report ---------- */
for (const w of warnings) console.log('::warning::' + w);
for (const e of errors) console.log('::error::' + e);
console.log(`\nChecked ${prompts.length} prompts and ${pages.length} pages: ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
