# add-asset

Add one or more assets to the Muscle-Meta Matrix Asset Command Center with
auto-classification (category, pillar, revenue tags, multiplication, priority).

**Invocation**
- `/add-asset` — infer from the most recently touched file in the session
- `/add-asset path/to/file.tsx` — classify a single file
- `/add-asset "GLP-1 muscle protection protocol PDF"` — classify from description
- `/add-asset --bulk path/to/folder` — scan a folder and batch-add all files
- `/add-asset --bulk` — scan the current working directory

---

## Step 1 — GATHER

**Single mode** (no `--bulk`):
1. If a file path was given, read the file with the Read tool. Note the extension,
   approximate size (`wc -c`), and content.
2. If a plain description was given (quoted text, no path), use that as context.
   Ask for a rough file size only if the description implies a real file exists.
3. If no argument at all, check the most recently read or edited file in this
   session. If none can be identified, ask: "What file or asset should I add?"

**Bulk mode** (`--bulk`):
1. If a folder path was given, run `ls -1 <folder>` to list files.
   If no path, run `ls -1` in the current project directory.
2. Filter out: directories, files already in `.claude/`, `node_modules/`,
   `convex/_generated/`, `.next/`, `package*.json`, `tsconfig*`, `*.config.*`,
   `*.lock`, `.env*`, `README.md`.
3. Present the filtered file list to the user and ask:
   "Found N files. Add all, or tell me which to skip?"
4. Proceed with confirmed files, processing each one in sequence.

---

## Step 2 — CLASSIFY

Apply every rule below to resolve the full asset record.
When signals are ambiguous, use the **first strong match** in order.

### assetId
Run this command to get the next sequential ID:
```
npx convex run assets:nextAssetId '{"prefix":"MMM"}'
```
Use the returned value (e.g. `MMM-051`). For bulk mode, call this once per asset
in sequence so IDs are assigned in the order files are processed.

### name
- From a file path: filename without extension, title-cased, hyphens/underscores
  replaced with spaces.
  `gmmbb-assessment-v2.tsx` → `GMMBB Assessment V2`
- From a description: extract the noun phrase before any file-type word.
  `"GLP-1 muscle protection protocol PDF"` → `GLP-1 Muscle Protection Protocol`

### type
Infer from file extension:
```
.md .mdx        → MD
.jsx            → JSX
.tsx            → TSX
.html .htm      → HTML
.xlsx .csv      → XLSX
.pdf            → PDF
.json           → JSON
.txt            → TXT
(directory)     → Folder
(other / none)  → TXT
```

### category
Match the strongest signal in filename + content against this ordered list
(first match wins):

| Signal words (case-insensitive) | Category |
|---|---|
| assessment, gmmbb, cra, sarc, mfat, ccraf, questionnaire, risk score, screening | Assessment Framework |
| lesson, module, course, curriculum, week \d, unit \d | Course Content |
| component, \.(jsx\|tsx), ui, dashboard, widget, form, panel | Web UI Components |
| schema, convex, api, config, deploy, architecture, seed, migration | Platform Architecture |
| strategy, roadmap, sprint, mrr, revenue, plan, proposal | Strategy & Planning |
| clinical, protocol, dexa, grip, gait, leucine, sarcopenia, osteosarcopenia, glp-1 | Clinical Reference |
| email, newsletter, broadcast, landing page, funnel, sales, marketing | Marketing & Sales |
| (no strong match, or PDF/XLSX with no other signal) | Uploaded Reference |

### pillar
Scan filename + content for the following; if multiple match, use `Multi-Pillar`:

| Signal words | Pillar |
|---|---|
| exercise, mobility, strength, movement, vilpa, pickleball, joint, endurance, functional | P1: Exercise |
| nutrition, protein, leucine, metabolic, glp-1, diet, meal, gut, mito | P2: Nutrition |
| recovery, sleep, stress, hrv, cortisol, catabolic, lifestyle, sarco | P3: Recovery |
| brain, balance, cognitive, tug, gait, neurological, bone, fall risk | P4: Brain Health |
| (none or multiple) | Multi-Pillar |

### priority
```
Clinical Reference + Assessment Framework  → Critical
Course Content + Marketing & Sales        → High   (default)
Web UI Components + Platform Architecture → High
Strategy & Planning                       → Medium
Uploaded Reference                        → Low
```
Override to `Critical` if content contains: "emergency", "medical clearance",
"contraindication", "do not exercise", "hospitalization".

### stage
```
default                           → draft
file is polished/complete HTML    → ready
description mentions "deployed" or "live URL" present → live
```

### status
```
file content looks complete (no TODO/FIXME/placeholder)  → Complete
otherwise                                                 → In Progress
```

### kb
- If file was read: run `wc -c <path>` and divide by 1024, round up.
- If description only: estimate 50 KB for PDF/XLSX, 10 KB for MD, 5 KB for other.

### notes
Write a single sentence (≤120 chars) describing what this asset is and who uses it.
Draw from content; do not pad. Example:
`"46-question GMMBB risk assessment mapping muscle, bone, metabolic, gut, and brain axes."`

### revenueTag (array of 0–4 indices)
Detect any of these — multiple matches are valid:
```
0 (Founding Cohort)  ← founding, inner circle, charter, cohort
1 (Mito-Recharge)    ← mito, mitochondrial, recharge
2 (VILPA Course)     ← vilpa, vigorous, pickleball
3 (Lead Magnet)      ← lead magnet, free guide, opt-in, optin, download, checklist
4 (Newsletter)       ← newsletter, email, broadcast, convertkit, sequence
```
Platform Architecture and Web UI Components → `[]` (no revenue tag by default).

### multiplication (object, all start false)
Detect which formats are already represented by this file:
```
type = HTML                                    → landingPage: true
type = MD and content is article-style         → blog: true
content has "Dear ", salutation, or email HTML → newsletter: true
content has "Module", "Lesson", "Chapter"      → courseModule: true
content has "INT.", "EXT.", "V.O.", "(MUSIC)"  → video: true
type = PDF and category ≠ Platform Architecture → leadMagnet: true
```

---

## Step 3 — REVIEW

Show a confirmation card for each asset. Use this exact format:

```
┌─ Asset Preview ──────────────────────────────────────────────┐
│ ID        MMM-051
│ Name      GLP-1 Muscle Protection Protocol
│ Type      PDF
│ Category  Clinical Reference
│ Pillar    P2: Nutrition
│ Priority  Critical
│ Stage     draft
│ Status    In Progress
│ KB        48
│ Revenue   Mito-Recharge (1), Lead Magnet (3)
│ Multiply  leadMagnet ✓
│ Notes     Clinical protocol for protecting muscle during GLP-1 use.
└──────────────────────────────────────────────────────────────┘
```

**Single mode**: Ask after each card:
> Add this asset? **yes** / **edit \<field\>="\<value\>"** / **cancel**

**Bulk mode**: Show all cards first, then ask once:
> Add all N assets? **yes** / **edit \<assetId\> \<field\>="\<value\>"** / **skip \<assetId\>** / **cancel**

Handle edit responses by re-classifying just that field and re-displaying the
updated card before asking again.

---

## Step 4 — EXECUTE

For each confirmed asset, run:
```bash
npx convex run assets:create '<JSON>'
```

Where `<JSON>` is a single-line JSON object with all required fields:
```json
{
  "assetId": "MMM-051",
  "name": "GLP-1 Muscle Protection Protocol",
  "type": "PDF",
  "category": "Clinical Reference",
  "pillar": "P2: Nutrition",
  "status": "In Progress",
  "stage": "draft",
  "priority": "Critical",
  "date": "Sep 17",
  "kb": 48,
  "notes": "Clinical protocol for protecting muscle during GLP-1 use.",
  "revenueTag": [1, 3],
  "multiplication": {
    "newsletter": false,
    "blog": false,
    "video": false,
    "leadMagnet": true,
    "courseModule": false,
    "landingPage": false
  }
}
```

**date** format: `"MMM DD"` using today's date (e.g. `"Sep 17"`).

After each successful insert, report:
> ✓ **MMM-051** added — "GLP-1 Muscle Protection Protocol" [Clinical Reference · P2: Nutrition · Critical]

For bulk mode, print a summary table when all are done:
```
Added 4 assets:
  MMM-051  GLP-1 Muscle Protection Protocol   [Clinical Reference · Critical]
  MMM-052  GMMBB Assessment Component v2      [Assessment Framework · Critical]
  MMM-053  Mito-Recharge Email Sequence       [Marketing & Sales · High]
  MMM-054  Sprint Planning Template           [Strategy & Planning · Medium]
```

If any `npx convex run` command fails, show the error and ask whether to retry
or skip that asset. Do not abort the entire bulk batch on a single failure.

---

## Error handling

- **Convex not configured** (`Error: No address`): tell the user to ensure
  `.env.local` is present with `NEXT_PUBLIC_CONVEX_URL` set, then retry.
- **Duplicate assetId**: re-run `nextAssetId` to get a fresh ID and retry.
- **File not found**: ask the user to confirm the path and retry.

---

## Reference — valid enum values

```
Types:     MD | JSX | TSX | HTML | XLSX | PDF | JSON | Folder | TXT
Categories: Assessment Framework | Course Content | Web UI Components |
            Platform Architecture | Strategy & Planning | Clinical Reference |
            Marketing & Sales | Uploaded Reference
Pillars:   Multi-Pillar | P1: Exercise | P2: Nutrition | P3: Recovery | P4: Brain Health
Stages:    draft | ready | live | promoted | converting
Status:    Complete | In Progress
Priority:  Critical | High | Medium | Low
```
