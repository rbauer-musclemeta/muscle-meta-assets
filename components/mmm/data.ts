// =============================================================================
// MUSCLE-META MATRIX™ — SHARED BRAND DATA
// =============================================================================

export const BRAND = {
  teal:        '#009090',
  tealDark:    '#006b6b',
  tealLight:   '#00b3b3',
  tealMuted:   '#e6f5f5',
  tealTint:    '#f0f9f9',
  gold:        '#D4AF37',
  goldDark:    '#B5952F',
  goldLight:   '#e3c56a',
  goldMuted:   '#faf6e8',
  purple:      '#7c3aed',
  purpleDark:  '#6d28d9',
  purpleMuted: '#f3f0fd',
  green:       '#16a34a',
  greenDark:   '#15803d',
  greenMuted:  '#f0fdf4',
  ink:         '#1a2332',
  inkSoft:     '#344256',
  inkMuted:    '#6b7b8f',
  inkFaint:    '#a8b3c2',
  surface:     '#f7f6f3',
  surfaceTint: '#fdfcfa',
  border:      '#e8e6e1',
  white:       '#ffffff',
} as const;

// ----- GMMBB axes (pentagon) -------------------------------------------------

export type AxisName = 'Gut' | 'Muscle' | 'Metabolic' | 'Brain' | 'Bone';

export interface Axis {
  letter:   string;
  name:     AxisName;
  fullName: string;
  score:    number;
  angle:    number;
  desc:     string;
}

export const AXES: Axis[] = [
  { letter: 'G', name: 'Gut',       fullName: 'Gut Health Axis',        score: 58, angle:  -90,
    desc: 'Microbiome diversity, GI inflammation, nutrient absorption efficiency.' },
  { letter: 'M', name: 'Muscle',    fullName: 'Muscle Integrity Axis',  score: 81, angle:  -18,
    desc: 'Lean mass retention, fiber-type composition, anabolic sensitivity.' },
  { letter: 'M', name: 'Metabolic', fullName: 'Metabolic Function Axis',score: 74, angle:   54,
    desc: 'Insulin sensitivity, mitochondrial output, metabolic flexibility.' },
  { letter: 'B', name: 'Brain',     fullName: 'Brain Health Axis',      score: 79, angle:  126,
    desc: 'Cognitive reserve, neuroplasticity markers, dual-task processing.' },
  { letter: 'B', name: 'Bone',      fullName: 'Bone-Balance Axis',      score: 62, angle:  198,
    desc: 'Bone mineral density, trabecular integrity, force absorption capacity.' },
];

// ----- Pillars ---------------------------------------------------------------

export type IconKind = 'force' | 'cellular' | 'wave' | 'neural';

export interface Pillar {
  id:         string;
  label:      string;
  name:       string;
  color:      string;
  colorDark:  string;
  muted:      string;
  problem:    string;
  desc:       string;
  tags:       string[];
  iconKind:   IconKind;
}

export const PILLARS: Pillar[] = [
  {
    id: 'exercise', label: 'Pillar One', name: 'Exercise & Mobility',
    color: BRAND.teal, colorDark: BRAND.tealDark, muted: BRAND.tealMuted,
    problem: 'Sarcopenia, mobility loss, force decline',
    desc: 'Lean mass preservation, neuromuscular coordination, and force absorption capacity.',
    tags: ['Sarcopenia', 'VILPA Protocol', 'Force Absorption', 'VO₂ Max'],
    iconKind: 'force',
  },
  {
    id: 'nutrition', label: 'Pillar Two', name: 'Nutrition & Metabolism',
    color: BRAND.gold, colorDark: BRAND.goldDark, muted: BRAND.goldMuted,
    problem: 'Metabolic inflexibility, GLP-1 muscle risk',
    desc: 'Metabolic flexibility, mitochondrial output, and GLP-1 interaction — your cellular engine.',
    tags: ['Metabolic Flex', 'GLP-1 Risk', 'Gut Microbiome', 'Mito Output'],
    iconKind: 'cellular',
  },
  {
    id: 'recovery', label: 'Pillar Three', name: 'Recovery & Stress',
    color: BRAND.purple, colorDark: BRAND.purpleDark, muted: BRAND.purpleMuted,
    problem: 'Catabolic cascade, cortisol dysregulation',
    desc: 'Cortisol dysregulation, catabolic cascade management, and restorative physiology.',
    tags: ['Catabolic Risk', 'Cortisol Load', 'HRV Baseline', 'Sleep Quality'],
    iconKind: 'wave',
  },
  {
    id: 'balance', label: 'Pillar Four', name: 'Balance & Brain Health',
    color: BRAND.green, colorDark: BRAND.greenDark, muted: BRAND.greenMuted,
    problem: 'Fall risk, cognitive decline, dual-task deficit',
    desc: 'Dual-task processing, bone-balance integration, and cognitive reserve.',
    tags: ['Fall Risk', 'Dual-Task', 'Bone Density', 'Cognitive Reserve'],
    iconKind: 'neural',
  },
];

// ----- Risk tiers ------------------------------------------------------------

export interface Tier {
  n:     number;
  label: string;
  color: string;
  muted: string;
  band:  string;
  copy:  string;
}

export const TIERS: Tier[] = [
  { n: 1, label: 'Optimized',  color: BRAND.teal,    muted: BRAND.tealMuted,  band: '85–100', copy: 'Top-decile profile. Maintenance protocols only.' },
  { n: 2, label: 'Functional', color: '#3b82f6',     muted: '#eff6ff',        band: '70–84',  copy: 'Strong foundation. Targeted optimization wins available.' },
  { n: 3, label: 'Declining',  color: '#f59e0b',     muted: '#fef3c7',        band: '55–69',  copy: 'Measurable signals of age-related drift. Highest-leverage intervention window.' },
  { n: 4, label: 'At Risk',    color: '#f97316',     muted: '#ffedd5',        band: '40–54',  copy: 'Multiple systems under strain. Clinical protocol indicated.' },
  { n: 5, label: 'Critical',   color: '#dc2626',     muted: '#fee2e2',        band: '< 40',   copy: 'Immediate clinical consultation recommended.' },
];

export function tierForScore(score: number): Tier {
  if (score >= 85) return TIERS[0];
  if (score >= 70) return TIERS[1];
  if (score >= 55) return TIERS[2];
  if (score >= 40) return TIERS[3];
  return TIERS[4];
}

// ----- Pentagon math ---------------------------------------------------------

export const toRad = (d: number) => (d * Math.PI) / 180;

export function polar(cx: number, cy: number, angle: number, r: number) {
  return {
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  };
}

// ----- 4-Pillar Matrix extended data ----------------------------------------

export interface Category {
  name:  string;
  score: number;
}

export interface Pillar4 extends Pillar {
  letter:     string;
  short:      string;
  score:      number;
  optimal:    number;
  angle:      number;
  blurb:      string;
  categories: Category[];
}

export const PILLARS_4: Pillar4[] = [
  {
    id: 'exercise', letter: 'E', short: 'EXERCISE',
    label: 'Pillar One', name: 'Exercise & Mobility',
    color: '#009090', colorDark: '#006b6b', muted: '#e6f5f5',
    problem: 'Sarcopenia, mobility loss, force decline',
    desc: 'Lean mass preservation, neuromuscular coordination, and force absorption capacity.',
    tags: ['Sarcopenia', 'VILPA Protocol', 'Force Absorption', 'VO₂ Max'],
    iconKind: 'force',
    score: 78, optimal: 90, angle: -90,
    blurb: 'Lean mass preservation, neuromuscular coordination, VILPA protocol readiness, and force absorption capacity — the physiological foundation of physical independence after 45.',
    categories: [
      { name: 'Joint Health',              score: 82 },
      { name: 'Functional Independence',   score: 79 },
      { name: 'Strength & Endurance',      score: 73 },
    ],
  },
  {
    id: 'nutrition', letter: 'N', short: 'NUTRITION',
    label: 'Pillar Two', name: 'Nutrition & Metabolism',
    color: '#D4AF37', colorDark: '#B5952F', muted: '#faf6e8',
    problem: 'Metabolic inflexibility, GLP-1 muscle risk',
    desc: 'Metabolic flexibility, mitochondrial output, and GLP-1 interaction — your cellular engine.',
    tags: ['Metabolic Flex', 'GLP-1 Risk', 'Gut Microbiome', 'Mito Output'],
    iconKind: 'cellular',
    score: 64, optimal: 88, angle: 0,
    blurb: 'Metabolic flexibility, mitochondrial output, gut microbiome diversity, and GLP-1 interaction — the cellular engine that fuels every other pillar.',
    categories: [
      { name: 'Metabolic Flexibility', score: 68 },
      { name: 'Gut Microbiome',        score: 61 },
      { name: 'Nutrient Density',      score: 63 },
    ],
  },
  {
    id: 'recovery', letter: 'R', short: 'RECOVERY',
    label: 'Pillar Three', name: 'Recovery & Stress',
    color: '#7c3aed', colorDark: '#6d28d9', muted: '#f3f0fd',
    problem: 'Catabolic cascade, cortisol dysregulation',
    desc: 'Cortisol dysregulation, catabolic cascade management, and restorative physiology.',
    tags: ['Catabolic Risk', 'Cortisol Load', 'HRV Baseline', 'Sleep Quality'],
    iconKind: 'wave',
    score: 61, optimal: 86, angle: 90,
    blurb: 'Cortisol regulation, sleep architecture, HRV baseline, and catabolic cascade management — the restorative physiology that makes adaptation possible.',
    categories: [
      { name: 'Sleep Quality',       score: 58 },
      { name: 'HRV Baseline',        score: 64 },
      { name: 'Cortisol Regulation', score: 61 },
    ],
  },
  {
    id: 'balance', letter: 'B', short: 'BALANCE',
    label: 'Pillar Four', name: 'Balance & Brain Health',
    color: '#16a34a', colorDark: '#15803d', muted: '#f0fdf4',
    problem: 'Fall risk, cognitive decline, dual-task deficit',
    desc: 'Dual-task processing, bone-balance integration, and cognitive reserve.',
    tags: ['Fall Risk', 'Dual-Task', 'Bone Density', 'Cognitive Reserve'],
    iconKind: 'neural',
    score: 82, optimal: 92, angle: 180,
    blurb: 'Dual-task processing, bone-balance integration, cognitive reserve, and vestibular integrity — the single strongest predictor of independent decades ahead.',
    categories: [
      { name: 'Dual-Task Processing', score: 85 },
      { name: 'Bone Density',         score: 78 },
      { name: 'Cognitive Reserve',    score: 83 },
    ],
  },
];

export function tierForScore4(score: number): { n: number; label: string; color: string } {
  if (score >= 85) return { n: 1, label: 'Optimized',  color: '#009090' };
  if (score >= 70) return { n: 2, label: 'Functional', color: '#009090' };
  if (score >= 55) return { n: 3, label: 'Declining',  color: '#D4AF37' };
  if (score >= 40) return { n: 4, label: 'At Risk',    color: '#f97316' };
  return               { n: 5, label: 'Critical',      color: '#dc2626' };
}

export function polar4(cx: number, cy: number, angle: number, r: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
