'use client';

import { useEffect, useRef, useState } from 'react';
import { AXES, tierForScore, polar, type Axis } from './data';

interface GMMBBPentagonProps {
  size?:          number;
  showCards?:     boolean;
  startAnimated?: boolean;
  scores?:        Partial<Record<string, number>> | null;
  titleCard?:     React.ReactNode;
  externalHover?: number | null;
  onHover?:       (i: number | null) => void;
}

export function GMMBBPentagon({
  size = 400,
  showCards = true,
  startAnimated = true,
  scores = null,
  titleCard = null,
  externalHover = null,
  onHover,
}: GMMBBPentagonProps) {
  const axes: Axis[] = scores
    ? AXES.map(a => ({ ...a, score: scores[a.name] ?? a.score }))
    : AXES;

  const [animated,    setAnimated]    = useState(!startAnimated);
  const [localHover,  setLocalHover]  = useState<number | null>(null);
  const hovered = (externalHover !== null && externalHover !== undefined) ? externalHover : localHover;

  const setHover = (i: number | null) => {
    onHover?.(i);
    setLocalHover(i);
  };

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startAnimated) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setAnimated(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { setTimeout(() => setAnimated(true), 200); io.disconnect(); } });
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [startAnimated]);

  const CX = 200, CY = 200, MAX_R = 130;
  const dataPoints  = axes.map(a => polar(CX, CY, a.angle, MAX_R * (a.score / 100)));
  const polyPoints  = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
  const composite   = Math.round(axes.reduce((s, a) => s + a.score, 0) / axes.length);
  const tier        = tierForScore(composite);

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%' }}>
      {titleCard}

      <svg viewBox="0 0 400 420" width="100%" style={{ maxWidth: size, overflow: 'visible' }} aria-label="GMMBB five-axis radar">
        <defs>
          <radialGradient id="pentFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#009090" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#009090" stopOpacity="0.05"/>
          </radialGradient>
          <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Concentric pentagons */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(s => {
          const pts = axes.map(a => { const p = polar(CX, CY, a.angle, MAX_R * s); return `${p.x},${p.y}`; }).join(' ');
          return (
            <polygon key={s} points={pts} fill="none"
              stroke={s === 1 ? 'rgba(0,144,144,0.28)' : '#e8e6e1'} strokeWidth={1}/>
          );
        })}

        {/* Axis spokes */}
        {axes.map((a, i) => {
          const p = polar(CX, CY, a.angle, MAX_R);
          return (
            <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y}
              stroke="#e8e6e1" strokeWidth={1} strokeDasharray="3 4"/>
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polyPoints}
          fill="url(#pentFill)" stroke="#009090" strokeWidth={2} strokeLinejoin="round"
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform:  animated ? 'scale(1)' : 'scale(0)',
            transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1)',
            opacity: animated ? 1 : 0,
          }}
        />

        {/* Data points */}
        {axes.map((a, i) => {
          const p       = polar(CX, CY, a.angle, MAX_R * (a.score / 100));
          const isHover = hovered === i;
          return (
            <g key={i}
               style={{ cursor: 'pointer', opacity: animated ? 1 : 0, transition: 'opacity 600ms ease 700ms' }}
               onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <circle cx={p.x} cy={p.y} r={isHover ? 12 : 8}
                fill="#ffffff" stroke="#D4AF37" strokeWidth={2.5}
                filter={isHover ? 'url(#goldGlow)' : undefined}
                style={{ transition: 'r 200ms ease' }}/>
              <circle cx={p.x} cy={p.y} r={isHover ? 5 : 3} fill="#D4AF37"
                style={{ transition: 'r 200ms ease' }}/>
            </g>
          );
        })}

        {/* Axis labels */}
        {axes.map((a, i) => {
          const p       = polar(CX, CY, a.angle, MAX_R + 32);
          const isHover = hovered === i;
          return (
            <g key={i} style={{ cursor: 'pointer' }}
               onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <circle cx={p.x} cy={p.y} r={24}
                fill={isHover ? '#e6f5f5' : '#ffffff'}
                stroke={isHover ? '#009090' : '#e8e6e1'} strokeWidth={1.5}
                style={{ transition: 'all 200ms ease' }}/>
              <text x={p.x} y={p.y - 1} textAnchor="middle" dominantBaseline="middle"
                fontFamily="Cormorant Garamond, serif" fontWeight="700" fontSize={22}
                fill={isHover ? '#009090' : '#1a2332'} style={{ transition: 'fill 200ms ease' }}>
                {a.letter}
              </text>
              <text x={p.x} y={p.y + 14} textAnchor="middle" dominantBaseline="middle"
                fontFamily="Outfit, sans-serif" fontSize={7.5} fontWeight="600"
                fill="#6b7b8f" letterSpacing="1">
                {a.name.toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* Composite badge */}
        <circle cx={CX} cy={CY} r={34} fill="#1a2332"/>
        <circle cx={CX} cy={CY} r={30} fill="none" stroke="#D4AF37" strokeWidth={1.2} strokeDasharray="3 3"/>
        <text x={CX} y={CY - 4} textAnchor="middle" dominantBaseline="middle"
          fontFamily="Cormorant Garamond, serif" fontWeight="700" fontSize={22} fill="#ffffff">
          {composite}
        </text>
        <text x={CX} y={CY + 13} textAnchor="middle" dominantBaseline="middle"
          fontFamily="Outfit, sans-serif" fontSize={7} fontWeight="600" fill="#D4AF37" letterSpacing={1.4}>
          COMPOSITE
        </text>

        {/* Hover tooltip */}
        {hovered !== null && (() => {
          const a     = axes[hovered];
          const p     = polar(CX, CY, a.angle, MAX_R * (a.score / 100));
          const boxW  = 148, boxH = 56;
          const boxX  = p.x < CX ? Math.max(4, p.x - boxW - 14) : Math.min(400 - boxW - 4, p.x + 14);
          const boxY  = Math.max(6, Math.min(p.y - boxH / 2, 420 - boxH - 6));
          return (
            <g pointerEvents="none">
              <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={8} fill="#1a2332" opacity="0.96"/>
              <rect x={boxX} y={boxY} width={3} height={boxH} rx={1.5} fill="#D4AF37"/>
              <text x={boxX + 12} y={boxY + 18}
                fontFamily="Outfit, sans-serif" fontSize={10.5} fontWeight="700"
                fill="#D4AF37" letterSpacing="0.5">
                {a.fullName.toUpperCase()}
              </text>
              <text x={boxX + 12} y={boxY + 36}
                fontFamily="Cormorant Garamond, serif" fontSize={20} fontWeight="700" fill="#ffffff">
                {a.score}
                <tspan fontSize="12" fill="#a8b3c2"> / 100</tspan>
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Axis score cards */}
      {showCards && (
        <div className="gmmbb-cards" style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, width: '100%',
        }}>
          {axes.map((a, i) => {
            const isHover = hovered === i;
            return (
              <div key={i}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                style={{
                  background:  isHover ? '#ffffff' : '#f7f6f3',
                  borderRadius: 12, padding: '14px 8px 12px', textAlign: 'center',
                  border:      `1.5px solid ${isHover ? '#e6f5f5' : '#e8e6e1'}`,
                  borderTop:   `3px solid ${isHover ? '#009090' : 'transparent'}`,
                  boxShadow:   isHover ? '0 6px 22px rgba(0,144,144,0.12)' : 'none',
                  transform:   isHover ? 'translateY(-3px)' : 'none',
                  transition:  'all 240ms cubic-bezier(0.16,1,0.3,1)',
                  cursor:      'pointer',
                }}>
                <div style={{
                  fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 700,
                  color: isHover ? '#009090' : '#1a2332', lineHeight: 1, marginBottom: 2,
                }}>{a.letter}</div>
                <div style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: 8.5, fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6b7b8f', marginBottom: 8,
                }}>{a.name}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 700, color: '#1a2332' }}>
                  {a.score}
                </div>
                <div style={{ height: 3, background: '#e8e6e1', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #009090, #00b3b3)',
                    borderRadius: 2,
                    width: animated ? `${a.score}%` : 0,
                    transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${300 + i * 80}ms`,
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .gmmbb-cards { grid-template-columns: repeat(5, 1fr) !important; gap: 6px !important; }
          .gmmbb-cards > div { padding: 10px 4px 8px !important; }
        }
      `}</style>
    </div>
  );
}
