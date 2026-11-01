#!/usr/bin/env python3
"""Builds one self-contained Muscle-Meta Matrix(TM) HTML file per slide.

Usage:  python3 build.py            (reads slides.json, writes ../slide-NN.html + ../index.html)
Each output file inlines tokens.css and works from file:// (fonts via Google Fonts CDN).
Layouts: title, stat, bars, tabs, cards, evidence, chart, steps, closing
"""
import json, pathlib, html

SRC = pathlib.Path(__file__).parent
OUT = SRC.parent
TOKENS = (SRC / "tokens.css").read_text()
SPEC = json.loads((SRC / "slides.json").read_text())

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600'
         '&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">')

CSS = """
body{min-height:100vh;display:flex;flex-direction:column}
.bar{position:fixed;top:0;left:0;right:0;z-index:var(--z-nav);background:rgba(247,246,243,.78);
 backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(0,144,144,.15)}
.bar .in{max-width:var(--content-max);margin:0 auto;padding:14px var(--gutter);display:flex;align-items:center;justify-content:space-between;gap:16px}
.mark{font-family:var(--font-display);font-size:22px;font-weight:700;color:var(--ink);text-decoration:none}
.mark sup{font-size:10px;color:var(--teal)}
.tag{display:flex;align-items:center;gap:10px}
.count{font-size:var(--fs-micro);color:var(--ink-muted);font-weight:var(--fw-medium);letter-spacing:.04em}
main{flex:1;display:flex;align-items:center;padding:96px 0 120px;position:relative}
.slide{width:100%;max-width:var(--content-max);margin:0 auto;padding:0 var(--gutter);position:relative;z-index:2}
.slide h1{font-size:clamp(40px,6.2vw,var(--fs-h1))}
.slide h2{font-size:clamp(30px,4vw,var(--fs-h2));max-width:22ch;margin:var(--s-3) 0 var(--s-4)}
.slide .lede{max-width:62ch}
.slide .eyebrow{display:block}
.src{font-size:var(--fs-micro);color:var(--ink-muted);margin-top:var(--s-4);line-height:1.5}
.src b{color:var(--ink-soft);font-weight:var(--fw-semi)}
.grade{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:var(--r-pill);font-size:12px;font-weight:600;
 letter-spacing:.06em;text-transform:uppercase;border:1px solid;white-space:nowrap}
.grade i{width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block}
.g-established{background:var(--teal-muted);color:var(--teal-dark);border-color:var(--teal)}
.g-promising{background:var(--gold-muted);color:#7a6420;border-color:var(--gold)}
.g-bridge{background:var(--purple-muted);color:var(--purple-dark);border-color:var(--purple)}
.g-needed{background:var(--white);color:var(--ink-muted);border-color:var(--ink-faint)}
.bignum{font-family:var(--font-display);font-weight:700;color:var(--teal);line-height:1;font-size:clamp(72px,12vw,140px);letter-spacing:-.03em}
.bignum small{font-size:.4em;color:var(--ink-muted);font-weight:600;letter-spacing:0}
.grid{display:grid;gap:var(--s-5)}
.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:repeat(3,1fr)}
.split{display:grid;grid-template-columns:1.1fr .9fr;gap:var(--s-8);align-items:center}
/* bars */
.brow{display:grid;grid-template-columns:minmax(120px,220px) 1fr 70px;gap:var(--s-4);align-items:center;padding:var(--s-3) 0;cursor:pointer;border-radius:var(--r-2)}
.brow:hover,.brow:focus-visible{background:var(--teal-tint);outline:none}
.track{height:18px;background:var(--border-soft);border-radius:var(--r-pill);overflow:hidden}
.fill{height:100%;width:0;border-radius:var(--r-pill);background:var(--teal);transition:width 1.1s var(--ease-out)}
.fill.gold{background:var(--gold)}.fill.purple{background:var(--purple)}
.bval{font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--ink);text-align:right}
.detail{min-height:3.2em;margin-top:var(--s-5);padding:var(--s-4) var(--s-5);border-left:3px solid var(--gold);background:var(--gold-muted);border-radius:0 var(--r-2) var(--r-2) 0;color:var(--ink-soft)}
/* tabs */
.seg{display:inline-flex;background:var(--white);border:1px solid var(--border);border-radius:var(--r-pill);padding:4px;gap:4px;flex-wrap:wrap;margin-bottom:var(--s-5)}
.seg button{border:0;background:transparent;border-radius:var(--r-pill);padding:12px 22px;min-height:44px;font-size:14px;font-weight:600;color:var(--ink-soft);cursor:pointer;transition:all var(--dur-base) var(--ease-out)}
.seg button[aria-selected=true]{background:var(--teal);color:var(--white);box-shadow:var(--shadow-teal)}
.seg button:hover:not([aria-selected=true]){background:var(--teal-tint);color:var(--teal)}
.panel{display:none}.panel.on{display:block;animation:rise .6s var(--ease-out)}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
/* cards */
.xcard{text-align:left;width:100%;cursor:pointer;font:inherit;color:inherit}
.xcard h3{font-size:24px;margin:var(--s-2) 0}
.xcard .more{max-height:0;overflow:hidden;opacity:0;transition:all var(--dur-slow) var(--ease-out);color:var(--ink-soft);font-size:15px}
.xcard[aria-expanded=true]{border-color:var(--teal);box-shadow:var(--shadow-teal)}
.xcard[aria-expanded=true] .more{max-height:360px;opacity:1;margin-top:var(--s-3)}
.xcard .hint{font-size:12px;color:var(--teal);font-weight:600;letter-spacing:.06em;text-transform:uppercase}
/* evidence table */
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:var(--s-4)}
.chip{border:1px solid var(--border);background:var(--white);border-radius:var(--r-pill);padding:10px 18px;min-height:44px;font-size:13px;font-weight:600;cursor:pointer;color:var(--ink-soft)}
.chip[aria-pressed=true]{background:var(--ink);color:var(--white);border-color:var(--ink)}
table.ev{width:100%;border-collapse:collapse;background:var(--white);border:1px solid var(--border);border-radius:var(--r-3);overflow:hidden;font-size:14px}
.ev th{text-align:left;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-muted);padding:14px 16px;background:var(--surface-tint);border-bottom:1px solid var(--border)}
.ev td{padding:14px 16px;border-bottom:1px solid var(--border-soft);vertical-align:top}
.ev tr.hide{display:none}
/* chart */
.chartwrap{background:var(--white);border:1px solid var(--border);border-radius:var(--r-4);padding:var(--s-5);box-shadow:var(--shadow-sm)}
.chartwrap svg{width:100%;height:auto;display:block}
.legend{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:var(--s-3)}
.legend .chip[aria-pressed=true]{background:var(--white);color:var(--ink);border-width:2px}.legend .chip[aria-pressed=false]{opacity:.55;border-width:2px}
.readout{min-height:2.6em;font-size:15px;color:var(--ink-soft);margin-top:var(--s-3)}
.ill{font-size:12px;color:var(--ink-muted);font-style:italic}
/* steps */
.step{display:grid;grid-template-columns:56px 1fr;gap:var(--s-4);padding:var(--s-4) 0;border-bottom:1px solid var(--border)}
.step .n{width:44px;height:44px;border-radius:50%;background:var(--teal-muted);color:var(--teal-dark);display:grid;place-items:center;font-family:var(--font-display);font-weight:700;font-size:22px}
.step h4{margin-bottom:4px}
/* contrast: small text uses darker tokens */
.src,.disc,.count,.ill,.tag .eyebrow{color:var(--ink-soft)}.slide .eyebrow,.xcard .hint{color:var(--teal-dark)}
.seg{margin-top:var(--s-4)}.ev th{color:var(--ink-soft)}
/* footer */
.foot{position:fixed;bottom:0;left:0;right:0;z-index:var(--z-nav);background:rgba(247,246,243,.85);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid var(--border)}
.foot .in{max-width:var(--content-max);margin:0 auto;padding:12px var(--gutter);display:flex;align-items:center;justify-content:space-between;gap:16px}
.dots{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center}
.dots a{width:10px;height:10px;border-radius:50%;background:var(--border);display:block;transition:all var(--dur-base) var(--ease-out)}
.dots a:hover{background:var(--teal-light)}.dots a.cur{background:var(--teal);width:26px;border-radius:var(--r-pill)}
.disc{font-size:12px;color:var(--ink-muted);text-align:center;padding:0 var(--gutter) 8px;max-width:var(--content-max);margin:0 auto}
.nav-off{opacity:.35;pointer-events:none}
@media(max-width:768px){
 .g2,.g3,.split{grid-template-columns:1fr}.split{gap:var(--s-6)}
 .brow{grid-template-columns:1fr 56px}.brow .track{grid-column:1/-1;order:3}
 main{padding:84px 0 150px;align-items:flex-start}
 table.ev,.ev tbody,.ev tr,.ev td{display:block;width:100%}.ev thead{display:none}
 .ev tr{padding:var(--s-3) 0;border-bottom:1px solid var(--border)}.ev td{border:0;padding:4px 16px}
 .ev td:nth-child(3)::before{content:"Reference: ";font-weight:600;color:var(--ink)}.ev td:nth-child(4)::before{content:"Caveat: ";font-weight:600;color:var(--ink)}
 .ev td:nth-child(3),.ev td:nth-child(4){font-size:13px;color:var(--ink-soft)}.ev tr.hide{display:none}
 .foot .mmm-btn span.lbl{display:none}.tag .eyebrow{display:none}
}
@media(prefers-reduced-motion:reduce){.fill{transition:none}.panel.on{animation:none}.xcard .more{transition:none}}
"""

GRADES = {"established": ("g-established", "Established"), "promising": ("g-promising", "Promising"),
          "bridge": ("g-bridge", "Unproven-Bridge"), "needed": ("g-needed", "Research-needed")}

def grade(g):
    c, l = GRADES[g]
    return f'<span class="grade {c}"><i></i>{l}</span>'

def src(s):
    return f'<p class="src"><b>Source:</b> {s["text"]}</p>' if s else ""

def head(s):
    g = f'<div style="margin-top:var(--s-3)">{grade(s["grade"])}</div>' if s.get("grade") else ""
    return (f'<span class="eyebrow mmm-reveal">{s.get("eyebrow","")}</span>'
            f'<h2 class="mmm-reveal mmm-reveal-delay-1">{s["title"]}</h2>'
            + (f'<p class="lede mmm-reveal mmm-reveal-delay-2">{s["lede"]}</p>' if s.get("lede") else "") + g)

def L_title(s):
    return (f'<span class="eyebrow mmm-reveal">{s["eyebrow"]}</span>'
            f'<h1 class="mmm-reveal mmm-reveal-delay-1" style="margin:var(--s-4) 0;max-width:16ch">{s["title"]}</h1>'
            f'<p class="lede mmm-reveal mmm-reveal-delay-2">{s["lede"]}</p>'
            f'<p class="mmm-reveal mmm-reveal-delay-3" style="margin-top:var(--s-6);font-family:var(--font-display);font-style:italic;font-size:24px;color:var(--teal)">{s.get("tagline","Small Steps. Exponential Gains.™")}</p>'
            f'<p class="src mmm-reveal mmm-reveal-delay-4">{s.get("byline","")}</p>')

def L_stat(s):
    return (f'<div class="split"><div>{head(s)}{src(s.get("source"))}</div>'
            f'<div class="mmm-reveal mmm-reveal-delay-2"><div class="bignum" data-count="{s["number"]}" data-suffix="{s.get("suffix","")}">{s["number"]}{s.get("suffix","")}</div>'
            f'<p style="margin-top:var(--s-3);font-size:var(--fs-lede);color:var(--ink)">{s["caption"]}</p></div></div>')

def L_bars(s):
    rows = ""
    for i, b in enumerate(s["bars"]):
        rows += (f'<div class="brow" tabindex="0" data-detail="{html.escape(b["detail"], quote=True)}">'
                 f'<div style="color:var(--ink);font-weight:600">{b["label"]}</div>'
                 f'<div class="track"><div class="fill {b.get("color","")}" data-w="{b["width"]}"></div></div>'
                 f'<div class="bval">{b["value"]}</div></div>')
    return (head(s) + f'<div class="mmm-reveal mmm-reveal-delay-3" style="margin-top:var(--s-5)">{rows}'
            f'<div class="detail" aria-live="polite">{s.get("hint","Select a bar to see the detail.")}</div></div>' + src(s.get("source")))

def L_tabs(s):
    btns, panels = "", ""
    for i, t in enumerate(s["tabs"]):
        on = i == 0
        btns += f'<button role="tab" aria-selected="{str(on).lower()}" data-i="{i}">{t["label"]}</button>'
        num = f'<div class="bignum" style="font-size:clamp(64px,10vw,112px)">{t["number"]}</div>' if t.get("number") else ""
        gr = grade(t["grade"]) if t.get("grade") else ""
        panels += (f'<div class="panel{" on" if on else ""}" role="tabpanel" data-i="{i}"><div class="split"><div>{num}</div>'
                   f'<div><p class="lede" style="color:var(--ink)">{t["text"]}</p><div style="margin-top:var(--s-3)">{gr}</div>'
                   f'<p class="src"><b>Source:</b> {t["source"]}</p></div></div></div>')
    return head(s) + f'<div class="mmm-reveal mmm-reveal-delay-3"><div class="seg" role="tablist">{btns}</div>{panels}</div>'

def L_cards(s):
    cs = ""
    for c in s["cards"]:
        cs += (f'<button class="mmm-card mmm-card-hover xcard" aria-expanded="false"><span class="hint">{c.get("kicker","Select to expand")}</span>'
               f'<h3>{c["title"]}</h3><p>{c["text"]}</p><div class="more">{c["more"]}</div></button>')
    return head(s) + f'<div class="grid g3 mmm-reveal mmm-reveal-delay-3" style="margin-top:var(--s-5)">{cs}</div>' + src(s.get("source"))

def L_evidence(s):
    rows = ""
    for r in s["rows"]:
        rows += (f'<tr data-g="{r["grade"]}"><td style="color:var(--ink);font-weight:500">{r["claim"]}</td><td>{grade(r["grade"])}</td>'
                 f'<td>{r["ref"]}</td><td>{r["caveat"]}</td></tr>')
    chips = '<button class="chip" aria-pressed="true" data-f="all">All</button>' + "".join(
        f'<button class="chip" aria-pressed="false" data-f="{k}">{v[1]}</button>' for k, v in GRADES.items())
    return (head(s) + f'<div class="mmm-reveal mmm-reveal-delay-3"><div class="chips">{chips}</div>'
            f'<table class="ev"><thead><tr><th>Claim</th><th>Grade</th><th>Reference</th><th>Caveat</th></tr></thead><tbody>{rows}</tbody></table></div>')

def L_chart(s):
    W, H, P = 760, 380, 52
    xs = s["x"]; xmin, xmax = min(xs), max(xs); ymin, ymax = s["ymin"], s["ymax"]
    X = lambda v: P + (v - xmin) / (xmax - xmin) * (W - 2 * P)
    Y = lambda v: H - P - (v - ymin) / (ymax - ymin) * (H - 2 * P)
    grid = "".join(f'<line x1="{P}" x2="{W-P}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="var(--border)"/>'
                   f'<text x="{P-10}" y="{Y(v)+4:.1f}" text-anchor="end" font-size="17" fill="var(--ink-muted)">{v}</text>'
                   for v in s["yticks"])
    grid += "".join(f'<text x="{X(v):.1f}" y="{H-P+24}" text-anchor="middle" font-size="17" fill="var(--ink-muted)">{v}</text>' for v in xs)
    grid += f'<text x="{W/2}" y="{H-8}" text-anchor="middle" font-size="17" fill="var(--ink-muted)">{s["xlabel"]}</text>'
    paths, leg = "", ""
    for i, se in enumerate(s["series"]):
        d = " ".join(("M" if j == 0 else "L") + f"{X(x):.1f},{Y(y):.1f}" for j, (x, y) in enumerate(zip(xs, se["y"])))
        dots = "".join(f'<circle cx="{X(x):.1f}" cy="{Y(y):.1f}" r="7" fill="{se["color"]}" data-x="{x}" data-y="{y}" data-s="{i}"/>' for x, y in zip(xs, se["y"]))
        paths += f'<g class="ser" data-s="{i}"><path d="{d}" fill="none" stroke="{se["color"]}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>{dots}</g>'
        leg += f'<button class="chip" aria-pressed="true" data-s="{i}" style="border-color:{se["color"]}">{se["name"]}</button>'
    note = f'<p class="ill">{s["note"]}</p>' if s.get("note") else ""
    return (f'<div class="split"><div>{head(s)}{src(s.get("source"))}</div><div class="mmm-reveal mmm-reveal-delay-3 chartwrap">'
            f'<div class="legend">{leg}</div><svg viewBox="0 0 {W} {H}" role="img" aria-label="{html.escape(s["alt"], quote=True)}">{grid}{paths}</svg>'
            f'<div class="readout" aria-live="polite">Hover or focus a point for its value.</div>{note}</div></div>')

def L_steps(s):
    st = "".join(f'<div class="step"><div class="n">{i+1}</div><div><h4>{x["title"]}</h4><p>{x["text"]}</p></div></div>' for i, x in enumerate(s["steps"]))
    return head(s) + f'<div class="mmm-reveal mmm-reveal-delay-3" style="max-width:820px">{st}</div>' + src(s.get("source"))

def L_closing(s):
    pts = "".join(f'<li style="margin:var(--s-3) 0;font-size:var(--fs-lede);color:var(--ink)">{p}</li>' for p in s["points"])
    return (head(s) + f'<ul class="mmm-reveal mmm-reveal-delay-3" style="padding-left:1.2em;max-width:760px">{pts}</ul>'
            f'<div class="mmm-reveal mmm-reveal-delay-4" style="margin-top:var(--s-6)"><a class="mmm-btn mmm-btn-primary mmm-btn-lg" href="{s.get("cta_href","#")}">{s["cta"]}</a></div>')

LAYOUTS = {k[2:]: v for k, v in globals().items() if k.startswith("L_")}

JS = """
(function(){
 var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}})},{threshold:.1});
 $$('.mmm-reveal').forEach(function(el){io.observe(el)});
 setTimeout(function(){$$('.fill').forEach(function(f){f.style.width=f.dataset.w+'%'});$$('.ser path').forEach(function(p){p.style.transition='stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1)';p.style.strokeDashoffset=0})},350);
 $$('.brow').forEach(function(r){var d=$('.detail');function s(){d.textContent=r.dataset.detail;$$('.brow').forEach(function(x){x.style.background=''});r.style.background='var(--teal-tint)'}r.addEventListener('click',s);r.addEventListener('focus',s);r.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();s()}})});
 $$('.seg').forEach(function(seg){$$('button',seg).forEach(function(b){b.addEventListener('click',function(){$$('button',seg).forEach(function(x){x.setAttribute('aria-selected',x===b)});$$('.panel').forEach(function(p){p.classList.toggle('on',p.dataset.i===b.dataset.i)})})})});
 $$('.xcard').forEach(function(c){c.addEventListener('click',function(){c.setAttribute('aria-expanded',c.getAttribute('aria-expanded')!=='true')})});
 $$('.chip[data-f]').forEach(function(ch){ch.addEventListener('click',function(){$$('.chip[data-f]').forEach(function(x){x.setAttribute('aria-pressed',x===ch)});$$('table.ev tbody tr').forEach(function(r){r.classList.toggle('hide',ch.dataset.f!=='all'&&r.dataset.g!==ch.dataset.f)})})});
 $$('.chip[data-s]').forEach(function(ch){ch.addEventListener('click',function(){var on=ch.getAttribute('aria-pressed')!=='true';ch.setAttribute('aria-pressed',on);var g=$('.ser[data-s="'+ch.dataset.s+'"]');g.style.opacity=on?1:.12})});
 var ro=$('.readout');$$('circle[data-x]').forEach(function(c){function s(){ro.textContent=window.__xl+' '+c.dataset.x+': '+$$('.chip[data-s]')[c.dataset.s].textContent+' = '+c.dataset.y+(window.__yu||'')}c.setAttribute('tabindex','0');c.style.cursor='pointer';c.addEventListener('mouseenter',s);c.addEventListener('focus',s);c.addEventListener('click',s)});
 var n=$$('[data-count]')[0];if(n&&!matchMedia('(prefers-reduced-motion:reduce)').matches){var t=parseFloat(n.dataset.count),dec=(n.dataset.count.split('.')[1]||'').length,sf=n.dataset.suffix,st=performance.now();(function f(now){var p=Math.min((now-st)/1300,1),e=1-Math.pow(1-p,3);n.textContent=(t*e).toFixed(dec)+sf;if(p<1)requestAnimationFrame(f)})(st)}
 document.addEventListener('keydown',function(e){var a=null;if(e.key==='ArrowRight'||e.key==='PageDown')a=$('#next');if(e.key==='ArrowLeft'||e.key==='PageUp')a=$('#prev');if(e.key==='Home')a=$('#first');if(a&&a.href&&!/input|textarea/i.test(e.target.tagName)){location.href=a.href}});
})();
"""

def fname(i): return f"slide-{i+1:02d}.html"

def build():
    slides = SPEC["slides"]; N = len(slides)
    tag_txt = SPEC.get("tag", "P1 Exercise &amp; Mobility · P1-C4 Strength")
    for i, s in enumerate(slides):
        body = LAYOUTS[s["layout"]](s)
        dots = "".join(f'<a href="{fname(j)}" class="{"cur" if j==i else ""}" aria-label="Slide {j+1}: {html.escape(slides[j].get("title","").replace("<br>"," "), quote=True)}"></a>' for j in range(N))
        prev = f'<a id="prev" class="mmm-btn mmm-btn-ghost mmm-btn-sm {"nav-off" if i==0 else ""}" href="{fname(i-1) if i else "#"}" aria-label="Previous slide">&larr; <span class="lbl">Previous</span></a>'
        nxt = f'<a id="next" class="mmm-btn mmm-btn-primary mmm-btn-sm {"nav-off" if i==N-1 else ""}" href="{fname(i+1) if i<N-1 else "#"}" aria-label="Next slide"><span class="lbl">Next</span> &rarr;</a>'
        extra = ""
        if s["layout"] == "chart":
            extra = f'<script>window.__xl={json.dumps(s["xlabel_short"])};window.__yu={json.dumps(s.get("yunit",""))};</script>'
        page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(SPEC["deck_title"])} — {i+1} of {N}</title>{FONTS}<style>{TOKENS}{CSS}</style></head>
<body class="mmm-grain">
<header class="bar"><div class="in"><a class="mark" id="first" href="{fname(0)}">Muscle-Meta Matrix<sup>™</sup></a>
<div class="tag"><span class="eyebrow eyebrow-muted">{tag_txt}</span><span class="count">{i+1} / {N}</span></div></div></header>
<main><section class="slide" aria-label="Slide {i+1} of {N}">{body}</section></main>
<footer class="foot"><div class="in">{prev}<nav class="dots" aria-label="Slides">{dots}</nav>{nxt}</div>
<p class="disc">{SPEC["disclaimer"]}</p></footer>{extra}<script>{JS}</script></body></html>"""
        (OUT / fname(i)).write_text(page)
    # index
    cards = "".join(f'<a class="mmm-card mmm-card-hover" style="display:block;text-decoration:none" href="{fname(j)}"><span class="eyebrow">Slide {j+1}</span><h4 style="margin-top:6px">{s.get("title","").replace("<br>"," ")}</h4></a>' for j, s in enumerate(slides))
    idx = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(SPEC["deck_title"])}</title>{FONTS}<style>{TOKENS}{CSS}</style></head>
<body class="mmm-grain"><main style="padding:64px 0"><section class="slide"><span class="eyebrow">Interactive slide set</span><h1 style="margin:var(--s-3) 0 var(--s-6);max-width:18ch">{SPEC["deck_title"]}</h1>
<div class="grid g3">{cards}</div><p class="src" style="margin-top:var(--s-6)">Arrow keys move between slides. {SPEC["disclaimer"]}</p></section></main></body></html>"""
    (OUT / "index.html").write_text(idx)
    print(f"built {N} slides + index.html -> {OUT}")

if __name__ == "__main__":
    build()
