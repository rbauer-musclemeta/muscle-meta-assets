import { mutation } from "./_generated/server";
// ─────────────────────────────────────────────────────────────
// SEED DATA — All 47 Muscle-Meta Matrix™ assets
// Run once: convex dashboard → Functions → seedAssets → Run
// Idempotent: checks seedMeta before inserting
// ─────────────────────────────────────────────────────────────
const mkMul = (n = false, b = false, v = false, l = false, c = false, p = false) => ({
  newsletter: n, blog: b, video: v, leadMagnet: l, courseModule: c, landingPage: p,
});
const SEED_ASSETS = [
  // ── STRATEGY & PLANNING ──────────────────────────────────────
  { assetId:"MMM-001", name:"Master Development Prompt", type:"MD", category:"Strategy & Planning", pillar:"Multi-Pillar", status:"Complete", stage:"promoted", priority:"High", date:"Jan 02", kb:33, notes:"Core platform blueprint — 4-pillar framework definition", starred:false, sprint:false, revenueTag:[0,2], multiplication:mkMul(true,true,false,false,true,false), deployUrl:"", code:"# Muscle-Meta Matrix™ — Master Development Prompt\n## 4-Pillar Foundation\n1. Exercise & Mobility\n2. Nutrition & Metabolism\n3. Recovery & Stress\n4. Balance & Brain Health\n\n## Risk Classification\n- CRITICAL (250-400): Medical clearance required\n- HIGH (150-249): Structured program, weekly check-ins\n- MODERATE (75-149): Guided, bi-weekly support\n- LOW (25-74): Self-guided monthly check-ins\n- MINIMAL (0-24): Advanced optimization focus" },
  { assetId:"MMM-002", name:"Brand Formatting Standards", type:"MD", category:"Strategy & Planning", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Jan 03", kb:16, notes:"Design system & clinical voice guidelines", starred:false, sprint:false, revenueTag:[], multiplication:mkMul(), deployUrl:"", code:"/* Muscle-Meta Matrix™ Brand System */\n:root {\n  --teal: #009090;   /* Primary */\n  --coral: #E8734A;  /* Secondary */\n  --gold: #D4A843;   /* Accent */\n}\n/* Fonts: Cormorant Garamond (headings), Outfit (body) */" },
  { assetId:"MMM-003", name:"Platform Mind Map", type:"MD", category:"Strategy & Planning", pillar:"Multi-Pillar", status:"Complete", stage:"ready", priority:"Medium", date:"Jan 04", kb:2, notes:"Visual architecture overview", starred:false, sprint:false, revenueTag:[], multiplication:mkMul() },
  { assetId:"MMM-006", name:"Business Model Canvas", type:"MD", category:"Strategy & Planning", pillar:"Multi-Pillar", status:"Complete", stage:"ready", priority:"Medium", date:"Jan 09", kb:1, notes:"SaaS hybrid model — targeting ~$5K MRR", starred:false, sprint:false, revenueTag:[], multiplication:mkMul() },
  // ── PLATFORM ARCHITECTURE ────────────────────────────────────
  { assetId:"MMM-004", name:"Web App Development Guide", type:"MD", category:"Platform Architecture", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Jan 05", kb:8, notes:"Next.js 14 + Convex + Clerk build guide", starred:false, sprint:false, revenueTag:[], multiplication:mkMul() },
  { assetId:"MMM-008", name:"Phase 1 Technical Specification", type:"MD", category:"Platform Architecture", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"Critical", date:"Jan 08", kb:57, notes:"Full-stack tech spec — Next.js, Convex, Netlify, Clerk", starred:true, sprint:false, revenueTag:[0], multiplication:mkMul(), code:"# Phase 1 Technical Specification\n## Stack\n- Next.js 14 + TypeScript\n- Convex (real-time DB)\n- Clerk (auth)\n- Netlify (deploy)\n- Tailwind CSS\n\n## Schema\nUsers(id, email, role, risk_scores)\nAssessments(id, user_id, pillar_scores, total)\nMini_Courses(id, risk_level, pillar, content)" },
  // ── CLINICAL REFERENCE ───────────────────────────────────────
  { assetId:"MMM-005", name:"Comprehensive Onboarding Protocol", type:"MD", category:"Clinical Reference", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Jan 06", kb:22, notes:"Patient intake framework — GMMBB Axis integration", starred:false, sprint:false, revenueTag:[0], multiplication:mkMul(true,false,false,false,true,false) },
  { assetId:"MMM-007", name:"Clinical Quick Reference Guide", type:"MD", category:"Clinical Reference", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Jan 08", kb:9, notes:"PT clinical reference — Randy Bauer, PT", starred:false, sprint:false, revenueTag:[], multiplication:mkMul(false,true,false,true,false,false) },
  // ── ASSESSMENT FRAMEWORK ─────────────────────────────────────
  { assetId:"MMM-009", name:"Personalized Assessment System", type:"MD", category:"Assessment Framework", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Jan 12", kb:14, notes:"Assessment architecture — 5-tier risk stratification", starred:false, sprint:false, revenueTag:[0,1], multiplication:mkMul(true,true,true,false,true,false) },
  { assetId:"MMM-010", name:"Catabolic Risk Assessment (CRA)", type:"MD", category:"Assessment Framework", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Jan 14", kb:11, notes:"CRA v3.1 — 35 questions, 9 sections, bone health integration", starred:false, sprint:false, revenueTag:[0,3], multiplication:mkMul() },
  { assetId:"MMM-011", name:"Assessment Ecosystem Complete Summary", type:"MD", category:"Assessment Framework", pillar:"Multi-Pillar", status:"Complete", stage:"ready", priority:"Critical", date:"Jan 15", kb:18, notes:"All 11 assessments — scoring logic overview", starred:true, sprint:false, revenueTag:[0], multiplication:mkMul() },
  { assetId:"MMM-012", name:"CCRAF v3.0 — Catabolic Risk Framework", type:"MD", category:"Assessment Framework", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"Critical", date:"Jan 10", kb:19, notes:"5-tier risk stratification — GLP-1 compound risk detection", starred:false, sprint:false, revenueTag:[0,1,3], multiplication:mkMul(true,false,false,false,true,false) },
  { assetId:"MMM-013", name:"CRA Assessment Config Viewer", type:"JSX", category:"Web UI Components", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Jan 16", kb:35, notes:"React config viewer — CRA v3.0 interactive UI", starred:false, sprint:false, revenueTag:[0], multiplication:mkMul(), code:"import React, { useState } from 'react';\n\nconst CRA_CONFIG = {\n  version: '3.0',\n  totalQuestions: 30,\n  maxScore: 300,\n  riskTiers: [\n    { id: 'MINIMAL', range: [0,45], color: '#22C55E' },\n    { id: 'LOW_MOD', range: [46,90], color: '#84CC16' },\n    { id: 'MODERATE', range: [91,150], color: '#F59E0B' },\n    { id: 'HIGH', range: [151,210], color: '#EA580C' },\n    { id: 'CRITICAL', range: [211,300], color: '#DC2626' },\n  ],\n};" },
  { assetId:"MMM-014", name:"MFAT — Mitochondrial Function Assessment", type:"MD", category:"Assessment Framework", pillar:"P3: Recovery", status:"Complete", stage:"live", priority:"High", date:"Jan 18", kb:39, notes:"58-question assessment, 1,120-point scale", starred:false, sprint:false, revenueTag:[0,1], multiplication:mkMul(true,true,false,false,true,false) },
  { assetId:"MMM-015", name:"MFAT Survey Reviewer", type:"JSX", category:"Web UI Components", pillar:"P3: Recovery", status:"Complete", stage:"live", priority:"High", date:"Jan 21", kb:54, notes:"Interactive MFAT survey viewer component", starred:false, sprint:false, revenueTag:[0,1], multiplication:mkMul(), code:"import React, { useState } from 'react';\n\nconst MFAT_DOMAINS = [\n  { id:'energy', name:'Energy Production', max:200 },\n  { id:'oxidative', name:'Oxidative Stress', max:180 },\n  { id:'inflammation', name:'Inflammation', max:200 },\n  { id:'metabolic', name:'Metabolic Flexibility', max:180 },\n  { id:'recovery', name:'Recovery Capacity', max:180 },\n  { id:'cognition', name:'Cognitive Function', max:180 },\n];" },
  { assetId:"MMM-016", name:"CCRAF Implementation Guide", type:"MD", category:"Assessment Framework", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Jan 20", kb:58, notes:"Deployment reference — compound risk pattern detection", starred:false, sprint:false, revenueTag:[0], multiplication:mkMul(false,true,false,false,false,false) },
  // ── WEB UI COMPONENTS ────────────────────────────────────────
  { assetId:"MMM-017", name:"QMMA Assessment Preview", type:"JSX", category:"Web UI Components", pillar:"Multi-Pillar", status:"Complete", stage:"ready", priority:"Medium", date:"Feb 07", kb:26, notes:"Quick Muscle-Meta Assessment interactive preview", starred:false, sprint:false, revenueTag:[3], multiplication:mkMul(), code:"import React, { useState } from 'react';\nimport { Radar, RadarChart } from 'recharts';\n\nconst PILLARS = [\n  { id:1, name:'Exercise & Mobility', color:'#009090' },\n  { id:2, name:'Nutrition & Metabolism', color:'#D4A843' },\n  { id:3, name:'Recovery & Stress', color:'#7c3aed' },\n  { id:4, name:'Balance & Brain Health', color:'#16a34a' },\n];" },
  { assetId:"MMM-018", name:"QMMA Assessment Preview (TypeScript)", type:"TSX", category:"Web UI Components", pillar:"Multi-Pillar", status:"Complete", stage:"ready", priority:"Medium", date:"Feb 07", kb:26, notes:"TypeScript version of QMMA preview", starred:false, sprint:false, revenueTag:[3], multiplication:mkMul() },
  { assetId:"MMM-021", name:"Mito-Recharge Slides — Weeks 1, 3, 4", type:"JSX", category:"Web UI Components", pillar:"P3: Recovery", status:"Complete", stage:"live", priority:"High", date:"Jan 28", kb:14, notes:"Interactive slide deck React component", starred:false, sprint:false, revenueTag:[1], multiplication:mkMul() },
  { assetId:"MMM-033", name:"MMM Content Engine v3.1", type:"JSX", category:"Web UI Components", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"Critical", date:"Feb 15", kb:64, notes:"Core content engine — AI-powered course generation", starred:true, sprint:false, revenueTag:[0,1,2], multiplication:mkMul(), code:"// MMM Content Engine v3.1\nimport React, { useState } from 'react';\n\nconst generateContent = (userProfile) => {\n  const { riskLevel, pillarScores } = userProfile;\n  const priority = identifyHighestRisk(pillarScores);\n  return {\n    primaryFocus: priority[0],\n    courseSequence: buildCurriculum(priority),\n    emailFlow: selectEmailFlow(riskLevel),\n  };\n};" },
  { assetId:"MMM-034", name:"Landing Page React Component", type:"JSX", category:"Web UI Components", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Feb 16", kb:62, notes:"Main platform landing page — hero + social proof", starred:false, sprint:false, revenueTag:[0,3], multiplication:mkMul() },
  { assetId:"MMM-035", name:"Progressive Web App (PWA)", type:"JSX", category:"Web UI Components", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"Critical", date:"Feb 17", kb:58, notes:"Full PWA — offline capability + push notifications", starred:false, sprint:false, revenueTag:[0], multiplication:mkMul(), code:"// Muscle-Meta Matrix™ PWA\nimport React, { useState, useEffect } from 'react';\n\nconst MuscleMetaPWA = () => {\n  useEffect(() => {\n    if ('serviceWorker' in navigator)\n      navigator.serviceWorker.register('/sw.js');\n  }, []);\n  return <div className='pwa-shell'>...</div>;\n};" },
  { assetId:"MMM-036", name:"Manifesto Infographic", type:"HTML", category:"Web UI Components", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"Medium", date:"Feb 04", kb:24, notes:"Brand manifesto page — clinical luxury HTML", starred:false, sprint:false, revenueTag:[], multiplication:mkMul() },
  { assetId:"MMM-037", name:"Rebuild Protocol Intro Slides", type:"HTML", category:"Web UI Components", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Feb 09", kb:28, notes:"Intro slide deck — catabolic crisis protocol", starred:false, sprint:false, revenueTag:[0,1], multiplication:mkMul() },
  { assetId:"MMM-038", name:"Anabolic Defense Guide", type:"HTML", category:"Web UI Components", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Feb 18", kb:63, notes:"Interactive guide — GLP-1 muscle protection protocol", starred:false, sprint:false, revenueTag:[0,3], multiplication:mkMul() },
  { assetId:"MMM-039", name:"Pickleball Foundation PWA", type:"HTML", category:"Web UI Components", pillar:"P1: Exercise", status:"Complete", stage:"live", priority:"Medium", date:"Feb 19", kb:82, notes:"Pickleball-specific exercise PWA — P1 pillar", starred:false, sprint:false, revenueTag:[], multiplication:mkMul() },
  { assetId:"MMM-040", name:"Pickleball 3-Ps Introduction Module", type:"HTML", category:"Web UI Components", pillar:"P1: Exercise", status:"Complete", stage:"live", priority:"Medium", date:"Feb 19", kb:41, notes:"Intro module — Prevent, Perform, Persist framework", starred:false, sprint:false, revenueTag:[], multiplication:mkMul() },
  // ── COURSE CONTENT ───────────────────────────────────────────
  { assetId:"MMM-019", name:"Mito-Recharge 4-Week Course Outline", type:"MD", category:"Course Content", pillar:"P3: Recovery", status:"Complete", stage:"live", priority:"High", date:"Jan 22", kb:28, notes:"Recovery course outline — 4-week mitochondrial protocol", starred:false, sprint:false, revenueTag:[1], multiplication:mkMul(true,false,true,false,true,true) },
  { assetId:"MMM-020", name:"Mito-Recharge Slide Deck Outline", type:"MD", category:"Course Content", pillar:"P3: Recovery", status:"Complete", stage:"live", priority:"High", date:"Jan 25", kb:53, notes:"Full slide outline — 4 weeks, all modules", starred:false, sprint:false, revenueTag:[1], multiplication:mkMul() },
  { assetId:"MMM-022", name:"Module 1 Video Script", type:"MD", category:"Course Content", pillar:"Multi-Pillar", status:"Complete", stage:"ready", priority:"High", date:"Jan 30", kb:12, notes:"Onboarding video script — platform introduction", starred:false, sprint:false, revenueTag:[0], multiplication:mkMul(false,false,true,false,true,false) },
  { assetId:"MMM-023", name:"Recovery Mastery Course", type:"MD", category:"Course Content", pillar:"P3: Recovery", status:"Complete", stage:"live", priority:"High", date:"Feb 01", kb:18, notes:"Full recovery course content — P3 pillar", starred:false, sprint:false, revenueTag:[1], multiplication:mkMul(true,true,false,false,true,false) },
  { assetId:"MMM-024", name:"Catabolic Crisis Recovery Course Canvas", type:"MD", category:"Course Content", pillar:"Multi-Pillar", status:"Complete", stage:"ready", priority:"High", date:"Feb 03", kb:11, notes:"Course canvas — GMMBB Axis protocols", starred:false, sprint:false, revenueTag:[0,1], multiplication:mkMul() },
  { assetId:"MMM-025", name:"VILPA Mastery Course Review", type:"MD", category:"Course Content", pillar:"P1: Exercise", status:"Complete", stage:"ready", priority:"Medium", date:"Feb 05", kb:4, notes:"VILPA course structure review", starred:false, sprint:false, revenueTag:[2], multiplication:mkMul(false,false,false,false,true,false) },
  { assetId:"MMM-026", name:"Bone & Brain Health Integration Guide", type:"MD", category:"Course Content", pillar:"P4: Brain Health", status:"Complete", stage:"ready", priority:"Medium", date:"Feb 06", kb:14, notes:"GMMBB axis — bone precedes muscle loss by 7-14 days", starred:false, sprint:false, revenueTag:[], multiplication:mkMul() },
  { assetId:"MMM-027", name:"Course Enhancements Documentation", type:"MD", category:"Course Content", pillar:"Multi-Pillar", status:"In Progress", stage:"draft", priority:"Medium", date:"Feb 08", kb:9, notes:"Active development — Lessons 2-4 in progress", starred:false, sprint:true, revenueTag:[1], multiplication:mkMul() },
  // ── MARKETING & SALES ────────────────────────────────────────
  { assetId:"MMM-028", name:"Email Marketing Blueprint", type:"MD", category:"Marketing & Sales", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Feb 10", kb:30, notes:"ConvertKit sequences — welcome + nurture flows", starred:false, sprint:false, revenueTag:[0,4], multiplication:mkMul(true,false,false,false,false,false) },
  { assetId:"MMM-029", name:"Anabolic Calculator Marketing Assets", type:"MD", category:"Marketing & Sales", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Feb 12", kb:28, notes:"Lead magnet — leucine threshold 2.5-3.0g/meal", starred:false, sprint:false, revenueTag:[3], multiplication:mkMul(true,true,false,true,false,true) },
  { assetId:"MMM-030", name:"Mitochondrial Recovery Landing Page", type:"MD", category:"Marketing & Sales", pillar:"P3: Recovery", status:"Complete", stage:"live", priority:"High", date:"Feb 13", kb:40, notes:"Full landing page copy — Mito-Recharge course", starred:false, sprint:false, revenueTag:[1], multiplication:mkMul(false,false,false,false,false,true) },
  { assetId:"MMM-031", name:"Blog Post Structure Framework", type:"MD", category:"Marketing & Sales", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"Medium", date:"Feb 14", kb:12, notes:"Blog template system — SEO + evidence-based", starred:false, sprint:false, revenueTag:[], multiplication:mkMul(false,true,false,false,false,false) },
  { assetId:"MMM-032", name:"Blog Series Folder", type:"Folder", category:"Marketing & Sales", pillar:"Multi-Pillar", status:"In Progress", stage:"draft", priority:"Medium", date:"Feb 14", kb:0, notes:"Content in progress — full blog series", starred:false, sprint:false, revenueTag:[4], multiplication:mkMul() },
  // ── UPLOADED REFERENCE ───────────────────────────────────────
  { assetId:"REF-001", name:"Completed Assets Inventory (Prior)", type:"XLSX", category:"Uploaded Reference", pillar:"Multi-Pillar", status:"Complete", stage:"ready", priority:"Medium", date:"Jan 01", kb:10, notes:"Historical inventory spreadsheet", starred:false, sprint:false, revenueTag:[], multiplication:mkMul() },
  { assetId:"REF-002", name:"User Assessment Tracker Workbook", type:"XLSX", category:"Uploaded Reference", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"High", date:"Jan 15", kb:29, notes:"Assessment tracking — functional movement scores", starred:false, sprint:false, revenueTag:[0], multiplication:mkMul() },
  { assetId:"REF-003", name:"Digital Nutrition Journal", type:"XLSX", category:"Uploaded Reference", pillar:"P2: Nutrition", status:"Complete", stage:"live", priority:"High", date:"Jan 20", kb:66, notes:"Nutrition tracking — protein intake, leucine threshold", starred:false, sprint:false, revenueTag:[0], multiplication:mkMul() },
  { assetId:"REF-004", name:"MetaBlast VILPA Activity Tracker", type:"XLSX", category:"Uploaded Reference", pillar:"P1: Exercise", status:"Complete", stage:"live", priority:"High", date:"Feb 05", kb:32, notes:"VILPA tracker — MetaBurst™ integration target", starred:false, sprint:false, revenueTag:[2], multiplication:mkMul() },
  { assetId:"REF-005", name:"Muscle-Meta Manifesto PDF", type:"PDF", category:"Uploaded Reference", pillar:"Multi-Pillar", status:"Complete", stage:"live", priority:"Low", date:"Jan 01", kb:11, notes:"Core manifesto document", starred:false, sprint:false, revenueTag:[], multiplication:mkMul() },
  { assetId:"REF-006", name:"VILPA Cheat Sheet PDF", type:"PDF", category:"Uploaded Reference", pillar:"P1: Exercise", status:"Complete", stage:"live", priority:"Low", date:"Jan 01", kb:7, notes:"VILPA reference guide", starred:false, sprint:false, revenueTag:[2], multiplication:mkMul() },
  { assetId:"REF-007", name:"Clinical Reference Document", type:"PDF", category:"Uploaded Reference", pillar:"Multi-Pillar", status:"Complete", stage:"ready", priority:"Low", date:"Jan 01", kb:5, notes:"Clinical reference material", starred:false, sprint:false, revenueTag:[], multiplication:mkMul() },
] as const;
export const seedAssets = mutation({
  args: {},
  handler: async (ctx) => {
    // Idempotency check
    const seedFlag = await ctx.db
      .query("seedMeta")
      .withIndex("by_key", (q) => q.eq("key", "assets_seeded"))
      .first();
    if (seedFlag?.value === "true") {
      return { status: "already_seeded", count: 0 };
    }
    // Build a lookup for parent IDs — we need to insert parents first
    // then patch children with parentId
    const idMap = new Map<string, string>(); // assetId → Convex _id
    // First pass: insert all assets without parentId
    for (const asset of SEED_ASSETS) {
      const { ...rest } = asset as any;
      const id = await ctx.db.insert("assets", {
        ...rest,
        parentId: undefined,
      });
      idMap.set(asset.assetId, id);
    }
    // Second pass: set parent relationships
    const parentMap: Record<string, string> = {
      // child assetId → parent assetId
      "MMM-013": "MMM-010",
      "MMM-015": "MMM-014",
      "MMM-016": "MMM-012",
      "MMM-018": "MMM-017",
      "MMM-020": "MMM-019",
      "MMM-021": "MMM-020",
    };
    for (const [childId, parentId] of Object.entries(parentMap)) {
      const childConvexId = idMap.get(childId);
      const parentConvexId = idMap.get(parentId);
      if (childConvexId && parentConvexId) {
        await ctx.db.patch(childConvexId as any, { parentId: parentConvexId as any });
      }
    }
    // Log initial activity
    await ctx.db.insert("activityLog", {
      type: "add",
      title: `Seeded ${SEED_ASSETS.length} assets`,
      detail: "Initial platform asset registry",
      timestamp: Date.now(),
    });
    // Mark as seeded
    await ctx.db.insert("seedMeta", { key: "assets_seeded", value: "true" });
    return { status: "seeded", count: SEED_ASSETS.length };
  },
});
/** Reset seed flag — allows re-seeding (dev only) */
export const resetSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const flag = await ctx.db
      .query("seedMeta")
      .withIndex("by_key", (q) => q.eq("key", "assets_seeded"))
      .first();
    if (flag) await ctx.db.delete(flag._id);
    return { status: "reset" };
  },
});
