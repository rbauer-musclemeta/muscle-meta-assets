import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
// ─────────────────────────────────────────────────────────────
// ACTIVITY LOG
// ─────────────────────────────────────────────────────────────
/** Fetch most recent N activity entries */
export const listActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    const rows = await ctx.db
      .query("activityLog")
      .withIndex("by_time")
      .order("desc")
      .take(limit);
    return rows;
  },
});
/** Add an activity log entry */
export const addActivity = mutation({
  args: {
    type:    v.string(),
    title:   v.string(),
    detail:  v.optional(v.string()),
    assetId: v.optional(v.id("assets")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLog", {
      type:      args.type,
      title:     args.title,
      detail:    args.detail,
      assetId:   args.assetId,
      timestamp: Date.now(),
    });
    // Prune to 100 entries
    const all = await ctx.db.query("activityLog").withIndex("by_time").order("asc").collect();
    if (all.length > 100) {
      const excess = all.slice(0, all.length - 100);
      await Promise.all(excess.map((e) => ctx.db.delete(e._id)));
    }
  },
});
/** Clear all activity log entries */
export const clearActivity = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("activityLog").collect();
    await Promise.all(all.map((e) => ctx.db.delete(e._id)));
  },
});
// ─────────────────────────────────────────────────────────────
// DEPLOY LOG
// ─────────────────────────────────────────────────────────────
/** Fetch deploy history for one asset */
export const listDeployLog = query({
  args: { assetId: v.id("assets") },
  handler: async (ctx, { assetId }) => {
    return await ctx.db
      .query("deployLog")
      .withIndex("by_asset", (q) => q.eq("assetId", assetId))
      .order("desc")
      .collect();
  },
});
/** Add a deploy entry and update asset's deployUrl */
export const addDeployEntry = mutation({
  args: {
    assetId: v.id("assets"),
    url:     v.string(),
    note:    v.optional(v.string()),
  },
  handler: async (ctx, { assetId, url, note }) => {
    await ctx.db.insert("deployLog", {
      assetId,
      url,
      note,
      deployedAt: Date.now(),
    });
    // Update primary deploy URL and advance to "live" stage
    await ctx.db.patch(assetId, { deployUrl: url, stage: "live" });
  },
});
// ─────────────────────────────────────────────────────────────
// SPRINT WEEK
// ─────────────────────────────────────────────────────────────
/** Get or return current active sprint */
export const getCurrentSprint = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("sprintWeek")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();
    return active;
  },
});
/** Create a new sprint week (closes any existing) */
export const createSprintWeek = mutation({
  args: { weekLabel: v.string() },
  handler: async (ctx, { weekLabel }) => {
    // Close existing active sprint
    const existing = await ctx.db
      .query("sprintWeek")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { isActive: false });
      // Clear sprint flag on all assets in old sprint
      await Promise.all(
        existing.assetIds.map((id) => ctx.db.patch(id, { sprint: false }))
      );
    }
    return await ctx.db.insert("sprintWeek", {
      weekLabel,
      assetIds: [],
      isActive: true,
      createdAt: Date.now(),
    });
  },
});
/** Add asset to current sprint */
export const addToSprint = mutation({
  args: { assetId: v.id("assets") },
  handler: async (ctx, { assetId }) => {
    const sprint = await ctx.db
      .query("sprintWeek")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();
    if (sprint) {
      if (!sprint.assetIds.includes(assetId)) {
        await ctx.db.patch(sprint._id, {
          assetIds: [...sprint.assetIds, assetId],
        });
      }
    } else {
      // Auto-create sprint if none exists
      const now = new Date();
      const label = now.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      await ctx.db.insert("sprintWeek", {
        weekLabel: `Sprint ${label}`,
        assetIds: [assetId],
        isActive: true,
        createdAt: Date.now(),
      });
    }
    await ctx.db.patch(assetId, { sprint: true });
  },
});
/** Remove asset from current sprint */
export const removeFromSprint = mutation({
  args: { assetId: v.id("assets") },
  handler: async (ctx, { assetId }) => {
    const sprint = await ctx.db
      .query("sprintWeek")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();
    if (sprint) {
      await ctx.db.patch(sprint._id, {
        assetIds: sprint.assetIds.filter((id) => id !== assetId),
      });
    }
    await ctx.db.patch(assetId, { sprint: false });
  },
});
/** Clear all sprint assignments */
export const clearSprint = mutation({
  args: {},
  handler: async (ctx) => {
    const sprint = await ctx.db
      .query("sprintWeek")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();
    if (sprint) {
      await Promise.all(
        sprint.assetIds.map((id) => ctx.db.patch(id, { sprint: false }))
      );
      await ctx.db.patch(sprint._id, { assetIds: [], isActive: false });
    }
  },
});
