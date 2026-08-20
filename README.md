# ✦ PromptOS — AI Prompt Library

> A curated, searchable library of **217 AI prompts** across **11 categories** — styled as a light, tech-focused "dev tool" interface. Fully editable, one-click copy, favourites that persist, mobile-first, works offline.

🔗 **Live site:** [babatundeawo.github.io/ai-prompt-library](https://babatundeawo.github.io/ai-prompt-library/)

---

## 🆕 What changed in this upgrade

The project was rebuilt from a single 4,000+ line `index.html` into a proper **multi-page, multi-file site** — same zero-build, zero-framework philosophy, but organised the way a modern static site should be:

- **Four real pages** instead of one monolithic file — `index.html` (home), `library.html` (the searchable tool), `favorites.html`, `about.html`. Each is a standalone, shareable, crawlable URL.
- **CSS split by concern** — `variables.css` (tokens/reset), `layout.css` (sidebar/topbar/hero/footer), `components.css` (cards/buttons/badges/FAQ), `responsive.css` (all breakpoints in one place).
- **JS split into modules** — data, constants, storage, card rendering, navigation, and one small controller per page. No bundler needed; plain `<script>` tags, loaded in dependency order.
- **Favourites now persist** — previously lost on refresh (in-memory only); now saved to `localStorage` and kept in sync live across every page and tab.
- **Category links are real URLs** — `library.html?cat=Social+Media` works as a direct link or bookmark, and is also intercepted for instant, no-reload filtering when you're already on the library page. Browser back/forward works correctly.
- **New Home and About pages** — a proper landing page (hero, category showcase, featured prompts, feature grid) and an About page (how it works, FAQ) that didn't exist before.
- **New mobile bottom tab bar** — now surfaces the four pages (Home / All Prompts / Favourites / About) instead of a scrolling row of categories, which is a more standard and discoverable mobile pattern. Categories are still one tap away via the sidebar drawer.
- **Small bug fix carried over from the original CSS** — category section headings (e.g. "Image Generation (103)") now correctly span the full grid width on 2- and 3-column layouts instead of collapsing into a single grid cell.
- **Accessibility touches** — a skip-to-content link, `aria-pressed`/`aria-expanded`/`aria-current` states, and `prefers-reduced-motion` support carried through to the new components.

---

## ✨ Design

A bright, light, tech-product aesthetic, extended (not replaced) from the original:

- **Light theme** — white/off-white surfaces (`#FAFBFE`), soft dot-grid texture, no dark mode fatigue
- **"Dev tool" identity** — each prompt card is styled like a code-editor tab (coloured dot + mono filename like `image-generation/042.prompt`); the home hero now echoes this with a floating stack of "open file" cards
- **Typeface system** — Space Grotesk (headings), Manrope (body), JetBrains Mono (code/prompts/badges)
- **Brand gradient** — Indigo → Cyan → Tangerine, used across the logo mark, hero headlines, blobs, and the new CTA band
- **Custom line-icon set** — every category has a hand-picked SVG icon, colour-coded and consistent across sidebar, hero tiles, home showcase cards, and mobile nav
- **Mobile-first** — built from a 360px base upward through 5 breakpoints (420 / 640 / 960 / 1240 / 1600px); sidebar becomes a slide-over drawer below 960px with a bottom tab bar taking over primary navigation

---

## 📂 Categories

| Icon | Category | Count |
|---|---|---|
| 🖼️ | Image Generation | 103 |
| 💼 | Career & Resume | 19 |
| 💬 | Social Media | 18 |
| 🧩 | AI Image Templates | 16 |
| ⚡ | Productivity | 15 |
| 🎤 | Presentations | 10 |
| 📈 | Business Strategy | 10 |
| 🖌️ | Graphic Design | 8 |
| 🎬 | Video & Content | 7 |
| ✨ | ChatGPT Design | 6 |
| ⭐ | Special Prompts | 5 |

---

## 🚀 Features

- 🔍 Instant search across titles, categories, sources, and full prompt text — live on the library and favourites pages, redirects into the library from anywhere else
- ✏️ Every prompt is a live, editable `<textarea>` — fill in `[FIELDS]` directly
- ↺ One-click reset back to the original prompt text
- 📋 One-click copy with toast confirmation
- ⭐ Favourites system, persisted to `localStorage`, with a dedicated page and a favourites-only toggle in the library
- 🔢 Field-count badge on every card (how many `[PLACEHOLDERS]` to fill)
- ↕️ Sort: Default / A→Z / Most fields / Fewest fields
- 🗺️ Shareable, filtered category URLs (`library.html?cat=Presentations`)
- 📱 Bottom tab bar on mobile, persistent sidebar on desktop (≥960px)
- ⌨️ Press `/` to focus search, `Esc` to close menu/blur search
- 🌐 Plain HTML/CSS/JS — zero build step, zero JS frameworks

---

## 🗂️ Repository Structure

```
ai-prompt-library/
├── index.html          # Home page — hero, category showcase, featured prompts
├── library.html         # The core tool — search, filter, sort, favourite, copy
├── favorites.html       # Saved prompts (reads from localStorage)
├── about.html            # How it works + FAQ
├── css/
│   ├── variables.css     # Design tokens, reset, global rules
│   ├── layout.css        # Sidebar, topbar, hero, footer, bottom nav
│   ├── components.css    # Cards, buttons, badges, FAQ, empty states
│   └── responsive.css     # All breakpoints
├── js/
│   ├── data.js            # The 217 prompts (generated data module)
│   ├── constants.js       # Category icons, colours, ordered list
│   ├── storage.js          # localStorage-backed favourites store
│   ├── cards.js            # Card template + copy/reset/favourite/toast logic
│   ├── nav.js               # Sidebar, bottom nav, mobile drawer, search wiring
│   ├── library.js           # library.html page controller
│   ├── favorites.js         # favorites.html page controller
│   ├── home.js               # index.html page controller
│   └── about.js               # about.html page controller
├── README.md
└── .nojekyll              # Tells GitHub Pages to serve files as-is
```

---

## 🚀 Deployment (GitHub Pages)

1. Push this folder's contents to the root of your `ai-prompt-library` repo (replacing the old `index.html`).
2. **Settings → Pages → Branch: main / (root) → Save**
3. Wait 1–3 minutes → live at your GitHub Pages URL.

No build step, no `npm install` — it's static files served as-is.

---

## 🛠️ Built With

Plain HTML, CSS & JavaScript — zero frameworks, zero dependencies beyond Google Fonts.
Originally built by, and upgraded for, **[Babatunde Awoyemi](https://github.com/babatundeawo)**.

---

<p align="center">
  Made with ♥ &nbsp;·&nbsp;
  <a href="https://babatundeawo.github.io/ai-prompt-library/">Live Demo</a>
</p>
