# ✦ PromptOS — AI Prompt Library

> A curated, searchable library of **217 AI prompts** across **11 categories** — styled as a light, tech-focused "dev tool" interface. Fully editable, one-click copy, mobile-first, works offline.

🔗 **Live site:** [techbaseng.github.io/ai-prompt-library](https://techbaseng.github.io/ai-prompt-library/)

---

## ✨ Design

A complete visual refresh built around a **bright, light, tech-product aesthetic**:

- **Light theme** — white/off-white surfaces (`#FAFBFE`), soft dot-grid texture, no dark mode fatigue
- **"Dev tool" identity** — each prompt card is styled like a code-editor tab (colored dot + mono filename like `image-generation/042.prompt`), prompt text sits in a code-pane with a colored left gutter
- **Typeface system** — Space Grotesk (headings), Manrope (body), JetBrains Mono (code/prompts/badges)
- **Brand gradient** — Indigo → Cyan → Tangerine, used in the logo mark, hero headline, and soft animated blob backgrounds
- **Custom line-icon set** — every category has a hand-picked SVG icon (no emoji), color-coded and consistent throughout sidebar, hero tiles, and mobile nav
- **Mobile-first** — built from a 360px base upward through 5 breakpoints (420 / 640 / 960 / 1240 / 1600px); sidebar becomes a slide-over drawer below 960px with a bottom tab bar taking over navigation

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

- 🔍 Instant search across titles, categories, sources, and full prompt text
- ✏️ Every prompt is a live, editable `<textarea>` — fill in `[FIELDS]` directly
- ↺ One-click reset back to the original prompt text
- 📋 One-click copy with toast confirmation
- ⭐ Favourites system with a dedicated filter toggle
- 🔢 Field-count badge on every card (how many `[PLACEHOLDERS]` to fill)
- ↕️ Sort: Default / A→Z / Most fields / Fewest fields
- 📱 Bottom tab bar on mobile, persistent sidebar on desktop (≥960px)
- ⌨️ Press `/` to focus search, `Esc` to close menu/blur search
- 🌐 Single self-contained HTML file — zero build step, zero JS frameworks

---

## 🗂️ Repository Structure

```
ai-prompt-library/
├── index.html        # The complete app — all 217 prompts, styles, and logic
├── README.md          # This file
└── .nojekyll          # Tells GitHub Pages to serve the file as-is
```

---

## 🚀 Deployment (GitHub Pages)

1. Create a **public** repo named `ai-prompt-library` on [github.com/new](https://github.com/new)
2. Upload `index.html`, `README.md`, and `.nojekyll` to the repo root
3. **Settings → Pages → Branch: main / (root) → Save**
4. Wait 1–3 minutes → live at **https://techbaseng.github.io/ai-prompt-library/**

---

## 🛠️ Built With

Plain HTML, CSS & JavaScript — zero frameworks, zero dependencies beyond Google Fonts.
Built and maintained by **[Babatunde Awoyemi](https://github.com/techbaseng)**.

---

<p align="center">
  Made with ♥ by <a href="https://github.com/techbaseng">techbaseng</a> &nbsp;·&nbsp;
  <a href="https://techbaseng.github.io/ai-prompt-library/">Live Demo</a>
</p>
