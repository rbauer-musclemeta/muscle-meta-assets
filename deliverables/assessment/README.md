# Power check: how to use it

`power-check.html` is one self-contained file. Calculation happens in the browser. Nothing is stored, sent or tracked.
Source: `_src/power-check.src.html` (edit this), then run `python3 _src/build.py` to regenerate `power-check.html`.

## 1. Resource for an individual (download / upload)

Share `power-check.html` as a file (for example as a downloadable resource in a course or an email link).
The person opens it in any modern browser (phone, tablet or computer).

- Works offline. The brand fonts load from Google Fonts when online and fall back to Georgia / Helvetica when offline.
- Some email programs and learning platforms block `.html` attachments. If that happens, host the file (section 2) and share the link, or zip it.
- A printable view is built in: the browser's Print command prints the current step and hides the buttons.

## 2. Mini course lesson or blog post (embed)

1. Host `power-check.html` at a stable https address (for example a static page on the site, `.../tools/power-check.html`).
2. Paste the snippet from `embed-example.html` (between the COPY markers) where the check should appear, and change `src` to the hosted address. Keep `?embed=1`.

```html
<iframe id="mm-power-check" src="https://YOUR-SITE/tools/power-check.html?embed=1"
        title="Power check: a 30-second chair-stand test" loading="lazy"
        style="width:100%;border:0;min-height:520px;display:block"
        sandbox="allow-scripts allow-same-origin"></iframe>
<script>
(function(){var f=document.getElementById('mm-power-check');
window.addEventListener('message',function(e){var d=e.data;
if(!d||typeof d.type!=='string'||d.type.indexOf('mm-power-check:')!==0||e.source!==f.contentWindow)return;
if(typeof d.height==='number')f.style.height=d.height+'px';
if(d.type==='mm-power-check:step')f.scrollIntoView({block:'start',behavior:'smooth'});});})();
</script>
```

What embed mode does: hides the page header (the host page supplies its own), keeps the disclaimer, and reports its height to the host page so the frame grows and shrinks with each step. If the `<script>` part is not allowed on the host, the iframe still works; it will just keep a fixed height with an inner scrollbar.

Not yet verified: whether the blog build (Markdown + CMS) or the course platform's lesson editor allows raw HTML, iframes or scripts. If it does not, link to the hosted page and open it in a new tab.

## 3. What the check does (and does not) do

- Safety screen first. Any red flag stops the test and refers the person to a clinician.
- Ten context questions (not scored). Answers only add plain-language "worth discussing with a clinician" notes.
- 30-second chair-stand test. Power is estimated from body mass, height, chair height and the number of complete stands (Alcazar et al. 2020, PMID 33004970).
- Result shows relative power (W/kg) and only a "below / at or above the research reference point" line (2.6 W/kg men, 2.1 W/kg women; Alcazar et al. 2021, PMID 34216098). Optional re-test comparison against the smallest meaningful change (0.42 men, 0.33 women W/kg).
- No diagnosis, no risk labels, no claim that power training reduces falls or improves independence.
- The validation studies were done in community-dwelling older adults in Europe. They excluded recent surgery, illness and immobilization. The page says so.

## Wording locked on the page

"Educational information only; not individualized medical advice and not a diagnosis ... Do not change or stop any medicine without your prescriber's advice."
