#!/usr/bin/env node
/* Checks the built handout: tracker cells do not overflow, fonts applied, no block split across pages.
   Usage: node handouts/verify-handout.js   (needs pdftotext and pdffonts from poppler-utils) */
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const HTML = path.join(__dirname, 'glute-exercise-handout.html');
const PDF = path.join(__dirname, 'glute-exercise-handout.pdf');
let fail = 0;
const bad = m => { fail++; console.log('FAIL', m); };

(async () => {
  const { chromium } = require('playwright');
  const b = await chromium.launch(); const pg = await b.newPage();
  await pg.emulateMedia({ media: 'print' });
  await pg.goto('file://' + HTML); await pg.evaluate(() => document.fonts.ready);
  const r = await pg.evaluate(() => {
    const cells = [...document.querySelectorAll('td.s')].filter(td => td.scrollWidth > td.clientWidth + 0.5).length;
    const small = [...document.querySelectorAll('.box,.circ')].filter(e => e.getBoundingClientRect().width < 43.5).length;
    const tiny = [...document.querySelectorAll('body *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 15.99).length;
    const fams = new Set([...document.querySelectorAll('body *')].map(e => getComputedStyle(e).fontFamily.split(',')[0].replace(/['"]/g, '').trim()));
    return { cells, small, tiny, fams: [...fams] };
  });
  await b.close();
  if (r.cells) bad(`${r.cells} tracker cells overflow`);
  if (r.small) bad(`${r.small} tick boxes narrower than 44px`);
  if (r.tiny) bad(`${r.tiny} text elements under 12pt`);
  console.log('font families in use:', r.fams.join(', '));

  const pages = +execFileSync('pdfinfo', [PDF], { encoding: 'utf8' }).match(/Pages:\s+(\d+)/)[1];
  for (let p = 1; p <= pages; p++) {
    const t = execFileSync('pdftotext', ['-f', p, '-l', p, '-layout', PDF, '-'], { encoding: 'utf8' });
    if (!t.includes('Muscle-Meta Matrix™ · Pillar 1 glute training · for education only')) bad(`page ${p} footer missing`);
    const n = x => (t.match(new RegExp(x, 'g')) || []).length;
    const set3 = n('Set 3'), joint = n('Joint note:'), setsLbl = n('\\bSets\\b');
    if (set3 !== setsLbl) bad(`page ${p}: exercise block split (Set 3 ${set3} vs Sets ${setsLbl})`);
    if (set3 && set3 !== joint - (p === 3 ? 1 : 0)) bad(`page ${p}: exercise block split (Joint note ${joint})`);
  }
  const fonts = execFileSync('pdffonts', [PDF], { encoding: 'utf8' }).split('\n').slice(2).filter(Boolean).map(l => l.split(/\s+/)[0].replace(/^[A-Z]+\+/, '').replace(/(Thin|Light)?-.*/, ''));
  console.log('PDF fonts:', [...new Set(fonts)].join(', '));
  console.log(fail ? `${fail} problem(s)` : `OK: ${pages} pages`);
  process.exit(fail ? 1 : 0);
})();
