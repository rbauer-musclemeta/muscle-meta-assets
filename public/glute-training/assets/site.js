/* MM™ Glute module · shared behaviour (nav, reveal, storage, exercise dialog) */
(function (root) {
  'use strict';
  var G = root.MMGlute;

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- storage (never throws; page works without it) ---------- */
  var KEY = 'mm-glute-v1';
  var mem = {};
  var store = {
    all: function () { try { var raw = root.localStorage.getItem(KEY); return raw ? JSON.parse(raw) : {}; } catch (e) { return mem; } },
    get: function (k, d) { var a = store.all(); return a[k] === undefined ? d : a[k]; },
    set: function (k, v) { var a = store.all(); a[k] = v; mem = a; try { root.localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- nav ---------- */
  function initNav() {
    var nav = $('.site-nav'), btn = $('.nav-toggle'), links = $('.nav-links');
    if (nav) {
      var onScroll = function () { nav.classList.toggle('scrolled', root.scrollY > 20); };
      root.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }
    if (btn && links) {
      btn.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.addEventListener('click', function (e) { if (e.target.closest('a')) { links.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
    }
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var els = $$('.mmm-reveal');
    if (!('IntersectionObserver' in root) || root.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(function (el) { el.classList.add('is-visible'); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
    // safety net: never leave content hidden
    setTimeout(function () { els.forEach(function (el) { el.classList.add('is-visible'); }); }, 2500);
  }

  /* ---------- badges ---------- */
  function levelBadge(l) { return '<span class="badge lv' + l + '">' + esc(G.LEVELS[l].name) + '</span>'; }
  function evBadge(k) { var e = G.EVIDENCE[k]; return '<span class="badge ' + e.cls + '" title="' + esc(e.text) + '">' + esc(e.label) + '</span>'; }
  var EMPH = { um: 'Upper glute max', lm: 'Lower glute max', mm: 'Glute med and min' };

  /* ---------- exercise dialog ---------- */
  var dlg;
  function ensureDialog() {
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.className = 'mm-dialog';
    dlg.setAttribute('aria-labelledby', 'dlg-title');
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
    return dlg;
  }
  function flagLine(ex) {
    var f = ex.flags, out = [];
    out.push(f.knee ? 'Kind to knees' : 'Knee demand: moderate to high');
    out.push(f.spine ? 'Spine-conscious' : 'Loads the spine');
    out.push(f.balance ? 'Low balance demand' : 'Needs balance (use support)');
    out.push(f.hip ? 'Hip-comfort friendly' : 'Deeper hip bend or side-lying');
    return out.map(function (t, i) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
  }
  function openExercise(id, opts) {
    var ex = G.byId(id); if (!ex) return;
    var d = ensureDialog(); opts = opts || {};
    var saved = (store.get('saved', []) || []).indexOf(id) > -1;
    d.innerHTML =
      '<div class="dlg-head"><div>' +
        '<p class="eyebrow">' + esc(G.CATS[ex.cat].label) + ' · ' + esc(G.CATS[ex.cat].plane) + '</p>' +
        '<h3 id="dlg-title" style="margin:6px 0 10px">' + esc(ex.name) + '</h3>' +
        '<div class="row" style="gap:8px">' + levelBadge(ex.lvl) +
          ex.emph.map(function (k) { return '<span class="tag">' + esc(EMPH[k]) + '</span>'; }).join('') +
          '<span class="tag">' + esc(ex.side) + '</span><span class="tag">' + esc(ex.equip) + '</span></div>' +
      '</div><button class="dlg-close" data-close aria-label="Close">&#x2715;</button></div>' +
      '<div class="dlg-body">' +
        '<p class="lede" style="font-size:17px">' + esc(ex.blurb) + '</p>' +
        '<div><h5>How to do it</h5><ol>' + ex.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>' +
        '<div class="two-col"><div><h5>Cues that help</h5><ul>' + ex.cues.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>' +
        '<div><h5>Common errors</h5><ul>' + ex.errors.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div></div>' +
        '<div class="two-col"><div class="card-flat"><h5>Make it easier</h5><p class="small">' + esc(ex.easier) + '</p></div>' +
        '<div class="card-flat"><h5>Make it harder</h5><p class="small">' + esc(ex.harder) + '</p></div></div>' +
        '<div class="callout care"><svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="#7a6417" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="16" cy="16" r="12"/><path d="M16 9v8M16 21.5v.5"/></svg><div><p><b>Joint note.</b> ' + esc(ex.joint) + '</p></div></div>' +
        '<div><h5>Comfort profile</h5><div class="tagline">' + flagLine(ex) + '</div></div>' +
        '<div class="row" style="justify-content:space-between"><span class="small muted">' + (ex.src === 'notes' ? 'Named in the source notes' : 'Clinical addition by Muscle-Meta Matrix™') + '</span>' +
        '<button class="mmm-btn ' + (saved ? 'mmm-btn-primary' : 'mmm-btn-ghost') + ' mmm-btn-sm" data-save="' + esc(id) + '" aria-pressed="' + saved + '">' + (saved ? 'Saved to your list' : 'Save to your list') + '</button></div>' +
      '</div>';
    d.querySelector('[data-save]').addEventListener('click', function (e) {
      var s = toggleSaved(id); e.currentTarget.textContent = s ? 'Saved to your list' : 'Save to your list';
      e.currentTarget.className = 'mmm-btn ' + (s ? 'mmm-btn-primary' : 'mmm-btn-ghost') + ' mmm-btn-sm';
      e.currentTarget.setAttribute('aria-pressed', s);
      if (opts.onSave) opts.onSave(id, s);
    });
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    d.scrollTop = 0;
  }
  function toggleSaved(id) {
    var list = store.get('saved', []) || [], i = list.indexOf(id);
    if (i > -1) list.splice(i, 1); else list.push(id);
    store.set('saved', list); return i === -1;
  }

  root.MMSite = { esc: esc, $: $, $$: $$, store: store, levelBadge: levelBadge, evBadge: evBadge, EMPH: EMPH, openExercise: openExercise, toggleSaved: toggleSaved };
  document.addEventListener('DOMContentLoaded', function () { initNav(); initReveal(); });
})(window);
