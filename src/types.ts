import { Id } from "../convex/_generated/dataModel";
// ─────────────────────────────────────────────────────────────
// Core domain types — mirrors the Convex schema exactly
// ─────────────────────────────────────────────────────────────
export type AssetType =
  | "MD" | "JSX" | "TSX" | "HTML" | "XLSX" | "PDF" | "JSON" | "Folder" | "TXT";
export type AssetCategory =
  | "Assessment Framework"
  | "Course Content"
  | "Web UI Components"
  | "Platform Architecture"
  | "Strategy & Planning"
  | "Clinical Reference"
  | "Marketing & Sales"
  | "Uploaded Reference";
export type AssetPillar =
  | "Multi-Pillar"
  | "P1: Exercise"
  | "P2: Nutrition"
  | "P3: Recovery"
  | "P4: Brain Health";
export type AssetStatus = "Complete" | "In Progress";
export type AssetStage = "draft" | "ready" | "live" | "promoted" | "converting";
export type AssetPriority = "Critical" | "High" | "Medium" | "Low";
export interface Multiplication {
  newsletter:   boolean;
  blog:         boolean;
  video:        boolean;
  leadMagnet:   boolean;
  courseModule: boolean;
  landingPage:  boolean;
}
export interface Asset {
  _id:            Id<"assets">;
  _creationTime:  number;
  assetId:        string;
  name:           string;
  type:           AssetType;
  category:       AssetCategory;
  pillar:         AssetPillar;
  status:         AssetStatus;
  stage:          AssetStage;
  priority:       AssetPriority;
  date:           string;
  kb:             number;
  notes?:         string;
  code?:          string;
  deployUrl?:     string;
  starred:        boolean;
  sprint:         boolean;
  parentId?:      Id<"assets">;
  revenueTag:     number[];
  multiplication: Multiplication;
}
export interface DeployEntry {
  _id:        Id<"deployLog">;
  assetId:    Id<"assets">;
  url:        string;
  note?:      string;
  deployedAt: number;
}
export interface ActivityEntry {
  _id:       Id<"activityLog">;
  type:      string;
  title:     string;
  detail?:   string;
  assetId?:  Id<"assets">;
  timestamp: number;
}
export interface SprintWeek {
  _id:       Id<"sprintWeek">;
  weekLabel: string;
  assetIds:  Id<"assets">[];
  isActive:  boolean;
  createdAt: number;
}
// ─────────────────────────────────────────────────────────────
// UI constants
// ─────────────────────────────────────────────────────────────
export const STAGES: AssetStage[] = ["draft", "ready", "live", "promoted", "converting"];
export const STAGE_META: Record<AssetStage, { label: string; color: string; bg: string; dot: string }> = {
  draft:      { label: "Draft",      color: "#8b949e", bg: "rgba(139,148,158,.1)",  dot: "#8b949e" },
  ready:      { label: "Ready",      color: "#58a6ff", bg: "rgba(88,166,255,.1)",   dot: "#58a6ff" },
  live:       { label: "Live",       color: "#3fb950", bg: "rgba(63,185,80,.1)",    dot: "#3fb950" },
  promoted:   { label: "Promoted",   color: "#D4A843", bg: "rgba(212,168,67,.1)",   dot: "#D4A843" },
  converting: { label: "Converting", color: "#E8734A", bg: "rgba(232,115,74,.1)",   dot: "#E8734A" },
};
export const TYPE_COLORS: Record<string, string> = {
  MD:     "#009090",
  JSX:    "#58a6ff",
  TSX:    "#79b8ff",
  HTML:   "#E8734A",
  XLSX:   "#3fb950",
  PDF:    "#bc8cff",
  JSON:   "#D4A843",
  Folder: "#484f58",
  TXT:    "#6b7b8f",
};
export const PRIORITY_COLORS: Record<string, string> = {
  Critical: "#f85149",
  High:     "#E8734A",
  Medium:   "#D4A843",
  Low:      "#484f58",
};
export const PILLAR_COLORS: Record<string, string> = {
  "Multi-Pillar":   "#009090",
  "P1: Exercise":   "#009090",
  "P2: Nutrition":  "#D4A843",
  "P3: Recovery":   "#bc8cff",
  "P4: Brain Health": "#3fb950",
};
export const REV_TAGS = [
  { label: "Founding Cohort",    color: "#009090" },
  { label: "Mito-Recharge",      color: "#E8734A" },
  { label: "VILPA Course",       color: "#D4A843" },
  { label: "Lead Magnet",        color: "#3fb950" },
  { label: "Newsletter",         color: "#bc8cff" },
];
export const MUL_FORMATS: { key: keyof Multiplication; icon: string; label: string; desc: string }[] = [
  { key: "newsletter",   icon: "📧", label: "Newsletter",    desc: "ConvertKit HTML snippet" },
  { key: "blog",         icon: "📝", label: "Blog Post",     desc: "SEO-optimized article"  },
  { key: "video",        icon: "🎬", label: "Video Script",  desc: "YouTube / short-form"   },
  { key: "leadMagnet",   icon: "🎁", label: "Lead Magnet",   desc: "Downloadable PDF/guide" },
  { key: "courseModule", icon: "🎓", label: "Course Module", desc: "Lesson or course unit"  },
  { key: "landingPage",  icon: "🚀", label: "Landing Page",  desc: "Offer or opt-in page"   },
];
export const CATEGORIES: AssetCategory[] = [
  "Assessment Framework",
  "Course Content",
  "Web UI Components",
  "Platform Architecture",
  "Strategy & Planning",
  "Clinical Reference",
  "Marketing & Sales",
  "Uploaded Reference",
];
export const PILLARS: AssetPillar[] = [
  "Multi-Pillar", "P1: Exercise", "P2: Nutrition", "P3: Recovery", "P4: Brain Health",
];
// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
export function mulScore(m: Multiplication): number {
  return Object.values(m).filter(Boolean).length;
}
export function leveragePct(m: Multiplication): number {
  return Math.round((mulScore(m) / 6) * 100);
}
export function stageIndex(s: AssetStage): number {
  return STAGES.indexOf(s);
}
export function nextStage(s: AssetStage): AssetStage | null {
  const i = STAGES.indexOf(s);
  return i < STAGES.length - 1 ? STAGES[i + 1] : null;
}
export function fmtTs(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}
export function fmtKb(kb: number): string {
  return kb >= 1000 ? `${(kb / 1000).toFixed(1)} MB` : `${kb} KB`;
}
