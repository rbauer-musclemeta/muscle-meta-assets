---
name: muscle-meta-content-engine
description: AI content generation engine for the MuscleMeta platform. Uses notebooklm-py to generate GMMBB health content assets — audio summaries, quizzes, flashcards, reports, mind maps, and slide decks — from research sources and assessment data. Activates on explicit /muscle-meta-content-engine or intent like "generate a podcast for this assessment" or "create GMMBB flashcards".
---

# Muscle-Meta Content Engine

AI-powered content generation for the MuscleMeta GMMBB (Gut, Muscle, Metabolism, Bone, Brain) platform. Wraps [notebooklm-py](https://github.com/teng-lin/notebooklm-py) with MuscleMeta-specific workflows to produce research-backed health content assets that integrate with `muscle-meta-assets` and `muscle-meta-assessment`.

## Installation

```bash
# Install notebooklm-py (required dependency)
pip install "notebooklm-py[browser]"
playwright install chromium
```

## Auth Bootstrap: Local → Remote

`notebooklm login` opens a real Chromium browser for Google OAuth — it requires a GUI environment. This environment is headless Linux, so the login step must happen on your local machine.

**Step 1 — On your local machine (Mac/Windows/Linux with GUI):**
```bash
pip install "notebooklm-py[browser]"
playwright install chromium
notebooklm profile create muscle-meta
notebooklm -p muscle-meta login      # opens browser → Google OAuth → press ENTER
```

**Step 2 — Export the credential:**
```bash
cat ~/.notebooklm/profiles/muscle-meta/storage_state.json
```

**Step 3 — Use here or in CI (no browser needed):**
```bash
# Option A: env var (CI/CD — paste storage_state.json contents)
export NOTEBOOKLM_AUTH_JSON='{ ... storage_state.json contents ... }'
export NOTEBOOKLM_PROFILE=muscle-meta

# Option B: copy the file directly
mkdir -p ~/.notebooklm/profiles/muscle-meta
scp local:~/.notebooklm/profiles/muscle-meta/storage_state.json \
    ~/.notebooklm/profiles/muscle-meta/storage_state.json
```

All subsequent commands (`notebooklm list`, `source add`, `generate`, etc.) are headless HTTP — no browser needed after login.

**Step 4 — Create notebooks once:**
```bash
python scripts/setup_notebooklm.py   # creates 6 GMMBB notebooks, writes .env.notebooklm
notebooklm doctor && notebooklm list  # verify
```

**Step 5 — Schedule auth refresh (every 3-5 days):**
```bash
python scripts/refresh_auth.py          # manual test
# Cron: 0 9 */3 * * cd /path/to/project && python scripts/refresh_auth.py
```

## Prerequisites

Authentication is required before any command:

```bash
notebooklm list        # Confirm auth works (headless, no browser needed after login)
notebooklm doctor      # Full health check
```

For CI/CD or automated pipelines, set the `NOTEBOOKLM_AUTH_JSON` secret containing your `storage_state.json` contents (see `.env.notebooklm.example`).

## When This Skill Activates

**Explicit:** User says `/muscle-meta-content-engine` or "use the content engine"

**Intent detection — recognize requests like:**
- "Generate a podcast/audio summary for this assessment result"
- "Create GMMBB flashcards for [pillar]"
- "Build a quiz about gut health / muscle metabolism / bone density / brain function"
- "Pull research on [GMMBB topic] and create a briefing"
- "Generate a mind map of the GMMBB connections"
- "Create a slide deck for practitioners from this cohort data"
- "Export a study guide for [pillar]"
- "Seed the asset library with [content type]"
- "Add this research paper / YouTube video / URL to the [pillar] notebook"

## GMMBB Pillar Notebooks

The content engine organizes knowledge into five canonical NotebookLM notebooks, one per GMMBB pillar. Create these once and reuse:

| Pillar | Notebook Title | Focus |
|--------|---------------|-------|
| **G** | `MuscleMeta: Gut Health` | Microbiome, gut-muscle axis, dysbiosis |
| **M** | `MuscleMeta: Muscle Mass` | Sarcopenia, protein synthesis, resistance training |
| **M** | `MuscleMeta: Metabolism` | Metabolic rate, insulin sensitivity, energy systems |
| **B** | `MuscleMeta: Bone Health` | Bone density, calcium/vitamin D, osteoporosis |
| **B** | `MuscleMeta: Brain Function` | Neuroplasticity, cognitive decline, sleep, stress |
| **Cross-pillar** | `MuscleMeta: GMMBB Connections` | Interconnections, catabolic decline research |

## Autonomy Rules

**Run automatically (no confirmation):**
- `notebooklm status` — check context
- `notebooklm list` — list notebooks
- `notebooklm source list` — list sources
- `notebooklm artifact list` — list artifacts
- `notebooklm create "MuscleMeta: ..."` — create pillar notebook
- `notebooklm use <id>` — set notebook context
- `notebooklm source add <url>` — add research source
- `notebooklm ask "..."` — query notebook (no `--save-as-note`)
- `notebooklm source add-research "..."` — start web research
- `notebooklm generate mind-map` — instant, sync generation
- `notebooklm generate report --format study-guide` — report generation

**Ask before running:**
- `notebooklm generate audio` — long-running, may hit rate limits
- `notebooklm generate quiz` / `generate flashcards` — long-running
- `notebooklm generate slide-deck` — long-running
- `notebooklm generate video` — very long-running (15-45 min)
- `notebooklm download *` — writes files to filesystem
- `notebooklm delete` — destructive
- `notebooklm ask "..." --save-as-note` — writes a note
- `python scripts/refresh_auth.py` — overwrites `storage_state.json`

## Quick Reference

| Task | Command |
|------|---------|
| Setup pillar notebook | `notebooklm create "MuscleMeta: Gut Health"` |
| Add research URL | `notebooklm source add "https://pubmed.ncbi.nlm.nih.gov/..."` |
| Add YouTube source | `notebooklm source add "https://youtube.com/watch?v=..."` |
| Add PDF study | `notebooklm source add ./research.pdf` |
| Web research import | `notebooklm source add-research "gut microbiome muscle mass"` |
| Deep research import | `notebooklm source add-research "sarcopenia" --mode deep --no-wait` |
| Query notebook | `notebooklm ask "What are the key gut-muscle connections?"` |
| Generate audio summary | `notebooklm generate audio "Focus on catabolic decline" --format deep-dive` |
| Generate brief audio | `notebooklm generate audio --format brief --length short` |
| Generate quiz | `notebooklm generate quiz --difficulty medium --quantity standard` |
| Generate flashcards | `notebooklm generate flashcards --difficulty easy --quantity more` |
| Generate study guide | `notebooklm generate report --format study-guide` |
| Generate briefing doc | `notebooklm generate report --format briefing-doc` |
| Generate mind map | `notebooklm generate mind-map` |
| Generate slide deck | `notebooklm generate slide-deck --format detailed` |
| Generate data table | `notebooklm generate data-table "compare GMMBB pillar interventions"` |
| Download audio | `notebooklm download audio ./output.mp3` |
| Download quiz (JSON) | `notebooklm download quiz --format json ./quiz.json` |
| Download flashcards (MD) | `notebooklm download flashcards --format markdown ./cards.md` |
| Download mind map | `notebooklm download mind-map ./mindmap.json` |
| Download slide deck | `notebooklm download slide-deck ./slides.pptx --format pptx` |
| Download report | `notebooklm download report ./report.md` |
| Download data table | `notebooklm download data-table ./data.csv` |
| Check artifact status | `notebooklm artifact list` |
| Wait for completion | `notebooklm artifact wait <artifact_id>` |

## Core Workflows

### 1. Research Ingestion — Seeding a Pillar Notebook

Build or refresh the evidence base for a GMMBB pillar.

**Time:** 5-15 minutes depending on source count

```bash
# Create (or locate existing) pillar notebook
NB_ID=$(notebooklm create "MuscleMeta: Gut Health" --json | jq -r '.id')
notebooklm use $NB_ID

# Add curated sources (PubMed, YouTube talks, PDFs)
notebooklm source add "https://pubmed.ncbi.nlm.nih.gov/..."
notebooklm source add "https://youtube.com/watch?v=..."
notebooklm source add ./gut-health-study.pdf

# Or run automated web research
notebooklm source add-research "gut microbiome sarcopenia muscle mass" --mode deep --no-wait
# (spawn background agent to wait and import — see Subagent Pattern below)

# Generate a briefing doc to verify quality
notebooklm generate report --format briefing-doc
notebooklm download report ./gut-briefing.md
```

**Subagent pattern for deep research:**
```
Task(
  prompt="Wait for research in notebook {nb_id} then import all sources.
          Use: notebooklm research wait -n {nb_id} --import-all --timeout 1800
          Report how many sources were imported.",
  subagent_type="general-purpose"
)
```

---

### 2. Personalized Audio Summary — From Assessment Result

Generate a spoken-word MP3 summary personalized to a user's GMMBB scores. Complements the existing jsPDF export in `muscle-meta-assessment`.

**Time:** 10-20 minutes (runs in background)

```bash
# Create a per-user notebook with their result narrative
NB_ID=$(notebooklm create "Assessment Result: User-{user_id}" --json | jq -r '.id')
notebooklm use $NB_ID

# Add their result as pasted text (exported from Convex)
notebooklm source add --text "$(cat ./user-result.txt)"
notebooklm source wait --notebook $NB_ID

# Generate audio in user's preferred language
notebooklm generate audio \
  "Personalize for someone with low Gut and Bone scores. \
   Focus on actionable next steps and encouragement." \
  --format deep-dive \
  --language en \
  --json
# → Returns {"task_id": "..."}

# Spawn background agent to wait and download
# Then deliver MP3 via Resend (muscle-meta-assessment email integration)
```

**Supported languages:** `en`, `es`, `fr`, `de`, `pt_BR`, `ja`, `ko`, `zh_Hans`, `zh_Hant` — and 70+ more. Run `notebooklm language list` for full list.

---

### 3. Educational Flashcards & Quizzes — For Email Sequences

Generate structured learning content for ConvertKit drip campaigns and in-app micro-learning. Each GMMBB pillar gets its own set.

**Time:** 5-15 minutes per pillar

```bash
# Set context to a pillar notebook
notebooklm use <gut-health-notebook-id>

# Generate quiz and flashcards
notebooklm generate quiz --difficulty medium --quantity standard
notebooklm generate flashcards --difficulty easy --quantity more

# Wait for completion (spawn subagent or check manually)
notebooklm artifact list

# Export as JSON for ConvertKit / in-app rendering
notebooklm download quiz --format json ./gut-quiz.json
notebooklm download flashcards --format json ./gut-flashcards.json

# Or Markdown for email-ready HTML rendering
notebooklm download quiz --format markdown ./gut-quiz.md
notebooklm download flashcards --format markdown ./gut-flashcards.md
```

**Batch across all pillars (subagent pattern):**
```
Task(
  prompt="For each notebook ID in {pillar_notebook_ids}:
          1. notebooklm generate quiz --difficulty medium -n {id} --json → capture task_id
          2. notebooklm artifact wait {task_id} -n {id} --timeout 900
          3. notebooklm download quiz --format json ./{pillar}-quiz.json -n {id}
          Report success/failure per pillar.",
  subagent_type="general-purpose"
)
```

---

### 4. Practitioner Slide Decks & Briefing Docs — From Cohort Data

Generate clinical presentations from aggregated assessment data for the admin panel. Export as editable PPTX for practitioner consultations.

**Time:** 10-20 minutes

```bash
# Create a cohort analysis notebook
NB_ID=$(notebooklm create "MuscleMeta: Cohort Analysis - $(date +%Y-%m)" --json | jq -r '.id')
notebooklm use $NB_ID

# Add anonymized cohort summary (exported from Convex)
# e.g., "70% of users score low Gut + Bone simultaneously"
notebooklm source add --text "$(cat ./cohort-summary.txt)"
notebooklm source wait --notebook $NB_ID

# Generate slide deck + briefing
notebooklm generate slide-deck --format detailed
notebooklm generate report \
  --format briefing-doc \
  --append "Target audience: physical therapy practitioners. Include clinical recommendations."

# Wait, then download
notebooklm artifact wait <slide_task_id> --timeout 1200
notebooklm download slide-deck ./cohort-slides.pptx --format pptx
notebooklm download report ./cohort-briefing.md
```

---

### 5. Mind Map — GMMBB Interconnection Visualization

Generate a hierarchical JSON mind map of GMMBB connections for the asset dashboard. Instant generation — no wait required.

**Time:** Seconds (synchronous)

```bash
# Use the cross-pillar connections notebook
notebooklm use <gmmbb-connections-notebook-id>

# Generate and download mind map JSON (instant)
notebooklm generate mind-map
notebooklm download mind-map ./gmmbb-mindmap.json

# Upload to muscle-meta-assets via Convex mutation
# npx convex run operations:upsertAsset -- --type mind-map --path ./gmmbb-mindmap.json
```

The `mindmap.json` is a hierarchical node/edge structure renderable with:
- **Recharts** (existing in `muscle-meta-assessment` dashboard)
- D3.js, vis.js, or any tree visualization library

---

### 6. Branded Slide Deck — Muscle-Meta Visual Identity

Generate practitioner-facing slide decks with the MuscleMeta brand applied. Use this when producing content for admin panels, clinical consultations, or partner presentations.

**Muscle-Meta brand palette:**

| Role | Color | Hex |
|------|-------|-----|
| Primary | Teal | `#009090` |
| Secondary | Coral | `#E8734A` |
| Background | Navy | `#1A2B4A` |
| Text / Light | White | `#ffffff` |
| Accent | Gold | `#D4A843` |

**Typography:** Outfit (headers), Cormorant Garamond (body pull quotes)

**Time:** 10-20 minutes

```bash
notebooklm use <pillar-notebook-id>

# Generate with brand prompt baked in
notebooklm generate slide-deck \
  --format detailed \
  --append "Apply MuscleMeta brand: navy (#1A2B4A) slide backgrounds, teal (#009090) accent bars and section headers, coral (#E8734A) for key stats and callout boxes, gold (#D4A843) for highlights and icons. Outfit font for headers, Cormorant Garamond for pull quotes. Clean, medical-professional aesthetic."

# Wait and download as PPTX
notebooklm artifact wait <task_id> --timeout 1200
notebooklm download slide-deck ./branded-slides.pptx --format pptx
```

**Batch branded decks for all pillars (subagent pattern):**
```
Task(
  prompt="For each pillar ID in {pillar_ids}:
          1. notebooklm use {id}
          2. notebooklm generate slide-deck --format detailed
             --append 'MuscleMeta brand: navy BG, teal headers, coral stats, gold highlights'
             --json → capture task_id
          3. notebooklm artifact wait {task_id} --timeout 1200
          4. notebooklm download slide-deck ./{pillar}-branded.pptx --format pptx
          Report file paths on completion.",
  subagent_type="general-purpose"
)
```

---

### 7. Auth Refresh — Keeping Cookies Alive

Google session cookies expire every 7-14 days. Run `scripts/refresh_auth.py` on a cron schedule to stay authenticated.

**Manual refresh:**
```bash
python scripts/refresh_auth.py       # headless, uses saved browser profile
notebooklm auth check                # verify auth still valid
```

**What it does:** Launches headless Chromium with the saved `storage_state.json`, loads `notebooklm.google.com` to refresh the session, saves the updated `storage_state.json`, then verifies with `notebooklm auth check`.

**Cron setup (every 3 days at 9am):**
```bash
0 9 */3 * * cd /path/to/muscle-meta-assets && python scripts/refresh_auth.py >> /var/log/notebooklm-refresh.log 2>&1
```

**CI/CD (GitHub Actions — triggered manually or on schedule):**
```yaml
- name: Refresh NotebookLM auth
  env:
    NOTEBOOKLM_AUTH_JSON: ${{ secrets.NOTEBOOKLM_AUTH_JSON }}
  run: python scripts/refresh_auth.py
```

If refresh fails (exit code 1), `notebooklm login` must be re-run from a machine with a browser.

---

## Asset Output Reference

| Content Type | Format | Use in MuscleMeta | Convex Field |
|-------------|--------|-------------------|-------------|
| Audio Summary | `.mp3` | Deliver via Resend post-assessment | `audioUrl` |
| Quiz | `.json` / `.md` | ConvertKit sequences, in-app | `quizData` |
| Flashcards | `.json` / `.md` | ConvertKit sequences, in-app | `flashcardData` |
| Study Guide | `.md` | Resource library, email | `reportUrl` |
| Briefing Doc | `.md` | Admin panel, practitioners | `briefingUrl` |
| Slide Deck | `.pdf` / `.pptx` | Admin panel, consultations | `deckUrl` |
| Branded Slide Deck | `.pptx` | Branded practitioner presentations | `deckUrl` |
| Mind Map | `.json` | Dashboard visualization | `mindMapData` |
| Data Table | `.csv` | Admin analytics, export | `tableUrl` |

## Error Handling

| Error | Cause | Action |
|-------|-------|--------|
| Auth/cookie error | Session expired | `notebooklm auth check` then `notebooklm login` |
| `GENERATION_FAILED` | Google rate limit | Wait 5-10 min, retry |
| `No notebook context` | Context not set | Use `-n <notebook_id>` flag |
| Source not ready | Still processing | `notebooklm source wait <id>` |
| Download fails | Artifact not complete | `notebooklm artifact list` to check status |
| Deep research timeout | Slow research agent | Retry with `--mode fast` or add sources manually |

## Processing Time Reference

| Operation | Typical Time | Suggested Timeout |
|-----------|-------------|------------------|
| Source processing | 30s - 10 min | 600s |
| Web research (fast) | 30s - 2 min | 180s |
| Web research (deep) | 15 - 30+ min | 1800s |
| Mind map | Instant (sync) | n/a |
| Report / study guide | 5 - 15 min | 900s |
| Quiz / flashcards | 5 - 15 min | 900s |
| Audio generation | 10 - 20 min | 1200s |
| Slide deck | 10 - 20 min | 1200s |
| Video generation | 15 - 45 min | 2700s |

**Note:** Audio, quiz, flashcard, slide deck, and video generation may fail due to Google rate limits. Mind map, report, and data table generation are most reliable. Always use the subagent pattern for long-running operations.

## Reliability Notes

**Always reliable:**
- Notebook create/list/delete
- Source add/list/delete
- Chat queries (`notebooklm ask`)
- Mind map, report, data table generation

**May hit rate limits:**
- Audio, video, quiz, flashcard, infographic, slide deck generation
- Workaround: retry after 5-10 min, or fall back to the NotebookLM web UI

## Related Repositories

- **[muscle-meta-assets](https://github.com/rbauer-musclemeta/muscle-meta-assets)** — Asset dashboard (this repo). Stores and serves generated content assets via Convex.
- **[muscle-meta-assessment](https://github.com/rbauer-musclemeta/muscle-meta-assessment)** — GMMBB assessment platform. Triggers content generation post-assessment and delivers audio via Resend.
- **[notebooklm-py](https://github.com/teng-lin/notebooklm-py)** — Underlying Python CLI/API used by this skill.
