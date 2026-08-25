"use client";
// ─────────────────────────────────────────────────────────────
// components/asset-dashboard/AssetDashboard.tsx
//
// Muscle-Meta Matrix™ Asset Command Center v3
// Fully wired to Convex — real-time, persistent, multi-device
// ─────────────────────────────────────────────────────────────
import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Asset, AssetStage, AssetCategory, AssetPillar, AssetPriority,
  Multiplication,
  STAGES, STAGE_META, TYPE_COLORS, PRIORITY_COLORS, PILLAR_COLORS,
  REV_TAGS, MUL_FORMATS, CATEGORIES, PILLARS,
  mulScore, leveragePct, nextStage, fmtTs, fmtKb,
} from "@/lib/types";
// ─── DESIGN TOKENS (inline — no Tailwind CDN dependency) ─────
const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;color-scheme:dark}
body{font-family:'Outfit',sans-serif;background:#0d1117;color:#e6edf3}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:#161b22}
::-webkit-scrollbar-thumb{background:#444c56;border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:#009090}
`;
// ─── BADGE COMPONENTS ─────────────────────────────────────────
function StageBadge({ stage }: { stage: AssetStage }) {
  const m = STAGE_META[stage];
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"2px 8px", borderRadius:20, fontSize:".64rem", fontWeight:700,
      background: m.bg, color: m.color,
      border:`1px solid ${m.color}40`,
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background: m.dot, flexShrink:0 }} />
      {m.label}
    </span>
  );
}
function TypeBadge({ type }: { type: string }) {
  const c = TYPE_COLORS[type] ?? "#6b7b8f";
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding:"2px 7px", borderRadius:20, fontSize:".64rem", fontWeight:700,
      background:`${c}18`, color:c, border:`1px solid ${c}30`,
    }}>{type}</span>
  );
}
function PriBadge({ priority }: { priority: string }) {
  const c = PRIORITY_COLORS[priority] ?? "#484f58";
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding:"2px 7px", borderRadius:20, fontSize:".64rem", fontWeight:700,
      background:`${c}18`, color:c, border:`1px solid ${c}30`,
    }}>{priority}</span>
  );
}
function MulRing({ pct, size = 44 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? "#3fb950" : pct >= 40 ? "#D4A843" : "#E8734A";
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#30363d" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition:"stroke-dasharray .6s ease" }} />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        style={{ transform:"rotate(90deg)", transformOrigin:`${size/2}px ${size/2}px`,
          fontSize:".58rem", fontWeight:700, fill: color, fontFamily:"Space Mono,monospace" }}>
        {pct}%
      </text>
    </svg>
  );
}
// ─── TOAST ────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type?: string } | null>(null);
  const timer = useRef<NodeJS.Timeout>();
  const show = useCallback((msg: string, type = "teal") => {
    setToast({ msg, type });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);
  return { toast, show };
}
// ─── PILLAR BAR COLOR ─────────────────────────────────────────
function pillarColor(pillar: string) {
  return PILLAR_COLORS[pillar] ?? "#009090";
}
// ═════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════
export function AssetDashboard() {
  const [tab, setTab] = useState<"pipeline"|"dashboard"|"sprint"|"multiply"|"registry"|"upload"|"activity">("pipeline");
  const [view, setView] = useState<"table"|"card">("table");
  const [preview, setPreview] = useState<Asset | null>(null);
  const [previewTab, setPreviewTab] = useState("details");
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [spawnParent, setSpawnParent] = useState<Asset | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [search, setSearch] = useState("");
  const [fType, setFType] = useState("");
  const [fPillar, setFPillar] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fStage, setFStage] = useState("");
  const [fPri, setFPri] = useState("");
  const [fCat, setFCat] = useState("");
  const [fSpecial, setFSpecial] = useState("");
  const [uploadQueue, setUploadQueue] = useState<{name:string;kb:number;type:string;code:string}[]>([]);
  const [pendingUpload, setPendingUpload] = useState<{name:string;kb:number;type:string;code:string} | null>(null);
  const [confirmCb, setConfirmCb] = useState<(() => void) | null>(null);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [dragStage, setDragStage] = useState<string | null>(null);
  const [deployInput, setDeployInput] = useState("");
  const { toast, show: showToast } = useToast();
  // ── CONVEX QUERIES ────────────────────────────────────────
  const assets      = useQuery(api.assets.list) ?? [];
  const stats       = useQuery(api.assets.stats);
  const sprintItems = useQuery(api.assets.listSprint) ?? [];
  const activity    = useQuery(api.operations.listActivity, { limit: 80 }) ?? [];
  const deployLog   = useQuery(
    api.operations.listDeployLog,
    preview ? { assetId: preview._id } : "skip"
  ) ?? [];
  const children    = useQuery(
    api.assets.listChildren,
    preview ? { parentId: preview._id } : "skip"
  ) ?? [];
  // ── CONVEX MUTATIONS ──────────────────────────────────────
  const createAsset         = useMutation(api.assets.create);
  const updateAsset         = useMutation(api.assets.update);
  const removeAsset         = useMutation(api.assets.remove);
  const toggleStar          = useMutation(api.assets.toggleStar);
  const toggleSprint        = useMutation(api.assets.toggleSprint);
  const updateStage         = useMutation(api.assets.updateStage);
  const toggleMul           = useMutation(api.assets.toggleMultiplication);
  const updateNote          = useMutation(api.assets.updateNote);
  const bulkStatus          = useMutation(api.assets.bulkUpdateStatus);
  const bulkStage           = useMutation(api.assets.bulkUpdateStage);
  const bulkPriority        = useMutation(api.assets.bulkUpdatePriority);
  const bulkRemove          = useMutation(api.assets.bulkRemove);
  const addActivity         = useMutation(api.operations.addActivity);
  const clearActivity       = useMutation(api.operations.clearActivity);
  const addDeploy           = useMutation(api.operations.addDeployEntry);
  const addToSprint         = useMutation(api.operations.addToSprint);
  const removeFromSprint    = useMutation(api.operations.removeFromSprint);
  const clearSprintMut      = useMutation(api.operations.clearSprint);
  // ── LOG HELPER ────────────────────────────────────────────
  const log = useCallback(async (type: string, title: string, detail?: string, assetId?: Id<"assets">) => {
    await addActivity({ type, title, detail, assetId }).catch(() => {});
  }, [addActivity]);
  // ─── FILTERS & SORT ───────────────────────────────────────
  const filtered = assets.filter((a: Asset) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) &&
        !a.assetId.toLowerCase().includes(search.toLowerCase()) &&
        !(a.notes ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    if (fType   && a.type     !== fType)   return false;
    if (fPillar && a.pillar   !== fPillar) return false;
    if (fStatus && a.status   !== fStatus) return false;
    if (fStage  && a.stage    !== fStage)  return false;
    if (fPri    && a.priority !== fPri)    return false;
    if (fCat    && a.category !== fCat)    return false;
    if (fSpecial === "starred" && !a.starred) return false;
    if (fSpecial === "sprint"  && !a.sprint)  return false;
    if (fSpecial === "live"    && a.stage !== "live") return false;
    return true;
  }).sort((a: Asset, b: Asset) => {
    const priOrder = { Critical:0, High:1, Medium:2, Low:3 };
    const stgOrder = { converting:0, promoted:1, live:2, ready:3, draft:4 };
    let av: any = a[sortField as keyof Asset];
    let bv: any = b[sortField as keyof Asset];
    if (sortField === "priority") { av = priOrder[av as keyof typeof priOrder] ?? 99; bv = priOrder[bv as keyof typeof priOrder] ?? 99; }
    if (sortField === "stage")    { av = stgOrder[av as keyof typeof stgOrder] ?? 99; bv = stgOrder[bv as keyof typeof stgOrder] ?? 99; }
    if (typeof av === "string" && typeof bv === "string") {
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortDir === "asc" ? (av ?? 0) - (bv ?? 0) : (bv ?? 0) - (av ?? 0);
  });
  function sort(f: string) {
    if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("asc"); }
  }
  // ─── SELECTION ────────────────────────────────────────────
  function toggleSel(id: string) {
    setSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function selectAll() {
    setSelectedIds(new Set(filtered.map((a: Asset) => a._id)));
  }
  function clearSel() { setSelectedIds(new Set()); }
  // ─── CRUD ─────────────────────────────────────────────────
  // Next free ID for a prefix, computed from the loaded registry.
  // (Server-side equivalent: api.assets.nextAssetId)
  const nextIdFor = useCallback((prefix: string) => {
    const nums = assets
      .filter((a: Asset) => a.assetId.startsWith(prefix + "-"))
      .map((a: Asset) => parseInt(a.assetId.split("-")[1] || "0", 10))
      .filter((n: number) => !isNaN(n));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `${prefix}-${String(next).padStart(3, "0")}`;
  }, [assets]);

  // Convex rejects args the validator doesn't declare, and on edit `form` is a
  // copy of the whole asset (_id, _creationTime, multiplication included). Send
  // only the fields the mutations actually accept.
  const SAVE_FIELDS = [
    "assetId", "name", "type", "category", "pillar", "status", "stage",
    "priority", "date", "kb", "notes", "code", "deployUrl", "parentId", "revenueTag",
  ] as const;

  function savePayload(form: Record<string, unknown>) {
    const out: Record<string, unknown> = {};
    for (const k of SAVE_FIELDS) {
      const v = form[k];
      if (v === undefined || v === "") continue;   // update strips undefined; don't send blanks
      out[k] = k === "kb" ? Number(v) || 0 : v;
    }
    return out;
  }

  async function handleSave(form: Record<string, any>) {
    const payload = savePayload(form);
    if (editAsset?._id) {
      await updateAsset({ id: editAsset._id, ...payload });
      await log("edit", `Edited: ${editAsset.name}`, `Stage: ${form.stage ?? editAsset.stage}`, editAsset._id);
      showToast(`✓ Updated "${editAsset.name}"`);
    } else {
      const id = await createAsset({
        ...payload,
        assetId: payload.assetId ?? nextIdFor("MMM"),
        type: payload.type ?? "MD",
      });
      await log("add", `Added: ${form.name}`, `Type: ${form.type}`, id);
      showToast(`✓ Added "${form.name}"`);
      // The queued file is now a registry row — drop it from the queue.
      if (pendingUpload) setUploadQueue(q => q.filter(f => f !== pendingUpload));
    }
    setEditAsset(null);
    setAddOpen(false);
    setSpawnParent(null);
    setPendingUpload(null);
  }
  async function handleDelete(a: Asset) {
    setConfirmMsg(`Delete "${a.name}" (${a.assetId})? This cannot be undone.`);
    setConfirmCb(() => async () => {
      await removeAsset({ id: a._id });
      await log("delete", `Deleted: ${a.name}`, a.assetId);
      showToast(`🗑️ Deleted "${a.name}"`);
      setPreview(null);
      setConfirmCb(null);
    });
  }
  async function handleStar(a: Asset) {
    const next = await toggleStar({ id: a._id });
    if (next) await log("star", `Starred: ${a.name}`, undefined, a._id);
    showToast(next ? `⭐ Starred` : `Unstarred`);
  }
  async function handleSprintToggle(a: Asset) {
    if (a.sprint) {
      await removeFromSprint({ assetId: a._id });
      showToast(`Removed from sprint`);
    } else {
      await addToSprint({ assetId: a._id });
      await log("add", `Sprint: ${a.name}`, undefined, a._id);
      showToast(`⚡ Added to sprint`);
    }
  }
  async function handleStageAdvance(a: Asset) {
    const next = nextStage(a.stage);
    if (!next) return;
    await updateStage({ id: a._id, stage: next });
    await log("stage", `${a.assetId} → ${STAGE_META[next].label}`, a.name, a._id);
    showToast(`→ ${STAGE_META[next].label}`);
  }
  async function handleDeploy(assetId: Id<"assets">, url: string) {
    if (!url.trim()) return;
    await addDeploy({ assetId, url: url.trim() });
    await log("deploy", `Deployed`, url.trim(), assetId);
    showToast(`🚀 Deployed → ${url.trim()}`);
    setDeployInput("");
  }
  async function handleMulToggle(a: Asset, key: string) {
    await toggleMul({ id: a._id, key });
    const m = { ...a.multiplication, [key]: !a.multiplication[key as keyof Multiplication] };
    const score = Object.values(m).filter(Boolean).length;
    if (!a.multiplication[key as keyof Multiplication]) {
      await log("edit", `Multiplied: ${a.assetId}`, `${key} ✓ (${score}/6)`, a._id);
    }
    showToast(`Saved`);
  }
  async function handleInlineNote(a: Asset, val: string) {
    await updateNote({ id: a._id, notes: val });
    showToast("✓ Note saved");
  }
  // ─── DRAG & DROP (pipeline) ───────────────────────────────
  const draggingId = useRef<string | null>(null);
  function onDragStart(e: React.DragEvent, id: string) {
    draggingId.current = id;
    e.dataTransfer.effectAllowed = "move";
  }
  async function onDrop(e: React.DragEvent, stage: AssetStage) {
    e.preventDefault();
    setDragStage(null);
    const id = draggingId.current;
    if (!id) return;
    const a = assets.find((x: Asset) => x._id === id);
    if (!a || a.stage === stage) return;
    await updateStage({ id: a._id as Id<"assets">, stage });
    await log("stage", `${a.assetId} → ${STAGE_META[stage].label}`, a.name, a._id);
    showToast(`→ ${STAGE_META[stage].label}`);
    draggingId.current = null;
  }
  // ─── FILE UPLOAD ──────────────────────────────────────────
  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(file => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const typeMap: Record<string, string> = {
        md:"MD", jsx:"JSX", tsx:"TSX", html:"HTML", xlsx:"XLSX",
        pdf:"PDF", json:"JSON", csv:"XLSX", txt:"TXT", docx:"MD",
      };
      const type = typeMap[ext] ?? "TXT";
      const kb = Math.ceil(file.size / 1024);
      if (["md","html","jsx","tsx","json","txt","csv"].includes(ext)) {
        const reader = new FileReader();
        reader.onload = e => {
          const code = (e.target?.result as string ?? "").slice(0, 20000);
          setUploadQueue(q => [...q, { name: file.name.replace(/\.[^.]+$/, ""), kb, type, code }]);
        };
        reader.readAsText(file);
      } else {
        setUploadQueue(q => [...q, { name: file.name.replace(/\.[^.]+$/, ""), kb, type, code: "" }]);
      }
      log("upload", `Uploaded: ${file.name}`, `${kb} KB`);
    });
    showToast(`✓ ${files.length} file(s) queued`);
  }
  // ─── EXPORT ───────────────────────────────────────────────
  function exportJSON() {
    const data = assets.map(({ code: _c, ...rest }: Asset & { code?: string }) => rest);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mmm-assets-${Date.now()}.json`;
    a.click();
    showToast("📦 JSON exported");
  }
  function exportCSV() {
    const cols = ["assetId","name","type","category","pillar","status","stage","priority","date","kb","notes","deployUrl"];
    const rows = [cols.join(","), ...assets.map((a: Asset) =>
      cols.map(c => `"${String((a as any)[c] ?? "").replace(/"/g,'""')}"`).join(",")
    )];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const el = document.createElement("a");
    el.href = URL.createObjectURL(blob);
    el.download = `mmm-assets-${Date.now()}.csv`;
    el.click();
    showToast("📊 CSV exported");
  }
  // ── PIPELINE TAB ──────────────────────────────────────────
  function PipelineTab() {
    return (
      <div style={{ overflowX:"auto", paddingBottom:8 }}>
        <div style={{ display:"flex", gap:12, minHeight:"calc(100vh - 180px)", minWidth: STAGES.length * 296 }}>
          {STAGES.map(stage => {
            const col = assets.filter((a: Asset) => a.stage === stage);
            const m = STAGE_META[stage];
            return (
              <div key={stage} style={{ flex:"0 0 280px", display:"flex", flexDirection:"column" }}
                onDragOver={e => { e.preventDefault(); setDragStage(stage); }}
                onDragLeave={() => setDragStage(null)}
                onDrop={e => onDrop(e, stage)}>
                {/* Column header */}
                <div style={{
                  padding:"10px 14px", borderRadius:"10px 10px 0 0",
                  background: dragStage === stage ? m.bg : "#21262d",
                  border:"1px solid #30363d", borderBottom:"none",
                  display:"flex", alignItems:"center", gap:8,
                  transition:"background .2s",
                }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background: m.dot, boxShadow:`0 0 6px ${m.dot}` }} />
                  <span style={{ fontWeight:700, fontSize:".82rem", flex:1, color: m.color }}>{m.label}</span>
                  <span style={{ background:"#2d333b", borderRadius:20, padding:"2px 8px", fontSize:".68rem", fontWeight:700, color:"#8b949e" }}>{col.length}</span>
                </div>
                {/* Drop zone body */}
                <div style={{
                  flex:1, minHeight:200, padding:6,
                  border:"1px solid #30363d",
                  borderRadius:"0 0 10px 10px",
                  background: dragStage === stage ? `${m.color}12` : "rgba(255,255,255,.012)",
                  display:"flex", flexDirection:"column", gap:6,
                  transition:"background .2s",
                }}>
                  {col.length === 0 && (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:120, color:"#484f58", fontSize:".76rem", fontStyle:"italic" }}>
                      Drop here
                    </div>
                  )}
                  {col.map((a: Asset) => (
                    <PipeCard key={a._id} asset={a} onDragStart={onDragStart}
                      onPreview={() => { setPreview(a); setPreviewTab("details"); }}
                      onStar={() => handleStar(a)}
                      onSprint={() => handleSprintToggle(a)}
                      onAdvance={() => handleStageAdvance(a)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  function PipeCard({ asset: a, onDragStart, onPreview, onStar, onSprint, onAdvance }:
    { asset: Asset; onDragStart: (e: React.DragEvent, id: string) => void; onPreview: () => void; onStar: () => void; onSprint: () => void; onAdvance: () => void }) {
    const pct = leveragePct(a.multiplication);
    const pc = pillarColor(a.pillar);
    const ns = nextStage(a.stage);
    return (
      <div draggable onDragStart={e => onDragStart(e, a._id)}
        style={{
          background:"#161b22", border:"1px solid #30363d", borderRadius:6,
          padding:"10px 12px", cursor:"grab", transition:"all .18s", position:"relative", overflow:"hidden",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,.4)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
        {/* Pillar bar */}
        <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background: pc }} />
        <div style={{ marginLeft:7 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
            <span style={{ fontFamily:"Space Mono,monospace", fontSize:".65rem", color:"#009090", fontWeight:700 }}>{a.assetId}</span>
            {a.sprint && <span title="In sprint" style={{ color:"#D4A843", fontSize:".75rem" }}>⚡</span>}
            {a.starred && <span title="Starred" style={{ color:"#D4A843", fontSize:".75rem" }}>⭐</span>}
            <span style={{ marginLeft:"auto", display:"flex", gap:3 }}>
              <TypeBadge type={a.type} />
            </span>
          </div>
          <div style={{ fontWeight:600, fontSize:".8rem", color:"#e6edf3", lineHeight:1.3, marginBottom:5 }}>{a.name}</div>
          <div style={{ display:"flex", flexWrap:"wrap" as const, gap:3, marginBottom:5 }}>
            <PriBadge priority={a.priority} />
            {a.revenueTag.length > 0 && (
              <span style={{ fontSize:".62rem", color:"#E8734A", padding:"2px 6px", background:"rgba(232,115,74,.12)", borderRadius:20 }}>
                💰 {a.revenueTag.map(i => REV_TAGS[i]?.label.split(" ")[0]).join("+")}
              </span>
            )}
          </div>
          {/* Multiply bar */}
          <div style={{ height:3, background:"#30363d", borderRadius:2, overflow:"hidden", marginBottom:6 }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#009090,#E8734A)", borderRadius:2, transition:"width .4s" }} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            {a.deployUrl && (
              <a href={a.deployUrl} target="_blank" rel="noreferrer"
                style={{ fontSize:".65rem", color:"#009090", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>
                🌐 {a.deployUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
            <div style={{ display:"flex", gap:3, marginLeft:"auto" }}>
              {ns && (
                <Btn xs ghost title={`→ ${STAGE_META[ns].label}`} onClick={onAdvance}>→</Btn>
              )}
              <Btn xs ghost title="Sprint" onClick={onSprint}>{a.sprint ? "⚡" : "○"}</Btn>
              <Btn xs ghost onClick={onStar}>{a.starred ? "⭐" : "☆"}</Btn>
              <Btn xs ghost onClick={onPreview}><span style={{ fontSize:".7rem" }}>↗</span></Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ── SPRINT TAB ────────────────────────────────────────────
  function SprintTab() {
    const total = sprintItems.length;
    const done  = sprintItems.filter((a: Asset) => a.stage === "live" || a.stage === "promoted" || a.stage === "converting").length;
    return (
      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:18 }}>
        <div>
          <div style={{ fontSize:".76rem", color:"#8b949e", marginBottom:10, display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ color:"#009090" }}>ℹ</span>
            Drag assets from Pipeline or click ⚡ on any card. Focus on 3–5 assets per week.
          </div>
          <div
            style={{
              minHeight:300, padding:12,
              background: sprintItems.length === 0 ? "rgba(0,144,144,.03)" : "transparent",
              border:"2px dashed rgba(0,144,144,.3)", borderRadius:10,
              display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10,
              transition:"all .2s",
            }}
            onDragOver={e => e.preventDefault()}
            onDrop={async e => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              const a = assets.find((x: Asset) => x._id === id);
              if (a && !a.sprint) await handleSprintToggle(a);
            }}>
            {sprintItems.length === 0 && (
              <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", justifyContent:"center", height:200, color:"#484f58", fontSize:".82rem", fontStyle:"italic" }}>
                Drop assets here or click ⚡ on any pipeline card
              </div>
            )}
            {sprintItems.map((a: Asset) => (
              <div key={a._id}
                draggable onDragStart={e => { e.dataTransfer.setData("text/plain", a._id); }}
                style={{ background:"#161b22", border:"1px solid #009090", borderRadius:10, padding:"12px 14px", cursor:"grab", position:"relative" }}>
                <button onClick={() => handleSprintToggle(a)}
                  style={{ position:"absolute", top:8, right:8, background:"none", border:"none", cursor:"pointer", color:"#484f58", fontSize:".8rem" }}>✕</button>
                <div style={{ fontFamily:"Space Mono,monospace", fontSize:".65rem", color:"#009090", fontWeight:700, marginBottom:4 }}>{a.assetId}</div>
                <div style={{ fontWeight:600, fontSize:".84rem", color:"#e6edf3", marginBottom:6 }}>{a.name}</div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" as const, marginBottom:6 }}>
                  <TypeBadge type={a.type} />
                  <StageBadge stage={a.stage} />
                  <PriBadge priority={a.priority} />
                </div>
                <div style={{ fontSize:".72rem", color:"#8b949e" }}>{a.category}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
          <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:10, padding:"1rem" }}>
            <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"1.3rem", fontWeight:700, color:"#D4A843", marginBottom:10 }}>
              Sprint Status
            </div>
            {[
              ["Assets focused", total],
              ["At Live+ stage", done],
              ["Progress", total ? `${Math.round((done/total)*100)}%` : "—"],
              ["Total KB", fmtKb(sprintItems.reduce((s: number, a: Asset) => s + a.kb, 0))],
            ].map(([label, val]) => (
              <div key={label as string} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid #21262d", fontSize:".8rem" }}>
                <span style={{ color:"#8b949e" }}>{label}</span>
                <span style={{ fontWeight:600, color:"#e6edf3" }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:10, padding:"1rem" }}>
            <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"1rem", fontWeight:700, color:"#D4A843", marginBottom:10 }}>
              Sprint Recommendations
            </div>
            {[
              { icon:"🎯", text:"Target 3–5 assets max — focus beats volume" },
              { icon:"📈", text:"Prioritize assets at 'Ready' → move to 'Live'" },
              { icon:"💰", text:"Revenue-tagged assets advance your MRR goal" },
              { icon:"✖️", text:"Multiply 1 MD doc → 6 formats this week" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8, fontSize:".76rem", color:"#8b949e" }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
            <button onClick={async () => {
              await clearSprintMut();
              showToast("Sprint cleared");
              await log("edit", "Sprint cleared");
            }}
              style={{ width:"100%", marginTop:8, padding:"7px", background:"none", border:"1px solid #30363d", borderRadius:6, color:"#8b949e", cursor:"pointer", fontSize:".76rem", fontFamily:"Outfit,sans-serif" }}>
              ↺ Reset Sprint
            </button>
          </div>
        </div>
      </div>
    );
  }
  // ── MULTIPLY TAB ──────────────────────────────────────────
  function MultiplyTab() {
    const mdAssets = assets.filter((a: Asset) => ["MD","JSX","HTML"].includes(a.type));
    return (
      <div>
        <div style={{ marginBottom:12, fontSize:".76rem", color:"#8b949e" }}>
          {mdAssets.length} source assets · avg leverage score {
            mdAssets.length ? Math.round(mdAssets.reduce((s: number, a: Asset) => s + leveragePct(a.multiplication), 0) / mdAssets.length) : 0
          }%
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))", gap:12 }}>
          {mdAssets.map((a: Asset) => {
            const pct = leveragePct(a.multiplication);
            return (
              <div key={a._id} style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:10, overflow:"hidden" }}>
                <div style={{ padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                  <MulRing pct={pct} size={46} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"Space Mono,monospace", fontSize:".65rem", color:"#009090", fontWeight:700 }}>{a.assetId}</div>
                    <div style={{ fontWeight:600, fontSize:".8rem", color:"#e6edf3", lineHeight:1.3, marginTop:2 }}>{a.name}</div>
                  </div>
                  <Btn xs ghost onClick={() => { setSpawnParent(a); setAddOpen(true); }} title="Spawn child asset">+</Btn>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderTop:"1px solid #30363d" }}>
                  {MUL_FORMATS.map((f, idx) => {
                    const checked = a.multiplication[f.key];
                    return (
                      <label key={f.key} style={{
                        display:"flex", alignItems:"center", gap:8,
                        padding:"8px 12px",
                        borderRight: idx % 2 === 0 ? "1px solid #30363d" : "none",
                        borderBottom: idx < 4 ? "1px solid #30363d" : "none",
                        cursor:"pointer",
                        background: checked ? "rgba(0,144,144,.05)" : "transparent",
                        transition:"background .15s",
                      }}>
                        <input type="checkbox" checked={!!checked}
                          onChange={() => handleMulToggle(a, f.key)}
                          style={{ accentColor:"#009090", width:14, height:14, cursor:"pointer", flexShrink:0 }} />
                        <span style={{ fontSize:".75rem", color: checked ? "#00b3b3" : "#8b949e" }}>
                          {f.icon} {f.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <button onClick={() => { setSpawnParent(a); setAddOpen(true); }}
                  style={{ width:"100%", padding:"8px", background:"none", border:"none", borderTop:"1px solid #30363d", cursor:"pointer", fontSize:".73rem", color:"#8b949e", fontFamily:"Outfit,sans-serif", transition:"all .18s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#21262d"; (e.currentTarget as HTMLElement).style.color = "#009090"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#8b949e"; }}>
                  ⚡ Spawn child asset from {a.assetId}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  // ── ACTIVITY TAB ──────────────────────────────────────────
  function ActivityTab() {
    const iconMap: Record<string, string> = { add:"✚", edit:"✎", delete:"✕", deploy:"🚀", star:"⭐", upload:"↑", stage:"→" };
    const colorMap: Record<string, string> = { add:"#238636", edit:"#1f6feb", delete:"#da3633", deploy:"#bc8cff", star:"#d29922", upload:"#009090", stage:"#009090" };
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
          <Btn sm outline onClick={async () => { await clearActivity(); showToast("Activity cleared"); }}>✕ Clear</Btn>
        </div>
        {activity.length === 0 && (
          <div style={{ textAlign:"center", padding:"3rem", color:"#484f58" }}>
            <div style={{ fontSize:"2rem", marginBottom:10 }}>📋</div>
            <div>No activity yet — actions will appear here</div>
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
          {activity.map((e: any) => (
            <div key={e._id} style={{
              display:"flex", alignItems:"flex-start", gap:10,
              padding:"10px 14px", background:"#161b22",
              border:"1px solid #30363d", borderRadius:6, animation:"fadeUp .25s ease",
            }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background: colorMap[e.type] ?? "#30363d",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:".7rem", color:"white", flexShrink:0 }}>
                {iconMap[e.type] ?? "·"}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:".8rem", fontWeight:500, color:"#e6edf3" }}>{e.title}</div>
                {e.detail && <div style={{ fontSize:".7rem", color:"#8b949e", marginTop:2 }}>{e.detail}</div>}
              </div>
              <div style={{ fontSize:".68rem", color:"#484f58", whiteSpace:"nowrap" as const }}>{fmtTs(e.timestamp)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // ── REGISTRY TABLE ────────────────────────────────────────
  function RegistryTab() {
    const [inlineEditId, setInlineEditId] = useState<string | null>(null);
    const [inlineVal, setInlineVal] = useState("");
    const starred = assets.filter((a: Asset) => a.starred);
    function Th({ field, label }: { field: string; label: string }) {
      const active = sortField === field;
      return (
        <th onClick={() => sort(field)} style={{
          padding:"9px 11px", textAlign:"left" as const, fontSize:".64rem", fontWeight:600,
          color: active ? "#009090" : "#484f58", letterSpacing:".08em", textTransform:"uppercase" as const,
          whiteSpace:"nowrap" as const, cursor:"pointer", userSelect:"none" as const,
          borderBottom:"1px solid #30363d", background:"#21262d",
        }}>
          {label}{active ? (sortDir==="asc"?" ↑":" ↓") : ""}
        </th>
      );
    }
    return (
      <div>
        {/* Starred bar */}
        {starred.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 12px", background:"#161b22", border:"1px solid #30363d", borderRadius:8, marginBottom:10 }}>
            <span style={{ color:"#D4A843", fontSize:".8rem" }}>⭐</span>
            {starred.map((a: Asset) => (
              <button key={a._id} onClick={() => { setPreview(a); setPreviewTab("details"); }}
                style={{ background:"rgba(212,168,67,.12)", border:"1px solid rgba(212,168,67,.25)", borderRadius:20, padding:"2px 10px", fontSize:".72rem", color:"#D4A843", cursor:"pointer", fontFamily:"Outfit,sans-serif" }}>
                {a.assetId}
              </button>
            ))}
          </div>
        )}
        {/* Bulk bar */}
        {selectedIds.size > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"#21262d", border:"1px solid #30363d", borderRadius:8, marginBottom:10, flexWrap:"wrap" as const }}>
            <span style={{ background:"#009090", color:"white", borderRadius:20, padding:"2px 9px", fontSize:".68rem", fontWeight:700 }}>{selectedIds.size}</span>
            <span style={{ fontSize:".78rem", color:"#8b949e" }}>selected</span>
            <Btn sm outline onClick={async () => { await bulkStatus({ ids: [...selectedIds] as any, status:"Complete" }); clearSel(); showToast("✓ Marked Complete"); }}>✓ Complete</Btn>
            <Btn sm outline onClick={async () => { await bulkStatus({ ids: [...selectedIds] as any, status:"In Progress" }); clearSel(); showToast("In Progress"); }}>⏳ In Progress</Btn>
            <select onChange={async e => { if (e.target.value) { await bulkStage({ ids:[...selectedIds] as any, stage:e.target.value }); clearSel(); showToast(`Stage: ${e.target.value}`); e.target.value=""; } }}
              style={sSelect} defaultValue="">
              <option value="">Set Stage…</option>
              {STAGES.map(s => <option key={s} value={s}>{STAGE_META[s].label}</option>)}
            </select>
            <select onChange={async e => { if (e.target.value) { await bulkPriority({ ids:[...selectedIds] as any, priority:e.target.value }); clearSel(); showToast(`Priority: ${e.target.value}`); e.target.value=""; } }}
              style={sSelect} defaultValue="">
              <option value="">Set Priority…</option>
              {["Critical","High","Medium","Low"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <Btn sm danger onClick={() => {
              setConfirmMsg(`Delete ${selectedIds.size} assets? Cannot be undone.`);
              setConfirmCb(() => async () => {
                await bulkRemove({ ids:[...selectedIds] as any });
                clearSel(); showToast("🗑️ Deleted"); setConfirmCb(null);
              });
            }}>🗑️ Delete</Btn>
            <Btn sm ghost onClick={clearSel} style={{ marginLeft:"auto" }}>✕</Btn>
          </div>
        )}
        {/* Toolbar */}
        <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" as const, marginBottom:12, background:"#161b22", border:"1px solid #30363d", borderRadius:10, padding:"8px 12px" }}>
          <div style={{ position:"relative", flex:1, minWidth:160, maxWidth:280 }}>
            <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"#484f58", fontSize:".78rem" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ID, notes…"
              style={{ ...sInput, paddingLeft:28, width:"100%" }} />
          </div>
          {([["fType",fType,setFType,["MD","JSX","TSX","HTML","XLSX","PDF","JSON"],"Type"],
             ["fPillar",fPillar,setFPillar,PILLARS,"Pillar"],
             ["fStatus",fStatus,setFStatus,["Complete","In Progress"],"Status"],
             ["fStage",fStage,setFStage,STAGES.map(s => ({ val:s, label:STAGE_META[s].label })),"Stage"],
             ["fPri",fPri,setFPri,["Critical","High","Medium","Low"],"Priority"],
             ["fCat",fCat,setFCat,CATEGORIES,"Category"],
          ] as any[]).map(([, val, setter, opts, label]) => (
            <select key={label} value={val} onChange={e => setter(e.target.value)} style={sSelect}>
              <option value="">All {label}</option>
              {opts.map((o: any) => typeof o === "string"
                ? <option key={o} value={o}>{o}</option>
                : <option key={o.val} value={o.val}>{o.label}</option>
              )}
            </select>
          ))}
          <select value={fSpecial} onChange={e => setFSpecial(e.target.value)} style={sSelect}>
            <option value="">All</option>
            <option value="starred">⭐ Starred</option>
            <option value="sprint">⚡ Sprint</option>
            <option value="live">🌐 Live</option>
          </select>
          <button onClick={() => { setSearch(""); setFType(""); setFPillar(""); setFStatus(""); setFStage(""); setFPri(""); setFCat(""); setFSpecial(""); }}
            style={{ ...sBtnGhost, padding:"6px 10px" }}>✕</button>
          <div style={{ display:"flex", border:"1px solid #30363d", borderRadius:6, overflow:"hidden" }}>
            {(["table","card"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding:"6px 10px", border:"none",
                background: view===v ? "#009090" : "#21262d",
                color: view===v ? "white" : "#8b949e", cursor:"pointer", fontSize:".78rem",
              }}>{v === "table" ? "☰" : "⊞"}</button>
            ))}
          </div>
          <span style={{ fontSize:".72rem", color:"#484f58" }}>
            <strong style={{ color:"#c9d1d9" }}>{filtered.length}</strong> / {assets.length}
          </span>
        </div>
        {view === "table" ? (
          <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:10, overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" as const }}>
              <thead>
                <tr>
                  <th style={{ padding:"9px 11px", background:"#21262d", borderBottom:"1px solid #30363d", width:36 }}>
                    <input type="checkbox" onChange={e => e.target.checked ? selectAll() : clearSel()}
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      style={{ accentColor:"#009090", cursor:"pointer" }} />
                  </th>
                  <Th field="assetId" label="ID" />
                  <Th field="name" label="Name" />
                  <Th field="type" label="Type" />
                  <Th field="stage" label="Stage" />
                  <Th field="priority" label="Priority" />
                  <Th field="kb" label="KB" />
                  <th style={{ padding:"9px 11px", background:"#21262d", borderBottom:"1px solid #30363d", fontSize:".64rem", color:"#484f58", letterSpacing:".08em", textTransform:"uppercase" as const }}>Notes</th>
                  <th style={{ padding:"9px 11px", background:"#21262d", borderBottom:"1px solid #30363d", fontSize:".64rem", color:"#484f58" }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a: Asset) => (
                  <tr key={a._id}
                    style={{ borderBottom:"1px solid rgba(48,54,61,.5)", background: selectedIds.has(a._id) ? "rgba(0,144,144,.06)" : "transparent", transition:"background .1s" }}
                    onMouseEnter={e => { if (!selectedIds.has(a._id)) (e.currentTarget as HTMLElement).style.background = "#21262d"; }}
                    onMouseLeave={e => { if (!selectedIds.has(a._id)) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <td style={{ padding:"8px 11px" }}>
                      <input type="checkbox" checked={selectedIds.has(a._id)} onChange={() => toggleSel(a._id)}
                        style={{ accentColor:"#009090", cursor:"pointer" }} />
                    </td>
                    <td style={{ padding:"8px 11px", fontFamily:"Space Mono,monospace", fontSize:".7rem", color:"#009090", fontWeight:700 }}>{a.assetId}</td>
                    <td style={{ padding:"8px 11px" }}>
                      <div style={{ fontWeight:500, color:"#e6edf3", fontSize:".8rem" }}>{a.name}</div>
                      <div style={{ fontSize:".67rem", color:"#484f58", marginTop:2 }}>{a.category}</div>
                    </td>
                    <td style={{ padding:"8px 11px" }}><TypeBadge type={a.type} /></td>
                    <td style={{ padding:"8px 11px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <StageBadge stage={a.stage} />
                        {nextStage(a.stage) && (
                          <button onClick={() => handleStageAdvance(a)} title="Advance stage"
                            style={{ background:"none", border:"none", cursor:"pointer", color:"#484f58", fontSize:".7rem", transition:"color .15s" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#009090"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#484f58"}>→</button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding:"8px 11px" }}><PriBadge priority={a.priority} /></td>
                    <td style={{ padding:"8px 11px", fontFamily:"Space Mono,monospace", fontSize:".69rem", color:"#484f58" }}>{a.kb}</td>
                    <td style={{ padding:"8px 11px" }}>
                      {inlineEditId === a._id
                        ? <input autoFocus value={inlineVal}
                            onChange={e => setInlineVal(e.target.value)}
                            onBlur={() => { handleInlineNote(a, inlineVal); setInlineEditId(null); }}
                            onKeyDown={e => { if (e.key==="Enter") { handleInlineNote(a, inlineVal); setInlineEditId(null); } if (e.key==="Escape") setInlineEditId(null); }}
                            style={{ ...sInput, width:190, fontSize:".74rem" }} />
                        : <span onClick={() => { setInlineEditId(a._id); setInlineVal(a.notes ?? ""); }}
                            style={{ cursor:"pointer", fontSize:".7rem", color: a.notes ? "#8b949e" : "#484f58", fontStyle: a.notes ? "normal" : "italic",
                              maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const, display:"block" }}
                            title={a.notes ?? "Click to add note"}>
                            {a.notes ?? "Add note…"}
                          </span>
                      }
                    </td>
                    <td style={{ padding:"8px 11px" }}>
                      <div style={{ display:"flex", gap:3, alignItems:"center" }}>
                        <button onClick={() => handleStar(a)} title="Star" style={{ ...sBtnGhost, padding:"3px 5px", opacity: a.starred ? 1 : 0.25, color: a.starred ? "#D4A843" : undefined }}>⭐</button>
                        <button onClick={() => handleSprintToggle(a)} title="Sprint" style={{ ...sBtnGhost, padding:"3px 5px", opacity: a.sprint ? 1 : 0.25, color: a.sprint ? "#D4A843" : undefined }}>⚡</button>
                        <Btn xs outline onClick={() => { setPreview(a); setPreviewTab("details"); }}>↗</Btn>
                        <Btn xs ghost onClick={() => { setEditAsset(a); setAddOpen(true); }}>✎</Btn>
                        <Btn xs danger onClick={() => handleDelete(a)}>✕</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{ textAlign:"center", padding:"3rem", color:"#484f58" }}>No assets match filters</div>}
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
            {filtered.map((a: Asset) => (
              <div key={a._id} style={{
                background:"#161b22", border:"1px solid #30363d", borderRadius:10, padding:"1rem",
                position:"relative", overflow:"hidden",
                transition:"transform .2s, box-shadow .2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,.4)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background: pillarColor(a.pillar) }} />
                <button onClick={() => handleStar(a)} style={{ position:"absolute", top:10, right:10, background:"none", border:"none", cursor:"pointer", opacity: a.starred ? 1 : 0.2, color:"#D4A843", fontSize:".9rem" }}>⭐</button>
                <div style={{ fontFamily:"Space Mono,monospace", fontSize:".65rem", color:"#009090", background:"rgba(0,144,144,.12)", padding:"2px 7px", borderRadius:5, display:"inline-block", marginBottom:6 }}>{a.assetId}</div>
                <div style={{ fontWeight:600, fontSize:".86rem", color:"#e6edf3", lineHeight:1.3, marginBottom:4 }}>{a.name}</div>
                <div style={{ fontSize:".68rem", color:"#484f58", marginBottom:8 }}>{a.category}</div>
                <div style={{ display:"flex", flexWrap:"wrap" as const, gap:4, marginBottom:8 }}>
                  <TypeBadge type={a.type} /><StageBadge stage={a.stage} /><PriBadge priority={a.priority} />
                </div>
                <div style={{ height:3, background:"#30363d", borderRadius:2, overflow:"hidden", marginBottom:8 }}>
                  <div style={{ height:"100%", width:`${leveragePct(a.multiplication)}%`, background:"linear-gradient(90deg,#009090,#E8734A)", borderRadius:2 }} />
                </div>
                <div style={{ borderTop:"1px solid #30363d", paddingTop:8, display:"flex", gap:4, flexWrap:"wrap" as const }}>
                  <Btn xs outline onClick={() => { setPreview(a); setPreviewTab("details"); }}>↗ View</Btn>
                  <Btn xs ghost onClick={() => { setEditAsset(a); setAddOpen(true); }}>✎</Btn>
                  <Btn xs ghost onClick={() => handleSprintToggle(a)} style={{ color: a.sprint ? "#D4A843" : undefined }}>⚡</Btn>
                  <Btn xs danger onClick={() => handleDelete(a)}>✕</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  // ── UPLOAD TAB ────────────────────────────────────────────
  function UploadTab() {
    return (
      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:20 }}>
        <div>
          <label
            style={{ display:"block", border:"2px dashed rgba(0,144,144,.4)", borderRadius:16, padding:"2.5rem 2rem", textAlign:"center" as const, cursor:"pointer", background:"rgba(0,144,144,.03)", transition:"all .25s" }}
            onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.background = "rgba(0,144,144,.08)"; }}
            onDragLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,144,144,.03)"; }}
            onDrop={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.background = "rgba(0,144,144,.03)"; handleFiles(e.dataTransfer.files); }}>
            <input type="file" multiple accept=".md,.pdf,.json,.html,.jsx,.tsx,.xlsx,.csv,.txt,.docx" style={{ display:"none" }} onChange={e => handleFiles(e.target.files)} />
            <div style={{ fontSize:"2.2rem", color:"#009090", marginBottom:10 }}>☁</div>
            <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"1.4rem", fontWeight:700, color:"#e6edf3", marginBottom:4 }}>Drop Files Here</div>
            <div style={{ fontSize:".78rem", color:"#484f58", marginBottom:12 }}>MD · HTML · JSX · TSX · JSON · PDF · XLSX · TXT</div>
            <div style={{ display:"flex", flexWrap:"wrap" as const, gap:4, justifyContent:"center" }}>
              {["MD","HTML","JSX","TSX","JSON","PDF","XLSX"].map(t => <TypeBadge key={t} type={t} />)}
            </div>
          </label>
          {uploadQueue.length > 0 && (
            <div style={{ marginTop:12, display:"flex", flexDirection:"column" as const, gap:6 }}>
              {uploadQueue.map((f, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#161b22", border:"1px solid #30363d", borderRadius:6 }}>
                  <TypeBadge type={f.type} />
                  <span style={{ flex:1, fontWeight:500, fontSize:".8rem", color:"#e6edf3" }}>{f.name}</span>
                  <span style={{ fontFamily:"Space Mono,monospace", fontSize:".68rem", color:"#484f58" }}>{f.kb} KB</span>
                  <Btn xs teal onClick={() => { setSpawnParent(null); setEditAsset(null); setPendingUpload(f); setAddOpen(true); }}>+ Add to Registry</Btn>
                  <button onClick={() => setUploadQueue(q => q.filter((_,j) => j !== i))} style={{ background:"none", border:"none", cursor:"pointer", color:"#484f58", fontSize:".8rem" }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:10, padding:"1.2rem" }}>
          <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"1rem", fontWeight:700, color:"#e6edf3", marginBottom:12 }}>Upload → Registry Flow</div>
          {[
            { c:"#009090", h:"Auto-detect", b:"Type, name, and KB extracted from file metadata" },
            { c:"#E8734A", h:"Content read", b:"Text files stored in Convex for preview & download" },
            { c:"#D4A843", h:"Pre-fill form", b:"Click Add → edit fields → saves at Draft stage" },
            { c:"#3fb950", h:"Pipeline entry", b:"Asset appears in Draft column, advance stage-by-stage" },
          ].map(({ c, h, b }) => (
            <div key={h} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:12 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:c, marginTop:6, flexShrink:0 }} />
              <div><strong style={{ color:"#e6edf3", fontSize:".78rem" }}>{h}:</strong>
                <span style={{ fontSize:".76rem", color:"#8b949e" }}> {b}</span></div>
            </div>
          ))}
          <div style={{ marginTop:12, padding:"10px 12px", background:"#21262d", borderRadius:8, fontSize:".74rem", color:"#8b949e" }}>
            📦 Session total: {uploadQueue.length} queued · {uploadQueue.reduce((s,f) => s + f.kb, 0)} KB
          </div>
        </div>
      </div>
    );
  }
  // ── DASHBOARD TAB ─────────────────────────────────────────
  function DashboardTab() {
    if (!stats) return <div style={{ color:"#8b949e", padding:"2rem", textAlign:"center" as const }}>Loading…</div>;
    const kpis = [
      { label:"Total Assets", val:stats.total, sub:"In registry", c:"#009090" },
      { label:"Complete", val:stats.complete, sub:`${Math.round((stats.complete/stats.total)*100)}% done`, c:"#3fb950" },
      { label:"Critical Priority", val:stats.critical, sub:"Require attention", c:"#f85149" },
      { label:"Live", val:stats.liveCount, sub:"Deployed pages", c:"#58a6ff" },
      { label:"Converting", val:stats.converting, sub:"Revenue-linked", c:"#E8734A" },
      { label:"Leverage %", val:`${stats.leveragePct}%`, sub:"Multiplication score", c:"#D4A843" },
      { label:"Sprint", val:stats.sprint, sub:"This week", c:"#bc8cff" },
    ];
    return (
      <div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:10, marginBottom:18 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:10, padding:"1rem .9rem", position:"relative", overflow:"hidden", cursor:"pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${k.c}25`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:k.c }} />
              <div style={{ fontSize:".62rem", fontWeight:600, letterSpacing:".1em", textTransform:"uppercase" as const, color:"#8b949e", marginBottom:4 }}>{k.label}</div>
              <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"2.1rem", fontWeight:700, color:k.c, lineHeight:1 }}>{k.val}</div>
              <div style={{ fontSize:".67rem", color:"#484f58", marginTop:2 }}>{k.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
          <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:10, padding:"1.2rem" }}>
            <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:".95rem", fontWeight:700, color:"#e6edf3", marginBottom:12 }}>Pipeline Stage Breakdown</div>
            {STAGES.map(stage => {
              const n = stats.stageCounts[stage] ?? 0;
              const pct = stats.total ? (n / stats.total) * 100 : 0;
              const m = STAGE_META[stage];
              return (
                <div key={stage} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <StageBadge stage={stage} />
                    <span style={{ fontFamily:"Space Mono,monospace", fontSize:".7rem", color:"#8b949e" }}>{n} <span style={{ color:"#484f58" }}>/ {stats.total}</span></span>
                  </div>
                  <div style={{ height:4, background:"#30363d", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background: m.dot, borderRadius:2, transition:"width 1s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:10, padding:"1.2rem" }}>
            <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:".95rem", fontWeight:700, color:"#e6edf3", marginBottom:12 }}>Category Breakdown</div>
            {Object.entries(stats.catStats)
              .sort((a,b) => b[1].count - a[1].count)
              .map(([cat, s]: [string, any]) => (
              <div key={cat} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, fontSize:".76rem" }}>
                <span style={{ flex:1, color:"#8b949e", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }} title={cat}>{cat}</span>
                <span style={{ fontFamily:"Space Mono,monospace", color:"#e6edf3", fontWeight:600, fontSize:".7rem" }}>{s.count}</span>
                <span style={{ fontFamily:"Space Mono,monospace", color:"#484f58", fontSize:".67rem" }}>{fmtKb(s.kb)}</span>
                <div style={{ width:60, height:3, background:"#30363d", borderRadius:2, overflow:"hidden", flexShrink:0 }}>
                  <div style={{ height:"100%", width:`${s.count/stats.total*100}%`, background:"#009090", borderRadius:2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  // ── ADD/EDIT FORM ─────────────────────────────────────────
  const [form, setForm] = useState<Record<string,any>>({});
  const [formErrors, setFormErrors] = useState<Record<string,string>>({});
  useEffect(() => {
    if (addOpen) {
      if (editAsset) {
        setForm({ ...editAsset });
      } else {
        // A file promoted from the upload queue pre-fills name/type/kb/code;
        // everything else still gets a real default so `create` never runs
        // without an assetId or category.
        setForm({
          assetId: nextIdFor(pendingUpload ? "REF" : "MMM"),
          name: pendingUpload?.name ?? (spawnParent?.name ? `${spawnParent.name} — ` : ""),
          type: pendingUpload?.type ?? "MD",
          category: pendingUpload ? "Uploaded Reference" : "Course Content",
          pillar: "Multi-Pillar",
          status: "In Progress", stage: "draft", priority: "High",
          date: new Date().toLocaleDateString("en-US",{month:"short",day:"2-digit"}),
          kb: pendingUpload?.kb ?? 0,
          notes: "",
          code: pendingUpload?.code ?? "",
          deployUrl: "",
          revenueTag: spawnParent?.revenueTag ?? [],
          parentId: spawnParent?._id,
          multiplication: { newsletter:false, blog:false, video:false, leadMagnet:false, courseModule:false, landingPage:false },
        });
      }
      setFormErrors({});
    }
  }, [addOpen, editAsset, spawnParent, pendingUpload, nextIdFor]);
  function validateForm() {
    const errs: Record<string,string> = {};
    if (!form.assetId?.trim()) errs.assetId = "Asset ID is required";
    if (!form.name?.trim()) errs.name = "Name is required";
    if (!form.type) errs.type = "Type is required";
    if (!form.category) errs.category = "Category is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }
  // ── PREVIEW PANEL ─────────────────────────────────────────
  function PreviewPanel() {
    const [localDeployUrl, setLocalDeployUrl] = useState(deployInput);
    if (!preview) return null;
    const pct = leveragePct(preview.multiplication);
    const parent = preview.parentId ? assets.find((a: Asset) => a._id === preview.parentId) : null;
    return (
      <>
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:399 }} onClick={() => setPreview(null)} />
        <div style={{
          position:"fixed", top:0, right:0, height:"100vh", width:580,
          background:"#161b22", zIndex:400,
          boxShadow:"-8px 0 40px rgba(0,0,0,.7)",
          borderLeft:"1px solid #30363d",
          display:"flex", flexDirection:"column" as const,
          animation:"slideIn .3s cubic-bezier(.4,0,.2,1)",
        }}>
          {/* Head */}
          <div style={{ padding:"10px 16px", borderBottom:"1px solid #30363d", background:"#21262d", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <span style={{ fontFamily:"Space Mono,monospace", fontSize:".67rem", color:"#009090", background:"rgba(0,144,144,.15)", padding:"3px 9px", borderRadius:5, fontWeight:700 }}>{preview.assetId}</span>
            <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"1.05rem", fontWeight:700, flex:1, color:"#e6edf3", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{preview.name}</div>
            <Btn sm outline onClick={() => { setEditAsset(preview); setAddOpen(true); }}>✎ Edit</Btn>
            <button onClick={() => setPreview(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#8b949e", fontSize:"1rem", padding:"4px 8px" }}>✕</button>
          </div>
          {/* Tabs */}
          <div style={{ display:"flex", borderBottom:"1px solid #30363d", overflowX:"auto" as const, background:"#161b22", flexShrink:0 }}>
            {["details","lifecycle","multiply","deploy","code","render"].map(t => (
              <button key={t} onClick={() => setPreviewTab(t)} style={{
                flex:1, minWidth:70, padding:"8px 6px", border:"none", background:"none",
                cursor:"pointer", fontFamily:"Outfit,sans-serif", fontSize:".72rem", fontWeight:500,
                color: previewTab===t ? "#009090" : "#484f58",
                borderBottom:`2px solid ${previewTab===t ? "#009090" : "transparent"}`,
                transition:"all .2s", whiteSpace:"nowrap" as const, textTransform:"capitalize" as const,
              }}>{t}</button>
            ))}
          </div>
          {/* Body */}
          <div style={{ flex:1, overflowY:"auto" as const, padding:"1.1rem" }}>
            {previewTab === "details" && (
              <div>
                {parent && (
                  <div onClick={() => setPreview(parent)}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"rgba(0,144,144,.07)", border:"1px solid rgba(0,144,144,.2)", borderRadius:8, marginBottom:14, cursor:"pointer", fontSize:".76rem" }}>
                    <span style={{ color:"#009090" }}>↑</span>
                    <span style={{ fontFamily:"Space Mono,monospace", color:"#009090", fontSize:".65rem" }}>{parent.assetId}</span>
                    <span style={{ color:"#8b949e" }}>{parent.name}</span>
                  </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                  {[
                    ["Type", <TypeBadge type={preview.type} />],
                    ["Stage", <StageBadge stage={preview.stage} />],
                    ["Priority", <PriBadge priority={preview.priority} />],
                    ["Status", <span style={{ fontSize:".8rem", color: preview.status==="Complete" ? "#3fb950" : "#D4A843" }}>{preview.status}</span>],
                    ["Pillar", <span style={{ fontSize:".8rem", color:"#e6edf3" }}>{preview.pillar}</span>],
                    ["Category", <span style={{ fontSize:".78rem", color:"#8b949e" }}>{preview.category}</span>],
                    ["Date", <span style={{ fontSize:".8rem", color:"#8b949e" }}>{preview.date}</span>],
                    ["Size", <span style={{ fontFamily:"Space Mono,monospace", fontSize:".78rem", color:"#8b949e" }}>{fmtKb(preview.kb)}</span>],
                  ].map(([l, v]) => (
                    <div key={l as string}>
                      <div style={{ fontSize:".62rem", fontWeight:600, textTransform:"uppercase" as const, letterSpacing:".08em", color:"#484f58", marginBottom:4 }}>{l}</div>
                      {v}
                    </div>
                  ))}
                </div>
                {preview.notes && (
                  <div style={{ padding:"10px 12px", background:"#21262d", border:"1px solid #30363d", borderRadius:8, marginBottom:12, fontSize:".8rem", color:"#8b949e", lineHeight:1.5 }}>
                    {preview.notes}
                  </div>
                )}
                {preview.revenueTag.length > 0 && (
                  <div>
                    <div style={{ fontSize:".62rem", fontWeight:600, textTransform:"uppercase" as const, letterSpacing:".08em", color:"#484f58", marginBottom:6 }}>Revenue Tags</div>
                    <div style={{ display:"flex", flexWrap:"wrap" as const, gap:6 }}>
                      {preview.revenueTag.map(i => {
                        const t = REV_TAGS[i];
                        return t ? <span key={i} style={{ padding:"4px 10px", borderRadius:20, fontSize:".74rem", fontWeight:500, background:`${t.color}15`, color:t.color, border:`1.5px solid ${t.color}40` }}>{t.label}</span> : null;
                      })}
                    </div>
                  </div>
                )}
                {children.length > 0 && (
                  <div style={{ marginTop:14 }}>
                    <div style={{ fontSize:".62rem", fontWeight:600, textTransform:"uppercase" as const, letterSpacing:".08em", color:"#484f58", marginBottom:8 }}>Child Assets ({children.length})</div>
                    <div style={{ display:"flex", flexDirection:"column" as const, gap:5 }}>
                      {children.map((c: Asset) => (
                        <div key={c._id} onClick={() => setPreview(c)}
                          style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"#21262d", border:"1px solid #30363d", borderRadius:6, cursor:"pointer", fontSize:".76rem" }}>
                          <span style={{ fontFamily:"Space Mono,monospace", color:"#009090", fontSize:".65rem", fontWeight:700 }}>{c.assetId}</span>
                          <span style={{ flex:1, color:"#c9d1d9" }}>{c.name}</span>
                          <StageBadge stage={c.stage} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {previewTab === "lifecycle" && (
              <div>
                <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:".95rem", fontWeight:700, color:"#e6edf3", marginBottom:12 }}>Pipeline Journey</div>
                <div style={{ display:"flex", flexDirection:"column" as const, gap:0, marginBottom:16 }}>
                  {STAGES.map((s, i) => {
                    const curr = STAGES.indexOf(preview.stage);
                    const done = i <= curr;
                    const active = i === curr;
                    const m = STAGE_META[s];
                    return (
                      <div key={s} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                        <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", width:24 }}>
                          <div style={{ width:24, height:24, borderRadius:"50%", background: done ? m.dot : "#30363d",
                            border: active ? `2px solid ${m.dot}` : "2px solid transparent",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:".65rem", color:"white", fontWeight:700, boxShadow: active ? `0 0 12px ${m.dot}` : "none",
                          }}>{done ? "✓" : i+1}</div>
                          {i < STAGES.length-1 && <div style={{ width:2, height:28, background: done ? m.dot : "#30363d" }} />}
                        </div>
                        <div style={{ paddingBottom:16 }}>
                          <div style={{ fontWeight:600, fontSize:".82rem", color: done ? m.color : "#484f58" }}>{m.label}</div>
                          <div style={{ fontSize:".71rem", color:"#484f58", marginTop:2 }}>
                            {{
                              draft:"Built & saved locally",
                              ready:"Validated & ready to deploy",
                              live:"Deployed & accessible online",
                              promoted:"Pushed via newsletter or blog",
                              converting:"Linked to a paid offer",
                            }[s]}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {nextStage(preview.stage) && (
                  <Btn sm teal onClick={() => { handleStageAdvance(preview); setPreview({ ...preview, stage: nextStage(preview.stage)! }); }}>
                    → Advance to {STAGE_META[nextStage(preview.stage)!].label}
                  </Btn>
                )}
              </div>
            )}
            {previewTab === "multiply" && (
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <MulRing pct={pct} size={56} />
                  <div>
                    <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:".95rem", fontWeight:700, color:"#e6edf3" }}>Content Leverage</div>
                    <div style={{ fontSize:".76rem", color:"#8b949e" }}>{mulScore(preview.multiplication)} / 6 formats built</div>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
                  {MUL_FORMATS.map(f => {
                    const checked = preview.multiplication[f.key];
                    return (
                      <label key={f.key} onClick={() => handleMulToggle(preview, f.key)}
                        style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
                          background: checked ? "rgba(0,144,144,.07)" : "#21262d",
                          border:`1px solid ${checked ? "rgba(0,144,144,.3)" : "#30363d"}`,
                          borderRadius:8, cursor:"pointer", transition:"all .15s" }}>
                        <input type="checkbox" checked={!!checked} readOnly style={{ accentColor:"#009090", width:16, height:16, cursor:"pointer", flexShrink:0 }} />
                        <span style={{ fontSize:"1.1rem" }}>{f.icon}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:500, fontSize:".82rem", color: checked ? "#00b3b3" : "#c9d1d9" }}>{f.label}</div>
                          <div style={{ fontSize:".71rem", color:"#484f58" }}>{f.desc}</div>
                        </div>
                        {!checked && (
                          <button onClick={e => { e.stopPropagation(); setSpawnParent(preview); setAddOpen(true); }}
                            style={{ background:"none", border:"1px solid #30363d", borderRadius:6, padding:"3px 8px", cursor:"pointer", fontSize:".7rem", color:"#8b949e", fontFamily:"Outfit,sans-serif" }}>Spawn →</button>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            {previewTab === "deploy" && (
              <div>
                <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:".95rem", fontWeight:700, color:"#e6edf3", marginBottom:12 }}>Deploy History</div>
                {deployLog.length === 0 && (
                  <div style={{ padding:"1.5rem", textAlign:"center" as const, color:"#484f58", fontSize:".8rem", marginBottom:12 }}>No deploys logged yet</div>
                )}
                <div style={{ display:"flex", flexDirection:"column" as const, gap:6, marginBottom:14 }}>
                  {deployLog.map((d: any) => (
                    <div key={d._id} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"#21262d", border:"1px solid #30363d", borderRadius:6, fontSize:".76rem" }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:"#3fb950", boxShadow:"0 0 6px #3fb950", flexShrink:0 }} />
                      <a href={d.url} target="_blank" rel="noreferrer" style={{ color:"#009090", flex:1, fontFamily:"Space Mono,monospace", fontSize:".67rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{d.url}</a>
                      <span style={{ color:"#484f58", fontSize:".67rem", whiteSpace:"nowrap" as const }}>{fmtTs(d.deployedAt)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontWeight:600, fontSize:".78rem", color:"#8b949e", marginBottom:6 }}>Log a new deploy</div>
                <div style={{ display:"flex", gap:6 }}>
                  <input value={deployInput} onChange={e => setDeployInput(e.target.value)}
                    placeholder="https://your-site.netlify.app/page.html"
                    style={{ ...sInput, flex:1, fontFamily:"Space Mono,monospace", fontSize:".74rem" }}
                    onKeyDown={e => { if (e.key==="Enter") handleDeploy(preview._id, deployInput); }} />
                  <Btn sm teal onClick={() => handleDeploy(preview._id, deployInput)}>🚀 Log</Btn>
                </div>
              </div>
            )}
            {previewTab === "code" && (
              <div>
                <div style={{ background:"#0d1117", borderRadius:8, overflow:"hidden", border:"1px solid #30363d" }}>
                  <div style={{ display:"flex", alignItems:"center", padding:"7px 12px", background:"#21262d", borderBottom:"1px solid #30363d" }}>
                    <span style={{ fontFamily:"Space Mono,monospace", fontSize:".67rem", color:"#484f58" }}>{preview.type.toLowerCase()}</span>
                    <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
                      <Btn xs ghost onClick={() => { navigator.clipboard.writeText(preview.code ?? ""); showToast("✓ Copied"); }}>📋 Copy</Btn>
                      {preview.code && (
                        <Btn xs ghost onClick={() => {
                          const blob = new Blob([preview.code!], { type:"text/plain" });
                          const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                          a.download = `${preview.assetId}-${preview.name.replace(/\s+/g,"-").toLowerCase()}.${preview.type.toLowerCase()}`;
                          a.click();
                          showToast("⬇ Downloaded");
                        }}>⬇ Download</Btn>
                      )}
                    </div>
                  </div>
                  <pre style={{ padding:"1rem", overflow:"auto" as const, fontFamily:"Space Mono,monospace", fontSize:".7rem", lineHeight:1.7, color:"#79c0ff", maxHeight:420, whiteSpace:"pre" as const }}>
                    {preview.code ?? "No code content stored.\n\nEdit this asset and paste content in the Code field."}
                  </pre>
                </div>
              </div>
            )}
            {previewTab === "render" && (
              <div>
                {preview.type === "HTML"
                  ? <iframe srcDoc={preview.code} style={{ width:"100%", height:420, border:"1px solid #30363d", borderRadius:8, background:"white" }} sandbox="allow-scripts" title="preview" />
                  : preview.type === "MD" && preview.code
                  ? <div style={{ fontSize:".82rem", lineHeight:1.7, color:"#c9d1d9", whiteSpace:"pre-wrap" as const, background:"#21262d", padding:"1rem", borderRadius:8 }}>{preview.code}</div>
                  : <div style={{ padding:"2rem", textAlign:"center" as const, color:"#484f58" }}>
                      Render preview available for HTML files.<br />For JSX/TSX, copy code and paste into Claude Artifacts.
                    </div>
                }
              </div>
            )}
          </div>
          {/* Footer */}
          <div style={{ padding:"10px 16px", borderTop:"1px solid #30363d", display:"flex", gap:6, flexShrink:0, background:"#21262d" }}>
            <Btn sm outline onClick={() => { const i = filtered.findIndex((a:Asset) => a._id===preview._id); if(i>0) setPreview(filtered[i-1]); }}>← Prev</Btn>
            <Btn sm outline onClick={() => { const i = filtered.findIndex((a:Asset) => a._id===preview._id); if(i<filtered.length-1) setPreview(filtered[i+1]); }}>Next →</Btn>
            <Btn sm teal onClick={() => handleSprintToggle(preview)}>⚡ {preview.sprint ? "Remove Sprint" : "Add Sprint"}</Btn>
            <Btn sm danger style={{ marginLeft:"auto" }} onClick={() => handleDelete(preview)}>🗑️</Btn>
          </div>
        </div>
      </>
    );
  }
  // ── SHARED STYLE HELPERS ─────────────────────────────────
  const sInput: React.CSSProperties = { padding:"8px 10px", border:"1px solid #30363d", borderRadius:6, background:"#21262d", color:"#e6edf3", fontFamily:"Outfit,sans-serif", fontSize:".82rem", outline:"none", transition:"border-color .2s", width:"100%" };
  const sSelect: React.CSSProperties = { padding:"6px 9px", border:"1px solid #30363d", borderRadius:6, background:"#21262d", color:"#c9d1d9", fontFamily:"Outfit,sans-serif", fontSize:".74rem", cursor:"pointer" };
  const sBtnGhost: React.CSSProperties = { background:"none", border:"none", cursor:"pointer", color:"#8b949e", fontFamily:"Outfit,sans-serif", borderRadius:6, transition:"all .2s" };
  function Btn({ children, onClick, sm, xs, outline, teal, ghost, danger, style, title, disabled }:
    { children: React.ReactNode; onClick?: () => void; sm?: boolean; xs?: boolean; outline?: boolean; teal?: boolean; ghost?: boolean; danger?: boolean; style?: React.CSSProperties; title?: string; disabled?: boolean }) {
    const base: React.CSSProperties = {
      display:"inline-flex", alignItems:"center", gap:4, cursor:disabled ? "not-allowed" : "pointer", border:"none",
      fontFamily:"Outfit,sans-serif", fontWeight:500, borderRadius:6, transition:"all .2s", whiteSpace:"nowrap" as const,
      padding: xs ? "3px 7px" : sm ? "5px 10px" : "8px 14px",
      fontSize: xs ? ".68rem" : sm ? ".76rem" : ".82rem",
      opacity: disabled ? .4 : 1,
      background: teal ? "#009090" : danger ? "#da3633" : outline ? "transparent" : ghost ? "none" : "#21262d",
      color: teal ? "white" : danger ? "white" : outline ? "#c9d1d9" : ghost ? "#8b949e" : "#c9d1d9",
      border: outline ? "1px solid #30363d" : "none" as any,
      ...style,
    };
    return <button onClick={onClick} style={base} title={title} disabled={disabled}>{children}</button>;
  }
  // ── ADD/EDIT MODAL ────────────────────────────────────────
  function AddEditModal() {
    if (!addOpen) return null;
    const isEdit = !!editAsset?._id;
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }}>
        <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:16, width:"90vw", maxWidth:720, maxHeight:"90vh", display:"flex", flexDirection:"column" as const, boxShadow:"0 16px 56px rgba(0,0,0,.7)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"1.1rem 1.3rem", borderBottom:"1px solid #30363d" }}>
            <span style={{ fontFamily:"Space Mono,monospace", fontSize:".67rem", color:"#009090", background:"rgba(0,144,144,.15)", padding:"3px 9px", borderRadius:5 }}>{form.assetId ?? "NEW"}</span>
            <h2 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"1.2rem", fontWeight:700, color:"#e6edf3", flex:1 }}>
              {isEdit ? "Edit Asset" : spawnParent ? `Spawn from ${spawnParent.assetId}` : "Add New Asset"}
            </h2>
            <button onClick={() => { setAddOpen(false); setEditAsset(null); setSpawnParent(null); setPendingUpload(null); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#8b949e", fontSize:"1rem" }}>✕</button>
          </div>
          <div style={{ padding:"1.2rem 1.3rem", overflowY:"auto" as const, flex:1 }}>
            {spawnParent && (
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"rgba(0,144,144,.07)", border:"1px solid rgba(0,144,144,.2)", borderRadius:8, marginBottom:12, fontSize:".76rem", color:"#009090" }}>
                ↑ Child of <strong>{spawnParent.assetId}</strong> — {spawnParent.name}
              </div>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { label:"Asset Name *", key:"name", type:"text", span:2, err:formErrors.name },
                { label:"Asset ID *", key:"assetId", type:"text", err:formErrors.assetId },
                { label:"Date", key:"date", type:"text" },
                { label:"File Type *", key:"type", type:"sel", opts:["MD","JSX","TSX","HTML","XLSX","PDF","JSON","Folder","TXT"], err:formErrors.type },
                { label:"Category *", key:"category", type:"sel", opts:CATEGORIES, err:formErrors.category },
                { label:"Pillar", key:"pillar", type:"sel", opts:PILLARS },
                { label:"Pipeline Stage", key:"stage", type:"sel", opts:STAGES.map(s => ({ val:s, label:STAGE_META[s].label })) },
                { label:"Status", key:"status", type:"sel", opts:["In Progress","Complete"] },
                { label:"Priority", key:"priority", type:"sel", opts:["Critical","High","Medium","Low"] },
                { label:"KB", key:"kb", type:"number" },
                { label:"Notes", key:"notes", type:"text", span:2 },
                { label:"Deploy URL", key:"deployUrl", type:"text", span:2 },
              ].map(({ label, key, type, span, opts, err, disabled }: any) => (
                <div key={key} style={{ gridColumn: span===2 ? "span 2" : undefined, display:"flex", flexDirection:"column" as const, gap:3 }}>
                  <label style={{ fontSize:".66rem", fontWeight:600, color:"#484f58", letterSpacing:".06em", textTransform:"uppercase" as const }}>{label}</label>
                  {type === "sel"
                    ? <select value={form[key] ?? ""} onChange={e => setForm(f => ({ ...f, [key]:e.target.value }))}
                        style={{ ...sSelect, borderColor: err ? "#f85149" : "#30363d" }}>
                        {opts.map((o: any) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.val} value={o.val}>{o.label}</option>)}
                      </select>
                    : <input type={type} value={form[key] ?? ""} disabled={disabled}
                        onChange={e => setForm(f => ({ ...f, [key]: type==="number" ? Number(e.target.value) : e.target.value }))}
                        style={{ ...sInput, borderColor: err ? "#f85149" : "#30363d", opacity: disabled ? .5 : 1 }} />
                  }
                  {err && <span style={{ fontSize:".68rem", color:"#f85149" }}>{err}</span>}
                </div>
              ))}
              <div style={{ gridColumn:"span 2", display:"flex", flexDirection:"column" as const, gap:3 }}>
                <label style={{ fontSize:".66rem", fontWeight:600, color:"#484f58", letterSpacing:".06em", textTransform:"uppercase" as const }}>Revenue Tags</label>
                <div style={{ display:"flex", flexWrap:"wrap" as const, gap:6 }}>
                  {REV_TAGS.map((t, i) => {
                    const active = (form.revenueTag ?? []).includes(i);
                    return (
                      <button key={i} onClick={() => setForm(f => {
                        const tags = [...(f.revenueTag ?? [])];
                        const idx = tags.indexOf(i);
                        idx >= 0 ? tags.splice(idx,1) : tags.push(i);
                        return { ...f, revenueTag: tags };
                      })} style={{ padding:"4px 12px", borderRadius:20, fontSize:".74rem", fontWeight:500, cursor:"pointer", fontFamily:"Outfit,sans-serif", border:`1.5px solid ${t.color}50`, background: active ? `${t.color}20` : "transparent", color: active ? t.color : "#8b949e" }}>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ gridColumn:"span 2", display:"flex", flexDirection:"column" as const, gap:3 }}>
                <label style={{ fontSize:".66rem", fontWeight:600, color:"#484f58", letterSpacing:".06em", textTransform:"uppercase" as const }}>Code / Content <span style={{ fontWeight:400, textTransform:"none", color:"#484f58" }}>(preview & download)</span></label>
                <textarea value={form.code ?? ""} onChange={e => setForm(f => ({ ...f, code:e.target.value }))}
                  rows={4} placeholder="Paste code or content…"
                  style={{ ...sInput, resize:"vertical", fontFamily:"Space Mono,monospace", fontSize:".72rem", minHeight:80 }} />
              </div>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, padding:".85rem 1.3rem", borderTop:"1px solid #30363d" }}>
            <Btn sm outline onClick={() => { setAddOpen(false); setEditAsset(null); setSpawnParent(null); setPendingUpload(null); }}>Cancel</Btn>
            <Btn sm teal onClick={() => { if (validateForm()) handleSave(form); }}>💾 {isEdit ? "Update" : "Save"}</Btn>
          </div>
        </div>
      </div>
    );
  }
  // ── CONFIRM MODAL ─────────────────────────────────────────
  function ConfirmModal() {
    if (!confirmCb) return null;
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:510, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:16, padding:"2rem 2rem 1.5rem", maxWidth:440, width:"90vw", textAlign:"center" as const }}>
          <div style={{ fontSize:"2.5rem", marginBottom:12 }}>🗑️</div>
          <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"1.2rem", fontWeight:700, color:"#e6edf3", marginBottom:8 }}>Confirm Delete</div>
          <div style={{ fontSize:".82rem", color:"#8b949e", marginBottom:20 }}>{confirmMsg}</div>
          <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
            <Btn sm outline onClick={() => setConfirmCb(null)}>Cancel</Btn>
            <Btn sm danger onClick={() => confirmCb?.()}>🗑️ Delete</Btn>
          </div>
        </div>
      </div>
    );
  }
  // ── KEYBOARD SHORTCUTS ────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); document.querySelector<HTMLInputElement>('[placeholder*="Search"]')?.focus(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") { e.preventDefault(); setAddOpen(true); }
      if (e.key === "Escape") { setPreview(null); setAddOpen(false); setConfirmCb(null); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  const NAV_TABS = [
    { key:"pipeline",  icon:"⊞", label:"Pipeline" },
    { key:"dashboard", icon:"◈", label:"Dashboard" },
    { key:"sprint",    icon:"⚡", label:"Sprint", badge: sprintItems.length },
    { key:"multiply",  icon:"⊕", label:"Multiply" },
    { key:"registry",  icon:"≡", label:"Registry", badge: assets.length },
    { key:"upload",    icon:"↑", label:"Upload" },
    { key:"activity",  icon:"○", label:"Activity", badge: activity.length },
  ];
  return (
    <>
      <style>{CSS}</style>
      <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}} @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {/* HEADER */}
      <header style={{ background:"rgba(13,17,23,.92)", backdropFilter:"blur(20px)", borderBottom:"1px solid #30363d", position:"sticky", top:0, zIndex:200, padding:"0 1.5rem" }}>
        <div style={{ maxWidth:1600, margin:"0 auto", display:"flex", alignItems:"center", gap:14, height:58 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <div style={{ width:32, height:32, background:"#009090", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", boxShadow:"0 0 12px rgba(0,144,144,.35)", fontSize:13, color:"white" }}>
              ⚡<div style={{ position:"absolute", top:-3, right:-3, width:9, height:9, background:"#D4A843", borderRadius:"50%", border:"2px solid #0d1117" }} />
            </div>
            <div>
              <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:".95rem", fontWeight:700, color:"#e6edf3" }}>Muscle-Meta Matrix™</div>
              <div style={{ fontSize:".58rem", fontWeight:600, color:"#009090", letterSpacing:".12em", textTransform:"uppercase" as const }}>Command Center v3</div>
            </div>
          </div>
          <nav style={{ display:"flex", gap:2, flex:1, overflowX:"auto" as const }}>
            {NAV_TABS.map(({ key, icon, label, badge }) => (
              <button key={key} onClick={() => setTab(key as any)} style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"6px 13px", border:"none",
                background: tab===key ? "#009090" : "none",
                cursor:"pointer", borderRadius:7,
                fontFamily:"Outfit,sans-serif", fontSize:".78rem", fontWeight:500,
                color: tab===key ? "white" : "#8b949e",
                boxShadow: tab===key ? "0 0 16px rgba(0,144,144,.3)" : "none",
                transition:"all .2s", whiteSpace:"nowrap" as const,
              }}>
                {icon} {label}
                {badge != null && badge > 0 && (
                  <span style={{ background: tab===key ? "rgba(255,255,255,.25)" : "#E8734A", color:"white", borderRadius:20, padding:"1px 6px", fontSize:".62rem", fontWeight:700 }}>{badge}</span>
                )}
              </button>
            ))}
          </nav>
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <Btn sm outline onClick={exportCSV}>CSV</Btn>
            <Btn sm outline onClick={exportJSON}>JSON</Btn>
            <Btn sm teal onClick={() => { setEditAsset(null); setSpawnParent(null); setAddOpen(true); }}>+ New Asset</Btn>
          </div>
        </div>
      </header>
      <main style={{ maxWidth:1600, margin:"0 auto", padding:"1.4rem 1.5rem" }}>
        {tab === "pipeline"  && <PipelineTab />}
        {tab === "dashboard" && <DashboardTab />}
        {tab === "sprint"    && <SprintTab />}
        {tab === "multiply"  && <MultiplyTab />}
        {tab === "registry"  && <RegistryTab />}
        {tab === "upload"    && <UploadTab />}
        {tab === "activity"  && <ActivityTab />}
      </main>
      <PreviewPanel />
      <AddEditModal />
      <ConfirmModal />
      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", bottom:"1.5rem", right:"1.5rem",
          background:"#21262d", color:"#e6edf3", padding:"10px 16px",
          borderRadius:8, fontSize:".8rem", fontWeight:500,
          boxShadow:"0 8px 32px rgba(0,0,0,.5)", zIndex:9000,
          display:"flex", alignItems:"center", gap:8,
          border:"1px solid #30363d", maxWidth:360,
          animation:"fadeUp .3s ease",
        }}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
