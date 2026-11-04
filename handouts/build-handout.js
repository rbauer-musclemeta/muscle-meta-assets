#!/usr/bin/env node
/* Builds handouts/glute-exercise-handout.html and .pdf from the glute module data.
   Usage:  node handouts/build-handout.js [--html-only]
   Needs:  node, the pre-installed Playwright + Chromium, and curl (first run only, to fetch
           the Cormorant Garamond and Outfit font files into handouts/fonts/). */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const HERE = __dirname;
const ROOT = path.join(HERE, '..');
const DATA_JS = path.join(ROOT, 'public/glute-training/assets/glute-data.js');
const TOKENS = path.join(ROOT, 'public/glute-training/assets/tokens.css');
const OUT_HTML = path.join(HERE, 'glute-exercise-handout.html');
const OUT_PDF = path.join(HERE, 'glute-exercise-handout.pdf');
const FOOTER = 'Muscle-Meta Matrix™ · Pillar 1 glute training · for education only';

/* ------------------------------------------------------------------ data */
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(DATA_JS, 'utf8'), sandbox, { filename: DATA_JS });
const { CATS, LEVELS, EXERCISES, PLANS, byId } = sandbox.window.MMGlute;
const PL = require('./plain-language.js');

/* ---------------------------------------------------------- brand tokens */
(function checkTokens() {
  const css = fs.readFileSync(TOKENS, 'utf8');
  const want = { teal: '#009090', 'teal-dark': '#006b6b', 'teal-muted': '#e6f5f5', gold: '#D4AF37', 'gold-muted': '#faf6e8',
    ink: '#1a2332', 'ink-soft': '#344256', surface: '#f7f6f3', border: '#e8e6e1', white: '#ffffff' };
  for (const [k, v] of Object.entries(want)) {
    const m = css.match(new RegExp('--' + k + ':\\s*(#[0-9a-fA-F]{6})'));
    if (!m || m[1].toLowerCase() !== v.toLowerCase()) throw new Error(`Token --${k} in tokens.css (${m && m[1]}) does not match handout palette ${v}`);
  }
})();

/* ----------------------------------------------------------------- fonts */
function ensureFonts() {
  const dir = path.join(HERE, 'fonts');
  const cssFile = path.join(dir, 'fonts.css');
  if (fs.existsSync(cssFile)) return fs.readFileSync(cssFile, 'utf8');
  fs.mkdirSync(dir, { recursive: true });
  const url = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Outfit:wght@400;500;600;700&display=swap';
  const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
  const src = execFileSync('curl', ['-sS', '-m', '30', '-A', ua, url], { encoding: 'utf8' });
  const blocks = src.split('/* ').slice(1).filter(b => b.startsWith('latin */'));
  let out = '';
  for (const b of blocks) {
    const fam = b.match(/font-family:\s*'([^']+)'/)[1];
    const style = b.match(/font-style:\s*(\w+)/)[1];
    const weight = b.match(/font-weight:\s*(\d+)/)[1];
    const remote = b.match(/url\((https:[^)]+)\)/)[1];
    const file = `${fam.replace(/\s+/g, '-').toLowerCase()}-${weight}-${style}.woff2`;
    execFileSync('curl', ['-sS', '-m', '60', '-o', path.join(dir, file), remote]);
    out += `@font-face{font-family:'${fam}';font-style:${style};font-weight:${weight};font-display:block;src:url(fonts/${file}) format('woff2');}\n`;
  }
  if (!out) throw new Error('Could not fetch fonts from Google Fonts');
  fs.writeFileSync(cssFile, out);
  return out;
}

/* ----------------------------------------------------------------- icons */
const ic = (body, s = 24, sw = 2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const ICON = {
  bridge: '<circle cx="4.5" cy="16.5" r="1.5"/><path d="M7 18l4-7h5l4 7M3 20.5h18"/>',
  squat:  '<path d="M8 4v7h9M8 11v9M17 11v9M5 4h3"/>',
  hinge:  '<circle cx="17" cy="5.5" r="1.6"/><path d="M15.5 7.5L8 11l1 9M8 11l-4-1"/>',
  abd:    '<circle cx="12" cy="4.5" r="1.6"/><path d="M12 7v6M12 13l-5 7M12 13l5 7"/>',
  check:  '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
  adjust: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  stop:   '<path d="M8.5 3h7L21 8.5v7L15.5 21h-7L3 15.5v-7z"/><path d="M8 12h8"/>',
  info:   '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  dumbbell: '<path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12"/>'
};
const logo = `<svg width="46" height="46" viewBox="0 0 40 40" aria-hidden="true"><rect x="0" y="2" width="38" height="38" rx="9" fill="#009090"/><path d="M22 8L12 23h7l-2 11 11-16h-7z" fill="#ffffff"/><rect x="29" y="0" width="10" height="10" rx="3" fill="#D4AF37"/></svg>`;
const dots = n => `<svg width="46" height="14" viewBox="0 0 46 14" aria-hidden="true">${[0, 1, 2].map(i => `<circle cx="${7 + i * 16}" cy="7" r="5" ${i < n ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2"'}/>`).join('')}</svg>`;

/* ---------------------------------------------------------------- helpers */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const CAT_ORDER = ['bridge', 'squat', 'hinge', 'abd'];
const PAT_NAME = { bridge: 'Thrust or bridge', squat: 'Squat or lunge', hinge: 'Hinge', abd: 'Abduction' };
const issues = [];

function exerciseText(e) {
  const o = PL.EX[e.id] || {};
  if (!o.core) throw new Error(`plain-language.js has no "core" sentence for ${e.id}`);
  return {
    core: o.core,
    steps: (o.steps || e.steps).slice(0, 3),
    cues: (o.cues || e.cues).slice(0, 2),
    easier: o.easier || e.easier,
    harder: o.harder || e.harder,
    joint: o.joint || e.joint
  };
}

const CHECKS = ['Setup is stable and supported', 'I know my starting position', 'Movement is slow and controlled',
  'I am breathing out on effort', 'I stayed within a comfortable range', 'No sharp pain'];

function exerciseBlock(e) {
  const t = exerciseText(e);
  const lv = LEVELS[e.lvl];
  return `
<article class="ex" id="${e.id}">
  <div class="ex-h">
    <div>
      <h3>${esc(e.name)}</h3>
      <div class="meta"><span>${ic(ICON[e.cat], 18)}${esc(CATS[e.cat].label)}</span><span>${ic(ICON.dumbbell, 18)}${esc(e.equip === 'None' ? 'No equipment' : e.equip)}</span></div>
    </div>
    <span class="lvl l${e.lvl}" title="Level ${e.lvl}">${dots(e.lvl)}${esc(lv.name)}</span>
  </div>
  <p class="core"><strong>Core idea:</strong> ${esc(t.core)}</p>
  <div class="cols">
    <section><h4>Easy instructions</h4><ol>${t.steps.map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol></section>
    <section><h4>Key cues</h4><ul>${t.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
      <p><strong>Make it easier:</strong> ${esc(t.easier)}</p>
      <p><strong>Make it harder:</strong> ${esc(t.harder)}</p></section>
  </div>
  <div class="joint">${ic(ICON.info, 20)}<div><strong>Joint note:</strong> ${esc(t.joint)}</div></div>
  <div class="check">${CHECKS.map(c => `<label class="cb"><i class="box"></i><span>${esc(c)}</span></label>`).join('')}</div>
  <div class="sets"><strong>Sets</strong>${[1, 2, 3].map(n => `<span class="cb"><i class="circ"></i>Set ${n}</span>`).join('')}</div>
</article>`;
}

/* ----------------------------------------------------------------- pages */
function cover() {
  const rows = [
    ['P1-C1', 'Joint health', 'Strong glutes share the work that would otherwise fall on your hips, knees and lower back.'],
    ['P1-C2', 'Functional independence', 'Standing up from a chair, climbing stairs and getting up from the floor all lean on your glutes.'],
    ['P1-C3', 'Mobility', 'Moving your hips through a comfortable range helps you walk, turn and reach with ease.'],
    ['P1-C4', 'Strength', 'Your glutes are among the largest muscles in your body, and they respond well to steady, gradual loading.'],
    ['P1-C5', 'Endurance', 'Glute stamina helps you keep walking and standing without tiring early.']
  ];
  return `
<section class="cover">
  <div class="brandrow">${logo}<span class="wm">Muscle-Meta Matrix™</span></div>
  <p class="eyebrow">Pillar 1 · Exercise &amp; Mobility</p>
  <h1>Glute training handout</h1>
  <p class="tag">Small Steps. Exponential Gains.™</p>
  <p class="intro">Your glutes are the large muscles around your hips. They help you stand up from a chair, climb stairs, walk steadily and keep your hips and knees comfortable. This handout gives you ${EXERCISES.length} exercises to choose from, a simple way to plan each week, and a tracker to tick off your sets, all at your pace and on your terms.</p>
  <p class="eyebrow" style="margin-bottom:6px">How glute training supports Pillar 1</p>
  <div class="cmap">${rows.map(r => `<div class="row"><span class="key">${r[0]}</span><div><strong>${r[1]}</strong>${esc(r[2])}</div></div>`).join('')}</div>
  <p class="note">Take your time with each page. If anything feels unclear, ask your clinician before you start.</p>
</section>`;
}

function howTo() {
  const inReserve = n => Array.from({ length: 10 }, (_, i) => `<span class="rep ${i >= 10 - n ? 'r' : ''}"></span>`).join('');
  return `
<section class="pb">
  <p class="eyebrow">Before you begin</p>
  <h2 class="pg">How to use this handout</h2>

  <div class="card avoid">
    <h4>The rule of thirds: 3 days a week, 4 movement families</h4>
    <p>Train on 3 days a week, for example Monday, Wednesday and Friday. In each session, pick <strong>one exercise from each of the four families</strong> below. Change your picks from session to session so your hips are challenged in different ways.</p>
    <div class="thirds">${CAT_ORDER.map(c => `<div class="t">${ic(ICON[c], 26)}<b>${PAT_NAME[c]}</b>pick one</div>`).join('')}</div>
  </div>

  <div class="card avoid">
    <h4>Effort guide: leave a few reps in the tank</h4>
    <p>At <strong>Foundation</strong>, stop each set with <strong>3 to 4 reps still in reserve</strong>. That means you could have done 3 or 4 more with good form.</p>
    <div class="meter">${inReserve(4)}<span class="lbl">Example: 10 reps done well, 3 or 4 more possible</span></div>
    <p>At Build and Advance you may work closer to hard, but keep a clear margin and never train to the point of failure on hinge exercises.</p>
  </div>

  <div class="card pre avoid">
    <h4>Pre-session checklist</h4>
    <div class="pre2">
      <label class="cb"><i class="box"></i><span>I have warmed up with a few minutes of easy walking or marching on the spot</span></label>
      <label class="cb"><i class="box"></i><span>I have water nearby</span></label>
      <label class="cb"><i class="box"></i><span>I have clear space and a non-slip floor</span></label>
      <div class="cb feel"><strong>How do I feel today?</strong><label class="cb"><i class="box"></i>Good</label><label class="cb"><i class="box"></i>Okay</label><label class="cb"><i class="box"></i>Tired</label></div>
      <label class="cb"><i class="box"></i><span>A sturdy chair, counter or wall is within reach for support</span></label>
    </div>
  </div>
</section>
<section class="pb">
  <p class="eyebrow">While you train</p>
  <h2 class="pg">Listen to your body</h2>
  <p class="lede">Some effort is expected. Use this guide during every session to decide whether to carry on, adjust or stop.</p>
  <div class="tri3">
    <div class="c ok"><h3>${ic(ICON.check, 30)}Carry on</h3><ul>
      <li>Warm, tired glutes and thighs</li><li>A mild stretch behind your thighs</li><li>Gentle muscle soreness that eases in a day or two</li><li>Working hard but still in control</li></ul></div>
    <div class="c adj"><h3>${ic(ICON.adjust, 30)}Adjust</h3><ul>
      <li>A pinch at the front of your hip</li><li>A mild joint ache</li><li>Form slipping as you tire</li><li>Feeling wobbly</li></ul>
      <p><strong>Try:</strong> an easier version, a smaller range, more support, a lighter load or a longer rest. If it keeps happening, mention it to your clinician.</p></div>
    <div class="c stop"><h3>${ic(ICON.stop, 30)}Stop and seek advice</h3><ul>
      <li>Sharp or catching joint pain</li><li>Chest pain</li><li>Dizziness</li><li>Unusual breathlessness</li><li>Numbness or tingling</li><li>Pain after a fall</li></ul></div>
  </div>
  <div class="card avoid" style="margin-top:12px">
    <h4>How to read each exercise page</h4>
    <ul class="read">
      <li><strong>Core idea.</strong> One sentence on what the exercise is for.</li>
      <li><strong>Easy instructions.</strong> Up to 3 short steps.</li>
      <li><strong>Key cues.</strong> Two reminders to keep in mind while you move.</li>
      <li><strong>Make it easier or harder.</strong> Move up or down to suit your day.</li>
      <li><strong>Joint note.</strong> Anything to watch for with your knees, hips or back.</li>
      <li><strong>Checklist and sets.</strong> Tick the boxes before you start, and tick a circle after each set.</li>
    </ul>
  </div>
</section>`;
}

function categorySection(cat) {
  const list = EXERCISES.filter(e => e.cat === cat).sort((a, b) => a.lvl - b.lvl);
  return `
<section class="pb">
  <div class="sec-head"><div class="ico">${ic(ICON[cat], 36)}</div>
    <div><p class="eyebrow">Movement family · ${list.length} exercises</p><h2>${esc(CATS[cat].label)}</h2><p class="d">${esc(PL.CATEGORY_INTRO[cat])}</p></div></div>
  <div class="card glance avoid"><h4>At a glance, by level</h4><div class="g3">${[1, 2, 3].map(l => `<div><b>${esc(LEVELS[l].name)}</b><ul>${list.filter(e => e.lvl === l).map(e => `<li>${esc(e.name)}</li>`).join('') || '<li>None at this level</li>'}</ul></div>`).join('')}</div></div>
  ${list.map(exerciseBlock).join('\n')}
</section>`;
}

/* Plan themes come from glute-data.js; swap a few technical words for plain ones. */
const plainTheme = t => t.replace(/unilateral/g, 'one-leg').replace(/bilateral/g, 'two-leg').replace(/Rotary control/g, 'Hip turning control').replace(/Heavy horizontal/g, 'Heavy bridge');

function slotName(sl) { const e = byId(sl[1]); if (!e) throw new Error('Unknown exercise in PLANS: ' + sl[1]); return e; }

function tracker(level) {
  const plan = PLANS[level];
  const lv = LEVELS[level];
  const weekly = plan.days.reduce((n, d) => n + d.slots.reduce((m, s) => m + s[2], 0), 0);
  const table = d => `
<table class="trk">
  <caption>${esc(d.name)}<span>${esc(plainTheme(d.theme))}</span></caption>
  <thead><tr><th>Exercise</th>${[1, 2, 3, 4].map(w => `<th>Week ${w}</th>`).join('')}</tr></thead>
  <tbody>${d.slots.map(sl => { const e = slotName(sl); return `<tr><td class="nm">${esc(e.name)}<small>${sl[2]} sets · ${esc(sl[3])}${/^[\d–-]+$/.test(sl[3]) ? ' reps' : ''}</small></td>${[1, 2, 3, 4].map(() => `<td class="s">${'<i class="box"></i>'.repeat(sl[2])}</td>`).join('')}</tr>`; }).join('')}</tbody>
</table>`;
  const head = `<div class="lvlhead"><div><p class="eyebrow">Weekly tracker · 4 weeks</p><h2>${esc(lv.name)}</h2></div><span class="lvl l${level}">${dots(level)}Level ${level}</span></div>
    <p class="lede">${esc(lv.blurb)} Tick one box for each set you finish. That is ${weekly} sets in a week across 3 sessions.</p>`;
  const notes = `<div class="wk">${[1, 2, 3, 4].map(w => `<div class="r"><b>Week ${w}</b><div class="ln"><em>Date</em><i class="short"></i><em>Notes</em><i></i></div><div class="ln"><i></i></div></div>`).join('')}</div>`;
  return `
<section class="pb">${head}${table(plan.days[0])}${table(plan.days[1])}</section>
<section class="pb"><p class="eyebrow">${esc(lv.name)} tracker, continued</p>${table(plan.days[2])}<h4 style="margin:4px 0 6px">Date and notes for each week</h4>${notes}</section>`;
}

function lastPage() {
  const careful = EXERCISES.filter(e => !e.flags.spine).map(e => `<li>${esc(e.name)}</li>`).join('');
  return `
<section class="pb">
  <p class="eyebrow">Keep it safe</p>
  <h2 class="pg">Safety summary</h2>
  <ul style="padding-left:20px;margin-bottom:8px">
    <li>Warm up first, and keep a stable support within reach.</li>
    <li>Move slowly, breathe out as you push or lift, and stay within a comfortable range.</li>
    <li>Choose the easier version on a tired day. A lighter session still counts.</li>
    <li>Discomfort that is mild and settles is fine. Sharp pain is a signal to stop.</li>
  </ul>
  <h3 style="font-size:22pt;margin-top:12px">Stop signs</h3>
  <p>Stop the exercise, sit or lie down safely, and contact your clinician if you notice any of these. For chest pain or pressure that does not settle quickly, get emergency medical help.</p>
  <div class="stops">
    ${['Chest pain', 'Dizziness', 'Unusual breathlessness', 'Sharp or catching joint pain', 'Numbness', 'Pain after a fall'].map(s => `<div class="s">${ic(ICON.stop, 30)}${s}</div>`).join('')}
  </div>
  <div class="disc avoid">
    <h4>Please read</h4>
    <ul>
      <li>This handout is for education only. It does not replace advice from your clinician.</li>
      <li>If you have had a hip or knee replacement, follow your surgeon's precautions.</li>
      <li>If you have low bone density, make spine-conscious choices. The exercises below put more load through your spine, so ask your clinician before you try them.</li>
    </ul>
    <ul class="carefull">${careful}</ul>
  </div>
  <p style="margin-top:14px;font-family:var(--font-display);font-style:italic;font-weight:600;font-size:17pt;color:var(--teal-dark)">Small Steps. Exponential Gains.™</p>
</section>`;
}

/* ------------------------------------------------------------------ build */
function buildHtml() {
  const css = ensureFonts() + '\n' + fs.readFileSync(path.join(HERE, 'handout.css'), 'utf8');
  const body = [cover(), howTo(), ...CAT_ORDER.map(categorySection), ...[1, 2, 3].map(tracker), lastPage()].join('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Glute training handout · Muscle-Meta Matrix™</title>
<style>
${css}
</style>
</head>
<body>
${body}
</body>
</html>
`;
  lint(html, css);
  fs.writeFileSync(OUT_HTML, html);
  return html;
}

function lint(html, css) {
  const text = html.replace(/<style[\s\S]*?<\/style>/, '').replace(/<[^>]+>/g, ' ');
  const bad = [
    [/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, 'emoji'],
    [/unlock|upgrade|locked|gated|founding member/i, 'gate copy'],
    [/crush|beast mode|no excuses|too late|anti-aging|feel 20/i, 'banned voice'],
    [/\b(gluteus|abduct(ion|or)?\b.*\bplane|eccentric|axial|flexion|frontal-plane|midline|kickstand|lockout|unilateral|fibre|posterior|stabilis)/i, 'jargon']
  ];
  for (const [re, label] of bad) { const m = text.match(re); if (m) issues.push(`lint: ${label}: "${m[0]}"`); }
  const allowed = new Set(['#009090', '#006b6b', '#e6f5f5', '#d4af37', '#faf6e8', '#1a2332', '#344256', '#f7f6f3', '#e8e6e1', '#ffffff']);
  for (const m of (css + html).matchAll(/#[0-9a-fA-F]{6}\b/g)) if (!allowed.has(m[0].toLowerCase())) issues.push('lint: off-palette colour ' + m[0]);
  const longSteps = EXERCISES.filter(e => exerciseText(e).steps.some(s => s.length > 120));
  longSteps.forEach(e => issues.push('note: long step in ' + e.id));
}

async function render() {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + OUT_HTML, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => ['700 20px "Cormorant Garamond"', '600 italic 20px "Cormorant Garamond"', '400 12px Outfit', '600 12px Outfit'].map(f => [f, document.fonts.check(f)]));
  fonts.forEach(([f, ok]) => { if (!ok) issues.push('font not loaded: ' + f); });
  await page.pdf({ path: OUT_PDF, format: 'Letter', printBackground: true, preferCSSPageSize: true, outline: true, tagged: true });
  await browser.close();
}

(async () => {
  buildHtml();
  if (!process.argv.includes('--html-only')) await render();
  issues.forEach(i => console.log(i));
  console.log('built', path.relative(process.cwd(), OUT_HTML), process.argv.includes('--html-only') ? '' : '+ PDF');
})().catch(e => { console.error(e); process.exit(1); });
