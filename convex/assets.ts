import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
// ─────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────
/** Fetch all assets — primary registry list */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("assets").collect();
  },
});
/** Fetch assets by pipeline stage */
export const listByStage = query({
  args: { stage: v.string() },
  handler: async (ctx, { stage }) => {
    return await ctx.db
      .query("assets")
      .withIndex("by_stage", (q) => q.eq("stage", stage))
      .collect();
  },
});
/** Fetch assets currently in sprint */
export const listSprint = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("assets")
      .withIndex("by_sprint", (q) => q.eq("sprint", true))
      .collect();
  },
});
/** Fetch starred assets */
export const listStarred = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("assets")
      .withIndex("by_starred", (q) => q.eq("starred", true))
      .collect();
  },
});
/** Fetch children of a parent asset */
export const listChildren = query({
  args: { parentId: v.id("assets") },
  handler: async (ctx, { parentId }) => {
    return await ctx.db
      .query("assets")
      .withIndex("by_parent", (q) => q.eq("parentId", parentId))
      .collect();
  },
});
/** Get single asset by Convex ID */
export const getById = query({
  args: { id: v.id("assets") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
/** Dashboard stats — aggregated counts */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("assets").collect();
    const total      = all.length;
    const complete   = all.filter((a) => a.status === "Complete").length;
    const inProgress = all.filter((a) => a.status === "In Progress").length;
    const critical   = all.filter((a) => a.priority === "Critical").length;
    const starred    = all.filter((a) => a.starred).length;
    const sprint     = all.filter((a) => a.sprint).length;
    const totalKb    = all.reduce((s, a) => s + a.kb, 0);
    const liveCount  = all.filter((a) => a.stage === "live").length;
    const converting = all.filter((a) => a.stage === "converting").length;
    // Multiplication leverage: total formats checked / total possible
    const mulKeys   = ["newsletter","blog","video","leadMagnet","courseModule","landingPage"] as const;
    const mulDone   = all.reduce((s, a) => s + mulKeys.filter((k) => a.multiplication[k]).length, 0);
    const mulTotal  = all.length * mulKeys.length;
    const leveragePct = mulTotal > 0 ? Math.round((mulDone / mulTotal) * 100) : 0;
    // Stage breakdown
    const stageCounts: Record<string, number> = {};
    all.forEach((a) => {
      stageCounts[a.stage] = (stageCounts[a.stage] || 0) + 1;
    });
    // Category breakdown with KB
    const catStats: Record<string, { count: number; kb: number; complete: number }> = {};
    all.forEach((a) => {
      if (!catStats[a.category]) catStats[a.category] = { count: 0, kb: 0, complete: 0 };
      catStats[a.category].count++;
      catStats[a.category].kb += a.kb;
      if (a.status === "Complete") catStats[a.category].complete++;
    });
    return {
      total, complete, inProgress, critical, starred,
      sprint, totalKb, liveCount, converting,
      leveragePct, stageCounts, catStats,
    };
  },
});
// ─────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────
/** Create a new asset */
export const create = mutation({
  args: {
    assetId:    v.string(),
    name:       v.string(),
    type:       v.string(),
    category:   v.string(),
    pillar:     v.optional(v.string()),
    status:     v.optional(v.string()),
    stage:      v.optional(v.string()),
    priority:   v.optional(v.string()),
    date:       v.optional(v.string()),
    kb:         v.optional(v.number()),
    notes:      v.optional(v.string()),
    code:       v.optional(v.string()),
    deployUrl:  v.optional(v.string()),
    parentId:   v.optional(v.id("assets")),
    revenueTag: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("assets", {
      assetId:    args.assetId,
      name:       args.name,
      type:       args.type,
      category:   args.category,
      pillar:     args.pillar     ?? "Multi-Pillar",
      status:     args.status     ?? "In Progress",
      stage:      args.stage      ?? "draft",
      priority:   args.priority   ?? "High",
      date:       args.date       ?? new Date().toLocaleDateString("en-US", { month:"short", day:"2-digit" }),
      kb:         args.kb         ?? 0,
      notes:      args.notes,
      code:       args.code,
      deployUrl:  args.deployUrl,
      starred:    false,
      sprint:     false,
      parentId:   args.parentId,
      revenueTag: args.revenueTag ?? [],
      multiplication: {
        newsletter: false, blog: false, video: false,
        leadMagnet: false, courseModule: false, landingPage: false,
      },
    });
    return id;
  },
});
/** Update an existing asset */
export const update = mutation({
  args: {
    id:         v.id("assets"),
    name:       v.optional(v.string()),
    type:       v.optional(v.string()),
    category:   v.optional(v.string()),
    pillar:     v.optional(v.string()),
    status:     v.optional(v.string()),
    stage:      v.optional(v.string()),
    priority:   v.optional(v.string()),
    date:       v.optional(v.string()),
    kb:         v.optional(v.number()),
    notes:      v.optional(v.string()),
    code:       v.optional(v.string()),
    deployUrl:  v.optional(v.string()),
    parentId:   v.optional(v.id("assets")),
    revenueTag: v.optional(v.array(v.number())),
  },
  handler: async (ctx, { id, ...patch }) => {
    // Remove undefined values so we don't overwrite with undefined
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, clean);
  },
});
/** Delete an asset and cascade to deployLog */
export const remove = mutation({
  args: { id: v.id("assets") },
  handler: async (ctx, { id }) => {
    // Cascade delete deploy logs
    const logs = await ctx.db
      .query("deployLog")
      .withIndex("by_asset", (q) => q.eq("assetId", id))
      .collect();
    await Promise.all(logs.map((l) => ctx.db.delete(l._id)));
    await ctx.db.delete(id);
  },
});
/** Toggle starred state */
export const toggleStar = mutation({
  args: { id: v.id("assets") },
  handler: async (ctx, { id }) => {
    const asset = await ctx.db.get(id);
    if (!asset) return;
    await ctx.db.patch(id, { starred: !asset.starred });
    return !asset.starred;
  },
});
/** Toggle sprint membership */
export const toggleSprint = mutation({
  args: { id: v.id("assets") },
  handler: async (ctx, { id }) => {
    const asset = await ctx.db.get(id);
    if (!asset) return;
    await ctx.db.patch(id, { sprint: !asset.sprint });
    return !asset.sprint;
  },
});
/** Advance or set pipeline stage */
export const updateStage = mutation({
  args: { id: v.id("assets"), stage: v.string() },
  handler: async (ctx, { id, stage }) => {
    await ctx.db.patch(id, { stage });
  },
});
/** Toggle a single multiplication format */
export const toggleMultiplication = mutation({
  args: {
    id:  v.id("assets"),
    key: v.string(),
  },
  handler: async (ctx, { id, key }) => {
    const asset = await ctx.db.get(id);
    if (!asset) return;
    const mul = { ...asset.multiplication } as Record<string, boolean>;
    mul[key] = !mul[key];
    await ctx.db.patch(id, { multiplication: mul as typeof asset.multiplication });
  },
});
/** Inline note update */
export const updateNote = mutation({
  args: { id: v.id("assets"), notes: v.string() },
  handler: async (ctx, { id, notes }) => {
    await ctx.db.patch(id, { notes });
  },
});
// ── BULK OPERATIONS ──────────────────────────────────────────
export const bulkUpdateStatus = mutation({
  args: { ids: v.array(v.id("assets")), status: v.string() },
  handler: async (ctx, { ids, status }) => {
    await Promise.all(ids.map((id) => ctx.db.patch(id, { status })));
  },
});
export const bulkUpdateStage = mutation({
  args: { ids: v.array(v.id("assets")), stage: v.string() },
  handler: async (ctx, { ids, stage }) => {
    await Promise.all(ids.map((id) => ctx.db.patch(id, { stage })));
  },
});
export const bulkUpdatePriority = mutation({
  args: { ids: v.array(v.id("assets")), priority: v.string() },
  handler: async (ctx, { ids, priority }) => {
    await Promise.all(ids.map((id) => ctx.db.patch(id, { priority })));
  },
});
export const bulkRemove = mutation({
  args: { ids: v.array(v.id("assets")) },
  handler: async (ctx, { ids }) => {
    await Promise.all(
      ids.map(async (id) => {
        const logs = await ctx.db
          .query("deployLog")
          .withIndex("by_asset", (q) => q.eq("assetId", id))
          .collect();
        await Promise.all(logs.map((l) => ctx.db.delete(l._id)));
        await ctx.db.delete(id);
      })
    );
  },
});
/** Generate next asset ID for a given prefix */
export const nextAssetId = query({
  args: { prefix: v.string() },
  handler: async (ctx, { prefix }) => {
    const all = await ctx.db.query("assets").collect();
    const nums = all
      .filter((a) => a.assetId.startsWith(prefix + "-"))
      .map((a) => parseInt(a.assetId.split("-")[1] || "0"))
      .filter((n) => !isNaN(n));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `${prefix}-${String(next).padStart(3, "0")}`;
  },
});
