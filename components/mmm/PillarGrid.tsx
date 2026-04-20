'use client';

import { useState } from 'react';
import { PILLARS, type Pillar } from './data';
import { PillarIcon } from './PillarIcon';

interface PillarCardProps {
  pillar:   Pillar;
  expanded: boolean;
  hovered:  boolean;
  onToggle: () => void;
  onHover:  (v: boolean) => void;
}

function PillarCard({ pillar, expanded, hovered, onToggle, onHover }: PillarCardProps) {
  const active = expanded || hovered;
  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        background:   '#fff',
        borderRadius: 16,
        overflow:     'hidden',
        border:       `1.5px solid ${expanded ? 'transparent' : '#e8e6e1'}`,
        boxShadow:    expanded
          ? '0 12px 40px rgba(26,35,50,0.10)'
          : hovered ? '0 6px 20px rgba(26,35,50,0.07)' : 'none',
        transform:   active ? 'translateY(-4px)' : 'none',
        transition:  'all 280ms cubic-bezier(0.16,1,0.3,1)',
        cursor:      'pointer',
      }}
    >
      <div style={{ height: 4, background: pillar.color }}/>
      <div style={{ padding: '26px 26px 22px' }}>
        <div style={{
          width: 54, height: 54, borderRadius: 12,
          background: active ? pillar.color : pillar.muted,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 18, transition: 'all 240ms ease',
        }}>
          <PillarIcon kind={pillar.iconKind} color={active ? '#fff' : pillar.color} size={26}/>
        </div>

        <div style={{
          fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase', color: pillar.colorDark,
          marginBottom: 6, display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: pillar.color }}/>
          {pillar.label}
        </div>

        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 700,
          color: '#1a2332', marginBottom: 10, lineHeight: 1.2,
        }}>
          {pillar.name}
        </h3>

        <p style={{
          fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#6b7b8f',
          lineHeight: 1.6, marginBottom: 16,
        }}>
          {pillar.desc}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {pillar.tags.map(t => (
            <span key={t} style={{
              background: active ? pillar.muted : '#f7f6f3',
              border: `1px solid ${active ? 'transparent' : '#e8e6e1'}`,
              borderRadius: 20, padding: '4px 10px',
              fontFamily: 'Outfit, sans-serif', fontSize: 11, fontWeight: 500,
              color: active ? pillar.colorDark : '#344256',
              transition: 'all 200ms ease',
            }}>
              {t}
            </span>
          ))}
        </div>

        <div style={{
          fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600,
          color: pillar.color, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {expanded ? 'Collapse' : `Explore ${pillar.name}`}
          <span style={{
            transform: expanded ? 'rotate(90deg)' : 'none',
            transition: 'transform 200ms ease',
            display: 'inline-block',
          }}>
            →
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ background: '#f7f6f3', padding: '18px 26px 22px', borderTop: '1px solid #e8e6e1' }}>
          <div style={{
            fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6b7b8f', marginBottom: 10,
          }}>
            Clinical Priority · {pillar.problem}
          </div>
          {[
            `Primary assessment maps to ${pillar.name} clinical priority score.`,
            'Protocol delivery triggered by your GMMBB axis result.',
            'Tools and calculators available inside the Inner Circle resource library.',
          ].map((item, j) => (
            <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <span style={{ color: pillar.color, fontSize: 14, flexShrink: 0, lineHeight: 1.5 }}>◆</span>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#344256', lineHeight: 1.55 }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface PillarGridProps {
  columns?: number;
}

export function PillarGrid({ columns = 2 }: PillarGridProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [hovered,  setHovered]  = useState<number | null>(null);

  return (
    <div className="mmm-pillar-grid" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 18,
    }}>
      {PILLARS.map((p, i) => (
        <PillarCard
          key={p.id}
          pillar={p}
          expanded={expanded === i}
          hovered={hovered === i}
          onHover={(v) => setHovered(v ? i : null)}
          onToggle={() => setExpanded(expanded === i ? null : i)}
        />
      ))}
      <style>{`
        @media (max-width: 768px) {
          .mmm-pillar-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
