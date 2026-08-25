# Standalone preview

`asset-command-center.html` is a single-file, dependency-free replica of the
Asset Command Center UI, preloaded with the 47 seed assets from
`convex/seed.ts`. Open it directly in a browser — no build, no Convex.

It exists to demo and design-review the dashboard. It is **not** the app:
state lives in `localStorage`, so changes are per-browser and do not sync.
The real dashboard (`npx convex dev` + `npm run dev`) is the persistent,
multi-device version.

Regenerate the embedded seed data after editing `convex/seed.ts` — the assets
are inlined into the `SEED` constant near the top of the `<script>` block.
