# Changing colours, text, images and fonts

All edits can be made on github.com: open a file, click the pencil icon, edit, and **Commit changes**.

## Colours

Open `css/tokens.css`. Each colour is one line written as `light-dark(LIGHT, DARK)`, so you set the light theme and dark theme together:

```css
--primary: light-dark(#D73A10, #FF6B3D);
```

Main colours: `--primary` (buttons and highlights), `--accent` (small positive details), `--bg` (page), `--ink` (text). Keep text colours dark enough on light backgrounds; the file notes which pairs matter.

Category colours are the `.c-0` to `.c-10` lines at the bottom of the file. The number is a hue angle from 0 to 360.

## Fonts

Fonts live in `assets/fonts` and are declared at the top of `css/tokens.css`. To use a different font, upload its `.woff2` file to `assets/fonts`, then change the `src` and `font-family` in the matching `@font-face` block and in `--font-display`, `--font-sans` or `--font-mono`. Only use fonts whose licence allows web use, and add the licence file next to the font.

## Prompts

All prompts are in `js/data.js`. Each looks like this:

```js
{id:218, c:"Social Media", s:"@creator", t:"Prompt title", ph:0, x:`The prompt text with a [BLANK] in it.`},
```

- `id` must be a unique whole number.
- `c` must be one of the existing category names.
- `s` is the creator credit shown on the card.
- `t` is the title and `x` is the text. Put each blank in square brackets, like `[BRAND NAME]`. Add a hint after `e.g.`, like `[OUTFIT, e.g. red jacket]`. Brackets with no letters (such as `[0:00-0:02]`) are not treated as blanks.
- `ph` is no longer used; leave it as `0`.

Counts, field numbers and the credits list update by themselves. The checks run on every change and tell you if an id is repeated.

## Text on the pages

Page wording is in `index.html`, `library.html`, `favorites.html`, `about.html` and `404.html`. The header and footer are repeated at the top and bottom of each of these files, so change them in all five.

## Images and icons

- Logo mark: the bracket-and-dot shape is inline in each page header and in `assets/icons/favicon.svg`.
- App and tab icons: `assets/icons/` (replace the PNGs with same-sized files).
- Social sharing image: `assets/og/og-image.png` (1200 x 630).

## Site address

The address `https://babatundeawo.github.io/ai-prompt-library/` appears in `<link rel="canonical">` and `og:` tags near the top of each page, in `sitemap.xml` and in `robots.txt`. If you move the site to a new address, change it in all of them. `404.html` also contains `<base href="/ai-prompt-library/">`; change it to `/` if the site moves to the root of a custom domain.

## Offline file list

If you add a new file the site needs (for example a new script), also add its name to the `SHELL` list in `sw.js` so it works offline. The checks warn you if you forget.
