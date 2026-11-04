# Glute training handout (Pillar 1)

`glute-exercise-handout.pdf` is built from `public/glute-training/assets/glute-data.js`, so exercises and plans stay in sync.

Rebuild: `node handouts/build-handout.js` (uses the pre-installed Playwright and Chromium).
Check: `node handouts/verify-handout.js` (needs poppler-utils).

- `build-handout.js` reads the data, writes `glute-exercise-handout.html` and renders the PDF.
- `plain-language.js` holds the plain-language core sentences, plus the few step, cue and joint-note rewrites for jargon-heavy source text.
- `handout.css` is the print stylesheet (brand tokens only).
- `fonts/` holds Cormorant Garamond and Outfit (latin subsets, SIL Open Font License), fetched once from Google Fonts.
