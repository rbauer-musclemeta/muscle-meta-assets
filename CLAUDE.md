# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this project is

**Muscle-Meta Matrix™ — Asset Command Center**: an internal, single-operator dashboard for tracking
content assets (course modules, assessments, React components, landing pages, uploaded reference
docs) as they move through a production pipeline. It is not the Muscle-Meta Matrix SaaS product
itself — it is the tool used to manage that product's content inventory.

Core concepts:

- **Asset** — one tracked artifact, identified by a human-readable `assetId` (`MMM-001`, `REF-003`).
- **Pipeline stage** — `draft → ready → live → promoted → converting`, in that order. `nextStage()`
  in `lib/types.ts` is the single source of truth for advancement.
- **Multiplication** — the "1 source → 6 formats" tracker (newsletter, blog, video, lead magnet,
  course module, landing page). Leverage % = formats checked / 6.
- **Sprint** — a weekly focus queue; assets carry a `sprint` boolean *and* are listed in the active
  `sprintWeek` row (both must stay in sync — see Gotchas).
- **Pillars** — `Multi-Pillar`, `P1: Exercise`, `P2: Nutrition`, `P3: Recovery`, `P4: Brain Health`.

## Stack

| Layer    | Choice |
|----------|--------|
| Framework| Next.js 14.2.35, App Router, React 18 |
| Language | TypeScript 5, `strict: true`, `@/*` path alias → repo root |
| Backend  | Convex 1.32 (real-time DB + serverless functions) |
| Styling  | Inline style objects (Tailwind is installed but effectively unused) |
| Hosting  | Netlify (`@netlify/plugin-nextjs`), Node 20 |

There is no test framework, no auth (Clerk is referenced in seed content but not wired up), and no
CI workflow in this repo.

## Layout

```
app/
  layout.tsx              Root layout; local Geist fonts + Google Fonts <link>; wraps ConvexClientProvider
  providers.tsx           "use client" ConvexProvider; reads NEXT_PUBLIC_CONVEX_URL
  page.tsx                redirect("/asset-dashboard")
  asset-dashboard/page.tsx  Thin route wrapper around <AssetDashboard />
  globals.css             Tailwind directives + light/dark vars (mostly overridden by the dashboard's own CSS)
components/asset-dashboard/
  AssetDashboard.tsx      ~1450 lines. The entire UI. See "Working in AssetDashboard.tsx".
convex/
  schema.ts               5 tables: assets, deployLog, activityLog, sprintWeek, seedMeta
  assets.ts               Asset queries + mutations (incl. bulk ops)
  operations.ts           activityLog, deployLog, sprintWeek functions
  seed.ts                 47 seed assets + idempotent seedAssets / resetSeed
  _generated/             Convex codegen — COMMITTED to git, do not delete
lib/types.ts              Domain types, UI design tokens, and pure helpers
```

`convex/_generated` is intentionally tracked. Convex regenerates it on `npx convex dev` / `deploy`;
if you change a schema or function signature, commit the regenerated files alongside your change.

## Commands

```bash
npm install

npx convex dev          # terminal 1 — pushes schema/functions, watches, writes .env.local
npm run dev             # terminal 2 — Next.js on :3000, redirects to /asset-dashboard

npm run seed            # convex run seed:seedAssets   (idempotent — no-op if already seeded)
npm run seed:reset      # convex run seed:resetSeed    (clears the flag only; does NOT delete rows)

npm run lint            # next lint
npx tsc --noEmit        # type check — NOT part of the build, run it manually
npm run build           # next build
```

`npm run seed:reset` followed by `npm run seed` will **duplicate** every asset, because reset only
removes the `seedMeta` flag. Delete the `assets` rows in the Convex dashboard first if you want a
clean reseed.

## Environment & deployment

- `NEXT_PUBLIC_CONVEX_URL` is required at runtime (`app/providers.tsx` asserts it non-null). Local
  value is written into `.env.local` by `npx convex dev`; `.env*.local` is gitignored.
- Convex project is pinned in `convex.json`: team `rbauer-musclemeta`, project
  `merry-cassowary-258`, prod URL `https://merry-cassowary-258.convex.cloud`.
- Netlify build command is `npx convex deploy --prod && npm run build` — Convex functions deploy
  **before** the Next.js build, so a broken Convex function fails the whole deploy. Netlify needs
  `CONVEX_DEPLOY_KEY` and `NEXT_PUBLIC_CONVEX_URL` set in site environment variables.
- `next.config.mjs` sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` to `true`.
  **A green build proves nothing about types or lint.** Run `npx tsc --noEmit` and `npm run lint`
  yourself before pushing; don't "fix" a type error by relying on the build passing.

## Convex conventions

- Two function modules only: asset CRUD lives in `assets.ts`, everything else (activity, deploy,
  sprint) in `operations.ts`. Follow that split rather than adding new modules for small additions.
- Always query through an index (`withIndex("by_stage", ...)`), never `.filter()` on a full scan.
  Add the index to `schema.ts` when you add a query shape.
- Enum-ish fields (`type`, `category`, `pillar`, `status`, `stage`, `priority`) are `v.string()` in
  the schema — the DB does **not** enforce them. The real contract is the union types in
  `lib/types.ts`. When you add a category/pillar/stage, update `lib/types.ts` (type + constant array
  + any color map) or the UI will render an undefined-color badge.
- `assets.update` strips `undefined` values before patching so partial updates don't blank fields.
  Preserve that behavior in any new update mutation.
- Deleting an asset must cascade its `deployLog` rows — `assets.remove` and `assets.bulkRemove` both
  do this. Note that `activityLog` rows are **not** cascaded (they keep a dangling `assetId`).
- `operations.addDeployEntry` has a side effect: it sets the asset's `deployUrl` and forces
  `stage: "live"`.
- `operations.addActivity` prunes `activityLog` to the newest 100 entries on every insert.
- The UI writes an activity entry after most mutations via the local `log()` helper. Keep new
  user-visible actions logged, using the existing `type` vocabulary:
  `add | edit | delete | deploy | star | upload | stage`.

## Working in AssetDashboard.tsx

This file holds every tab, modal, and panel. Two structural facts drive most of its behavior:

**1. Sub-components are declared *inside* `AssetDashboard`.** `PipelineTab`, `DashboardTab`,
`SprintTab`, `MultiplyTab`, `RegistryTab`, `UploadTab`, `ActivityTab`, `PreviewPanel`,
`AddEditModal`, `ConfirmModal`, and `Btn` are all nested function declarations rendered as JSX
(`<PipelineTab />`). Every parent re-render creates a new function identity, so React unmounts and
remounts these subtrees — **any `useState` inside them resets on every parent render**, and inputs
lose focus mid-typing. `RegistryTab` (`inlineEditId`) and `PreviewPanel` (`localDeployUrl`) already
hold local state and are subject to this.

Consequences to respect:
- Don't add new local state to a nested sub-component. Lift it to the `AssetDashboard` body.
- Hooks in a nested sub-component must run **before** any early `return null`. A conditional hook in
  `PreviewPanel` previously crashed production (commit `175d46c`).
- If you refactor, the right fix is hoisting these to module scope with explicit props — do it
  deliberately, not as a drive-by.

**2. Styling is inline, not Tailwind.** Colors come from the token maps in `lib/types.ts`
(`STAGE_META`, `TYPE_COLORS`, `PRIORITY_COLORS`, `PILLAR_COLORS`, `REV_TAGS`). Brand palette:
teal `#009090` (primary), coral `#E8734A`, gold `#D4A843`, on a GitHub-dark surface set
(`#0d1117` page, `#161b22` panel, `#21262d` raised, `#30363d` border, `#e6edf3` text). Use the
existing `Btn` helper and the `sInput` / `sSelect` / `sBtnGhost` style objects rather than inventing
new button or field styling. Don't add Tailwind classes here — the file deliberately avoids them.

Other things worth knowing before editing:

- All Convex hooks are called once at the top of `AssetDashboard` (lines ~126–157) and the results
  are closed over by the nested components. Add new queries/mutations there, not deeper.
- Filtering and sorting happen client-side over the full `api.assets.list` result. Fine at ~50
  assets; if the registry grows past a few hundred, move this server-side.
- Keyboard shortcuts: `⌘/Ctrl+K` focuses search, `⌘/Ctrl+N` opens the add modal, `Esc` closes
  preview/modal/confirm.
- Destructive actions go through `setConfirmMsg` + `setConfirmCb`, never `window.confirm`.
- Feedback is the `showToast()` toast, never `alert()`.
- Next asset ID is computed client-side in the add-form `useEffect` (max `MMM-###` + 1). A server
  `assets.nextAssetId` query exists but is currently unused — prefer it if you touch this path.
- Export (`exportJSON` / `exportCSV`) strips the `code` field from JSON output; keep it stripped.

## Known rough edges

Real issues in the current code. Don't be surprised by them; fix them only if the task calls for it.

- **Save passes the whole form object to the mutation.** `handleSave` does
  `updateAsset({ id, ...form })`, and on edit `form` is a copy of the full asset — including `_id`,
  `_creationTime`, and `multiplication`, none of which are declared in the `assets.update` args
  validator. Convex rejects undeclared args, so editing an existing asset likely throws
  `ArgumentValidationError`. (Reasoned from the code; not reproduced at runtime here.) The fix is to
  whitelist form fields before calling the mutation.
- **Upload → "Add to Registry"** stuffs a partial object (`name`, `type`, `kb`, `code`) into
  `setEditAsset`, so the form opens without `assetId` or `category`. `validateForm` catches the
  missing category, but `assetId` is still absent when `create` runs.
- **Font mismatch.** Inline styles reference `Outfit`, `Cormorant Garamond`, and `Space Mono`, but
  `app/layout.tsx` loads Inter + Space Mono. Outfit and Cormorant fall back to system fonts.
- **Sprint state is duplicated** between `assets.sprint` and `sprintWeek.assetIds`.
  `assets.toggleSprint` flips only the boolean and does not update the sprint row — use
  `operations.addToSprint` / `removeFromSprint`, which maintain both.
- `useToast`'s `timer` ref is typed `useRef<NodeJS.Timeout>()` with no initial value; harmless, but
  it will trip stricter `useRef` typings if TS settings tighten.

## Git workflow

- Work on the branch you were assigned; create it from `main` if it doesn't exist.
- Push with `git push -u origin <branch>`.
- Commit messages in this repo are short imperative subjects, sometimes with a `fix:` / `feat:`
  prefix. Match the surrounding style; describe the behavior change, not the file list.
- Do not open a pull request unless explicitly asked.
