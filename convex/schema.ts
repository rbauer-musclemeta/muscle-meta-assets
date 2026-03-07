import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
// ─────────────────────────────────────────────────────────────
// Muscle-Meta Matrix™ — Asset Command Center
// Convex Schema v1.0
// ─────────────────────────────────────────────────────────────
export default defineSchema({
  // ── CORE ASSET REGISTRY ──────────────────────────────────────
  assets: defineTable({
    // Identity
    assetId:    v.string(),   // "MMM-001", "REF-003" – human-readable ID
    name:       v.string(),   // Display name
    // Classification
    type:       v.string(),   // MD | JSX | TSX | HTML | XLSX | PDF | JSON | Folder | TXT
    category:   v.string(),   // Assessment Framework | Course Content | Web UI Components | etc.
    pillar:     v.string(),   // Multi-Pillar | P1: Exercise | P2: Nutrition | P3: Recovery | P4: Brain Health
    // Workflow status
    status:     v.string(),   // Complete | In Progress
    stage:      v.string(),   // draft | ready | live | promoted | converting
    priority:   v.string(),   // Critical | High | Medium | Low
    // Metadata
    date:       v.string(),   // "Jan 02" — human date label
    kb:         v.number(),   // File size in KB
    // Content & context
    notes:      v.optional(v.string()),
    code:       v.optional(v.string()),     // Stored content for preview/download
    deployUrl:  v.optional(v.string()),     // Primary live URL
    // UX state
    starred:    v.boolean(),
    sprint:     v.boolean(),                // Currently in active sprint
    // Lineage — parent asset reference (for child assets spawned from parent)
    parentId:   v.optional(v.id("assets")),
    // Revenue attribution — array of tag indices (0-4)
    // 0=Founding Cohort, 1=Mito-Recharge, 2=VILPA, 3=Lead Magnet, 4=Newsletter
    revenueTag: v.array(v.number()),
    // Content multiplication tracker — 1 source → 6 formats
    multiplication: v.object({
      newsletter:   v.boolean(),
      blog:         v.boolean(),
      video:        v.boolean(),
      leadMagnet:   v.boolean(),
      courseModule: v.boolean(),
      landingPage:  v.boolean(),
    }),
  })
    .index("by_stage",    ["stage"])
    .index("by_category", ["category"])
    .index("by_priority", ["priority"])
    .index("by_pillar",   ["pillar"])
    .index("by_sprint",   ["sprint"])
    .index("by_starred",  ["starred"])
    .index("by_parent",   ["parentId"])
    .searchIndex("search_all", {
      searchField: "name",
      filterFields: ["type", "category", "pillar", "status", "stage", "priority"],
    }),
  // ── DEPLOY LOG — per-asset deployment history ─────────────────
  deployLog: defineTable({
    assetId:    v.id("assets"),
    url:        v.string(),
    note:       v.optional(v.string()),
    deployedAt: v.number(),   // Unix timestamp ms
  }).index("by_asset", ["assetId"]),
  // ── ACTIVITY LOG — audit trail ───────────────────────────────
  activityLog: defineTable({
    type:      v.string(),              // add | edit | delete | deploy | star | upload | stage
    title:     v.string(),
    detail:    v.optional(v.string()),
    assetId:   v.optional(v.id("assets")),
    timestamp: v.number(),              // Unix timestamp ms
  }).index("by_time", ["timestamp"]),
  // ── SPRINT WEEK — weekly focus queue ────────────────────────
  sprintWeek: defineTable({
    weekLabel:  v.string(),             // "Mar 03–07"
    assetIds:   v.array(v.id("assets")),
    isActive:   v.boolean(),
    createdAt:  v.number(),
  }).index("by_active", ["isActive"]),
  // ── SEED FLAG — prevent double-seeding ──────────────────────
  seedMeta: defineTable({
    key:   v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
