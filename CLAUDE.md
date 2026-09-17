# Muscle-Meta Matrix — Asset Command Center

## Project Overview
Next.js 14 + Convex real-time asset management dashboard for the Muscle-Meta Matrix™ SaaS platform. Tracks content assets across 4 health pillars, a 5-stage pipeline, and 6 content multiplication formats.

## Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Convex (`merry-cassowary-258.convex.cloud`)
- **Styling**: Inline CSS with design tokens (no Tailwind in components)
- **Fonts**: Cormorant Garamond (headings) + Outfit (body) + Space Mono (data)
- **Deployment**: Netlify

## Key Files
- `components/asset-dashboard/AssetDashboard.tsx` — main dashboard component (all tabs)
- `lib/types.ts` — all domain types, constants, and helpers
- `convex/schema.ts` — Convex database schema
- `convex/assets.ts` — asset CRUD queries and mutations
- `convex/operations.ts` — activity log, deploy log, sprint operations

## Brand Tokens
- Primary teal: `#009090`
- Accent gold: `#D4A843`
- Background: `#0d1117` (dark)
- Surface: `#161b22`
- Border: `#30363d`

## Available Skills
- `/add-asset` — classify and register a new asset with auto-detection of
  category, pillar, priority, revenue tags, and content multiplication.
  Supports single file, description, or `--bulk` folder scan.

## Convex Commands
```bash
npx convex run assets:list          # list all assets
npx convex run assets:create '{...}'  # create asset (see add-asset skill for schema)
npx convex run assets:nextAssetId '{"prefix":"MMM"}'  # get next ID
npm run seed                        # seed sample data
npm run seed:reset                  # clear seed flag to re-seed
```

## Development
```bash
npm run dev          # start Next.js dev server
npx convex dev       # start Convex sync (separate terminal)
```
