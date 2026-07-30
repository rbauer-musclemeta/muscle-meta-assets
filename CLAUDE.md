# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this project is

**Muscle-Meta Matrix™ — Asset Command Center**: a single-page internal dashboard for tracking
the ~47 content/code assets that make up the Muscle-Meta Matrix (MMM) health-optimization
platform. It is *not* the MMM product itself — it is the operations tool that tracks the
product's assets through a pipeline, a weekly sprint, and a "content multiplication" matrix.

Everything the app does is CRUD + aggregation over one Convex table (`assets`) plus three
support tables. There is no auth, no multi-tenancy, and no test suite.

## Stack

| Layer    | Choice                                                           |
| -------- | ---------------------------------------------------------------- |
| Framework| Next.js 14.2.35, App Router, React 18, TypeScript strict          |
| Backend  | Convex (`merry-cassowary-258`, team `rbauer-musclemeta`)          |
| Styling  | **Inline `style={{}}` objects** — Tailwind is installed but unused |
| Deploy   | Netlify (`@netlify/plugin-nextjs`), Node 20                       |

## Commands

```bash
npm install
npm run dev            # Next.js dev server on :3000
npx convex dev         # Convex dev server — run in a SECOND terminal, also regenerates convex/_generated
npm run build          # next build (type errors + lint are SUPPRESSED, see Gotchas)
npm run lint           # next lint — currently reports ~38 pre-existing errors
npm run seed           # npx convex run seed:seedAssets — idempotent, inserts the 47 seed assets
npm run seed:reset     # npx convex run seed:resetSeed — clears the seed flag so seed can re-run
```

`npm run seed:reset` only deletes the `seedMeta` flag row; it does **not** delete assets.
Re-running `seed` after a reset will duplicate every asset. Delete the `assets` rows in the
Convex dashboard first if you want a clean re-seed.

### Environment

`NEXT_PUBLIC_CONVEX_URL` is required at runtime (`app/providers.tsx` asserts it non-null).
Put it in `.env.local` for dev; it is set in Netlify for prod. Value:
`https://merry-cassowary-258.convex.cloud`.

### Deployment

Netlify runs `npx convex deploy --prod && npm run build`. Convex functions deploy *before* the
Next build, so a schema change and a frontend change land together in one push. `/` redirects
to `/asset-dashboard` — that route is the entire app.

## Layout

```
app/
  layout.tsx              Root layout: Geist local fonts + Google Fonts <link> + ConvexClientProvider
  providers.tsx           "use client" ConvexProvider wrapper
  page.tsx                redirect("/asset-dashboard")
  asset-dashboard/page.tsx  Thin wrapper that renders <AssetDashboard />
  globals.css             Tailwind directives + light/dark CSS vars (largely overridden at runtime)
components/asset-dashboard/
  AssetDashboard.tsx      ~1460 lines — the WHOLE UI lives here
convex/
  schema.ts               4 tables: assets, deployLog, activityLog, sprintWeek (+ seedMeta)
  assets.ts               Queries + mutations for the asset registry, incl. bulk ops and stats
  operations.ts           Activity log, deploy log, sprint-week mutations
  seed.ts                 47 hard-coded seed assets + parent/child wiring
  _generated/             Checked in, but STUBS — see Gotchas
lib/
  types.ts                Hand-written domain types mirroring the schema + all UI constants/helpers
```

## Domain model

These vocabularies are stored as plain `v.string()` in Convex and typed as unions in
`lib/types.ts`. **When adding a value, update both places** plus the relevant constant array
(`STAGES`, `CATEGORIES`, `PILLARS`, …) and the color map in `lib/types.ts`.

- **Pipeline stage** (`AssetStage`, ordered): `draft → ready → live → promoted → converting`.
  `STAGES` order drives the Kanban columns, `nextStage()`, and the "advance" button.
- **Pillar** (`AssetPillar`): `Multi-Pillar`, `P1: Exercise`, `P2: Nutrition`, `P3: Recovery`,
  `P4: Brain Health` — the MMM 4-pillar framework.
- **Category** (`AssetCategory`): 8 values, from `Assessment Framework` to `Uploaded Reference`.
- **Type** (`AssetType`): `MD | JSX | TSX | HTML | XLSX | PDF | JSON | Folder | TXT`.
- **Priority**: `Critical | High | Medium | Low`. **Status**: `Complete | In Progress`.
- **`revenueTag`**: an array of **integer indices into `REV_TAGS`** (0=Founding Cohort,
  1=Mito-Recharge, 2=VILPA Course, 3=Lead Magnet, 4=Newsletter). Reordering `REV_TAGS`
  silently re-labels every stored tag — append only.
- **`multiplication`**: a fixed 6-boolean object (`newsletter`, `blog`, `video`, `leadMagnet`,
  `courseModule`, `landingPage`) tracking "1 source → 6 formats". `mulScore()`/`leveragePct()`
  hard-code the denominator 6; adding a format means touching `Multiplication`, the schema
  object, `MUL_FORMATS`, and those two helpers.
- **`assetId`**: human-readable `MMM-###` / `REF-###`, separate from the Convex `_id`. New IDs
  are computed client-side in the add-form effect (`max + 1`, floor 48) — `api.assets.nextAssetId`
  exists on the server but is not wired up.
- **`parentId`**: optional self-reference on `assets` for child assets spawned from a parent
  ("Spawn from MMM-0xx" in the UI).

## Conventions

### Convex

- Queries and mutations live in `convex/assets.ts` (registry) and `convex/operations.ts`
  (activity / deploy / sprint). Keep that split.
- Every filter path has a matching index in `schema.ts` (`by_stage`, `by_sprint`, `by_parent`, …).
  Add an index rather than scanning, except in `stats`/`nextAssetId`, which deliberately
  `.collect()` the whole table for aggregation.
- `assets.update` strips `undefined` from the patch so partial updates never blank a field.
  Preserve that behavior in any new update mutation.
- Deletes cascade manually: `assets.remove` and `assets.bulkRemove` delete the asset's
  `deployLog` rows first. Convex has no FK cascade — do this by hand for new relations.
- `operations.addActivity` prunes `activityLog` to the newest 100 rows on every insert.
- `operations.addDeployEntry` also patches the asset's `deployUrl` and forces `stage: "live"`.
- Every user-visible mutation is paired with an `addActivity` call from the client (via the
  `log()` helper), not from inside the mutation. Follow that pattern for new actions.

### Frontend

- **All styling is inline `style={{}}`** with hard-coded hex values. Tailwind/PostCSS are
  configured but no `className` utilities are used in the dashboard. Do not introduce Tailwind
  classes into `AssetDashboard.tsx` — match the surrounding inline-style idiom.
- A global stylesheet is injected as a `<style>{CSS}</style>` string at the top of the render
  (scrollbars, `body` background `#0d1117`) plus a second `<style>` for keyframes.
- Colors come from `lib/types.ts` maps (`STAGE_META`, `TYPE_COLORS`, `PRIORITY_COLORS`,
  `PILLAR_COLORS`). Brand palette: teal `#009090`, coral `#E8734A`, gold `#D4A843`, on a
  GitHub-dark surface set (`#0d1117` / `#161b22` / `#21262d` / `#30363d`).
- Tabs are **nested function components declared inside `AssetDashboard`**
  (`PipelineTab`, `DashboardTab`, `SprintTab`, `MultiplyTab`, `RegistryTab`, `UploadTab`,
  `ActivityTab`, `PreviewPanel`, `AddEditModal`, `ConfirmModal`). They close over the parent's
  state instead of taking props. This is the established pattern — but see the hook warning below.
- Section boundaries use `// ── NAME ────` box-drawing comment rules. Keep them when adding
  sections; they are the only navigation aid in a 1460-line file.
- Shared primitives inside the component: `Btn` (variant flags `sm`/`xs`/`outline`/`teal`/
  `ghost`/`danger`), `sInput`, `sSelect`, `sBtnGhost`. Top-level badges: `StageBadge`,
  `TypeBadge`, `PriBadge`, `MulRing`. Use these rather than restyling from scratch.
- Feedback is always a toast via `useToast()` → `showToast("✓ …")`, with an emoji prefix
  matching the action (`🗑️` delete, `🚀` deploy, `⭐` star, `⚡` sprint, `📦`/`📊` export).
- Conditional Convex queries use the `"skip"` sentinel:
  `useQuery(api.operations.listDeployLog, preview ? { assetId: preview._id } : "skip")`.
- Keyboard shortcuts (registered in a `useEffect` near the bottom): `Cmd/Ctrl+K` focuses
  search, `Cmd/Ctrl+N` opens the add modal, `Escape` closes panel/modal/confirm.
- Deletes route through `ConfirmModal` by setting `confirmMsg` + `confirmCb`, never
  `window.confirm`.
- Export helpers (`exportJSON`, `exportCSV`) build a `Blob` + synthetic `<a download>` click.
  `exportJSON` strips the `code` field to keep the payload small.

## Gotchas

These are real, load-bearing quirks. Read them before changing build config or types.

1. **`convex/_generated/` is committed but is a placeholder, not real generated code.**
   `dataModel.d.ts` literally says *"No `schema.ts` file found for this project"*, `Doc<T>` is
   `Record<string, any>`, and `api` is typed `AnyApi`. Consequences: `api.assets.list` and
   friends have **zero type safety**, `useQuery` results come back as `any`/`unknown`, and the
   codebase compensates with `as any` casts (e.g. `bulkStatus({ ids: [...selectedIds] as any })`).
   Running `npx convex dev` regenerates these properly against `schema.ts` and will surface a
   batch of new type errors. That is an improvement, not a regression — but it is a deliberate
   change of scope, so do it intentionally and fix the fallout.

2. **`next.config.mjs` sets `eslint.ignoreDuringBuilds: true` and
   `typescript.ignoreBuildErrors: true`.** `npm run build` prints *"Skipping validation of
   types / Skipping linting"* and passes even when the code does not typecheck. These flags were
   added specifically to unblock Netlify deploys (commits `c1c4440`, `8ae8e17`). **A green build
   proves nothing about type or lint health** — check those separately.

3. **`npm run lint` currently fails with 37 errors + 2 warnings**, all pre-existing: `no-explicit-any`
   (~20), unused vars, `no-unused-expressions` from the ternary-for-side-effect idiom, and
   8 `react/jsx-key` errors in the Preview panel's `[label, node]` detail grid. Don't treat a
   red lint run as caused by your change — diff against the baseline.

4. **`npx tsc --noEmit` standalone is misleading.** Without a `next build` having generated
   `next-env.d.ts`, it reports bogus "Cannot find module 'next'" / `NodeJS` namespace errors.
   Two findings in that output *are* genuine: `AssetDashboard.tsx:1261` duplicate `border` key
   in the `Btn` base style object (the second wins; the first is dead), and `:950` `unknown`
   from the untyped `stats` query.

5. **Hooks inside nested tab components.** `PreviewPanel` and `RegistryTab` call `useState`
   *inside* nested functions that are conditionally rendered. Commit `175d46c` fixed a runtime
   crash from exactly this — `PreviewPanel` now calls its `useState` **before** the
   `if (!preview) return null` early return. Any hook you add to a nested tab component must
   come before every early return, or you will reintroduce the crash.

6. **Fonts drift.** Inline styles reference `Outfit` (12 sites) and `Cormorant Garamond`
   (14 sites) alongside `Space Mono`, but `app/layout.tsx` only loads **Inter + Space Mono** from Google Fonts
   (commit `269d3da`) plus Geist as local `next/font`. `Outfit` and `Cormorant Garamond`
   therefore fall back to generic `sans-serif`/`serif`. Either add them to the Google Fonts
   `<link>` or switch the inline references — don't add a CSS `@import` for them, which caused
   a MIME error and was reverted in `b26661c`.

7. **The add/edit form's `useState` sits at line ~967**, in the middle of the component between
   `DashboardTab` and `PreviewPanel`, not with the other state at the top. Its initializing
   `useEffect` intentionally omits `assets`/`uploadQueue` from the dep array (there is an
   `exhaustive-deps` warning). Adding them will re-seed the form on every asset change and wipe
   in-progress edits.

8. **`stats` fans out over the whole table** on every dashboard render. Fine at ~47 rows; revisit
   if the registry grows by an order of magnitude.

9. `lib/types.ts` is a **hand-maintained mirror** of `convex/schema.ts`. Nothing enforces they
   agree. Change both together.

## Git workflow

Feature work goes on `claude/*` branches off `main`; push with
`git push -u origin <branch>`. Do not push directly to `main`. Netlify deploys from `main`,
and a merge triggers a Convex prod deploy as part of the build — treat a merge as a
production release of both the schema and the frontend.
