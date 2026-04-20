'use client';

import { useEffect, useRef, useState } from 'react';
import { PILLARS_4, tierForScore4, polar4 } from './data';
import { PillarIcon } from './PillarIcon';

interface FourPillarMatrixProps {
  startAnimated?: boolean;
}

export function FourPillarMatrix({ startAnimated = true }: FourPillarMatrixProps) {
  const [mode,     setMode]     = useState<'profile' | 'interactive' | 'optimal'>('profile');
  const [hovered,  setHovered]  = useState<number | null>(null);
  const [animated, setAnimated] = useState(!startAnimated);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startAnimated) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setAnimated(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { setTimeout(() => setAnimated(true), 150); io.disconnect(); } });
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [startAnimated]);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(t);
  }, [mode]);

  const CX = 260, CY = 260, MAX_R = 180;
  const pillars    = PILLARS_4;
  const composite  = Math.round(pillars.reduce((s, p) => s + p.score, 0) / pillars.length);
  const tier       = tierForScore4(composite);

  const activeScores = mode === 'optimal'
    ? pillars.map(p => p.optimal)
    : pillars.map(p => p.score);

  const dataPoints = pillars.map((p, i) => polar4(CX, CY, p.angle, MAX_R * (activeScores[i] / 100)));
  const polyPoints = dataPoints.map(pt => `${pt.x},${pt.y}`).join(' ');

  const userPoints = pillars.map(p => {
    const pt = polar4(CX, CY, p.angle, MAX_R * (p.score / 100));
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const sorted = [...pillars].sort((a, b) => b.score - a.score);
  const topP   = sorted[0];
  const botP   = sorted[sorted.length - 1];

  const hoveredPillar = hovered !== null ? pillars[hovered] : null;

  const tabs = [
    { id: 'profile'     as const, label: 'Profile View' },
    { id: 'interactive' as const, label: 'Interactive' },
    { id: 'optimal'     as const, label: 'Optimal Comparison' },
  ];

  return (
    <div ref={ref} className="mmm-4pm">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 18px', borderRadius: 999,
          background: '#fff', border: '1px solid #e8e6e1',
          boxShadow: '0 1px 2px rgba(26,35,50,0.04)', marginBottom: 22,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#009090' }}/>
          <span style={{
            fontFamily: 'Outfit, sans-serif', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1a2332',
          }}>
            Muscle-Meta Matrix™ — Clinical Intelligence
          </span>
        </div>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(36px, 4.5vw, 54px)',
          fontWeight: 700, color: '#1a2332', letterSpacing: '-0.02em', lineHeight: 1.08, marginBottom: 14,
        }}>
          The 4-Pillar <em style={{ fontStyle: 'italic', color: '#009090' }}>Active Longevity</em> Matrix
        </h2>
        <p style={{
          fontFamily: 'Outfit, sans-serif', fontSize: 16, color: '#344256',
          lineHeight: 1.6, maxWidth: 560, margin: '0 auto',
        }}>
          A four-dimensional physiological profile spanning 12 clinical categories —
          your complete active aging intelligence map.
        </p>

        {/* Mode tabs */}
        <div style={{
          display: 'inline-flex', gap: 4, marginTop: 28,
          background: '#fff', borderRadius: 999, padding: 4,
          border: '1px solid #e8e6e1', boxShadow: '0 1px 2px rgba(26,35,50,0.04)',
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setMode(t.id)} style={{
              fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600,
              padding: '10px 20px', borderRadius: 999, cursor: 'pointer', border: 'none',
              background: mode === t.id ? '#1a2332' : 'transparent',
              color:      mode === t.id ? '#fff' : '#344256',
              transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pillar color stripe */}
      <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 28, gap: 3 }}>
        {pillars.map((p, i) => (
          <div key={p.id} style={{
            flex: 1, background: p.color, borderRadius: 2, transition: 'opacity 200ms',
            opacity: (hovered !== null && hovered !== i) ? 0.25 : 0.9,
          }}/>
        ))}
      </div>

      {/* Radar + side panel */}
      <div className="mmm-4pm-grid" style={{
        display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 0,
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        border: '1px solid #e8e6e1', boxShadow: '0 12px 40px rgba(26,35,50,0.06)',
      }}>
        {/* Radar */}
        <div style={{
          padding: '40px 20px 20px',
          background: 'radial-gradient(ellipse at center, rgba(0,144,144,0.03), transparent 70%)',
        }}>
          <svg viewBox="0 0 520 520" width="100%" style={{ maxWidth: 520, overflow: 'visible' }}
            aria-label="4-Pillar radar chart">
            <defs>
              <radialGradient id="fpmFill" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#009090" stopOpacity="0.18"/>
                <stop offset="60%"  stopColor="#009090" stopOpacity="0.08"/>
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.04"/>
              </radialGradient>
              <radialGradient id="fpmOptimal" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#D4AF37" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.02"/>
              </radialGradient>
              <filter id="fpmGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Concentric diamonds */}
            {[0.25, 0.5, 0.75, 1].map(s => {
              const pts = pillars.map(p => {
                const pt = polar4(CX, CY, p.angle, MAX_R * s);
                return `${pt.x},${pt.y}`;
              }).join(' ');
              return (
                <polygon key={s} points={pts} fill="none"
                  stroke={s === 1 ? 'rgba(0,144,144,0.2)' : '#ecebe7'}
                  strokeWidth={s === 1 ? 1.2 : 1}
                  strokeDasharray={s < 1 ? '3 5' : undefined}/>
              );
            })}

            {/* Axis spokes */}
            {pillars.map((p, i) => {
              const pt = polar4(CX, CY, p.angle, MAX_R);
              return (
                <line key={i} x1={CX} y1={CY} x2={pt.x} y2={pt.y}
                  stroke={hovered === i ? p.color : '#ecebe7'}
                  strokeWidth={hovered === i ? 1.5 : 1}
                  strokeDasharray="3 5"
                  style={{ transition: 'stroke 200ms' }}/>
              );
            })}

            {/* Ghost polygon in optimal mode */}
            {mode === 'optimal' && (
              <polygon points={userPoints}
                fill="none" stroke="#6b7b8f" strokeWidth={1.5}
                strokeDasharray="6 4"
                style={{
                  transformOrigin: `${CX}px ${CY}px`,
                  transform:  animated ? 'scale(1)' : 'scale(0)',
                  transition: 'transform 900ms cubic-bezier(0.16,1,0.3,1) 200ms',
                  opacity: animated ? 0.5 : 0,
                }}/>
            )}

            {/* Data polygon */}
            <polygon points={polyPoints}
              fill={mode === 'optimal' ? 'url(#fpmOptimal)' : 'url(#fpmFill)'}
              stroke={mode === 'optimal' ? '#D4AF37' : '#009090'}
              strokeWidth={2} strokeLinejoin="round"
              style={{
                transformOrigin: `${CX}px ${CY}px`,
                transform:  animated ? 'scale(1)' : 'scale(0)',
                transition: 'transform 1s cubic-bezier(0.16,1,0.3,1)',
                opacity: animated ? 1 : 0,
              }}/>

            {/* Data points + labels */}
            {pillars.map((p, i) => {
              const v      = activeScores[i];
              const pt     = polar4(CX, CY, p.angle, MAX_R * (v / 100));
              const isHov  = hovered === i;
              const lblPos = polar4(CX, CY, p.angle, MAX_R * (v / 100) + 18);
              return (
                <g key={i}
                   onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                   style={{ cursor: 'pointer', opacity: animated ? 1 : 0, transition: 'opacity 500ms ease 600ms' }}>
                  <line x1={CX} y1={CY} x2={pt.x} y2={pt.y}
                    stroke={p.color} strokeWidth={isHov ? 2 : 1.2}
                    opacity={isHov ? 0.85 : 0.5} style={{ transition: 'all 200ms' }}/>
                  <circle cx={pt.x} cy={pt.y} r={isHov ? 11 : 7}
                    fill="#ffffff" stroke={p.color} strokeWidth={2.5}
                    filter={isHov ? 'url(#fpmGlow)' : undefined}
                    style={{ transition: 'r 200ms ease' }}/>
                  <circle cx={pt.x} cy={pt.y} r={isHov ? 4.5 : 3} fill={p.color}
                    style={{ transition: 'r 200ms ease' }}/>
                  <text x={lblPos.x} y={lblPos.y + 3} textAnchor="middle"
                    fontFamily="Outfit, sans-serif" fontSize={11} fontWeight="700"
                    fill={isHov ? p.colorDark : '#6b7b8f'} style={{ transition: 'fill 200ms' }}>
                    {v}
                  </text>
                </g>
              );
            })}

            {/* Axis letter bubbles */}
            {pillars.map((p, i) => {
              const lblPos = polar4(CX, CY, p.angle, MAX_R + 58);
              const isHov  = hovered === i;
              return (
                <g key={i}
                   onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                   style={{ cursor: 'pointer' }}>
                  <circle cx={lblPos.x} cy={lblPos.y} r={26}
                    fill={isHov ? p.muted : '#ffffff'}
                    stroke={isHov ? p.color : '#e8e6e1'} strokeWidth={1.5}
                    style={{ transition: 'all 200ms' }}/>
                  <text x={lblPos.x} y={lblPos.y - 2} textAnchor="middle" dominantBaseline="middle"
                    fontFamily="Cormorant Garamond, serif" fontWeight="700" fontSize={22}
                    fill={isHov ? p.colorDark : '#1a2332'} style={{ transition: 'fill 200ms' }}>
                    {p.letter}
                  </text>
                  <text x={lblPos.x} y={lblPos.y + 14} textAnchor="middle" dominantBaseline="middle"
                    fontFamily="Outfit, sans-serif" fontSize={7.5} fontWeight="700"
                    fill="#6b7b8f" letterSpacing="1.2">
                    {p.short}
                  </text>
                </g>
              );
            })}

            {/* Center composite badge */}
            <g>
              <circle cx={CX} cy={CY} r={42} fill="#ffffff" stroke="#e8e6e1" strokeWidth={1.5}/>
              <circle cx={CX} cy={CY} r={38} fill="none" stroke="#D4AF37" strokeWidth={1}
                strokeDasharray="2 3" opacity="0.6"/>
              <text x={CX} y={CY - 4} textAnchor="middle" dominantBaseline="middle"
                fontFamily="Cormorant Garamond, serif" fontWeight="700" fontSize={28} fill="#1a2332">
                {mode === 'optimal'
                  ? Math.round(pillars.reduce((s, p) => s + p.optimal, 0) / pillars.length)
                  : composite}
              </text>
              <text x={CX} y={CY + 14} textAnchor="middle" dominantBaseline="middle"
                fontFamily="Outfit, sans-serif" fontSize={7.5} fontWeight="700"
                fill="#009090" letterSpacing="1.2">
                MATRIX SCORE
              </text>
            </g>
          </svg>

          {/* Score summary strip */}
          <div style={{
            marginTop: 12, padding: '18px 22px', borderRadius: 14,
            background: '#f7f6f3', border: '1px solid #ecebe7',
            display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 700,
                color: '#1a2332', lineHeight: 1,
              }}>
                {composite}<span style={{ color: '#6b7b8f', fontSize: 18 }}>/100</span>
              </div>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontSize: 9.5, fontWeight: 700,
                color: '#6b7b8f', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4,
              }}>
                Overall Matrix Score
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: tier.color }}/>
                <span style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: 10.5, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase', color: tier.color,
                }}>
                  Tier {tier.n} — {tier.label}
                </span>
              </div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#344256', lineHeight: 1.5 }}>
                Strong in <strong style={{ color: topP.colorDark }}>{topP.name.split(' & ')[0]}</strong> with
                priority signals in <strong style={{ color: botP.colorDark }}>{botP.name}</strong>.
              </div>
              <div style={{ display: 'flex', gap: 2, marginTop: 10, height: 4, borderRadius: 2, overflow: 'hidden' }}>
                {[
                  { c: '#dc2626', active: tier.n === 5 },
                  { c: '#f97316', active: tier.n === 4 },
                  { c: '#D4AF37', active: tier.n === 3 },
                  { c: '#009090', active: tier.n === 2 },
                  { c: '#009090', active: tier.n === 1 },
                ].map((t, i) => (
                  <div key={i} style={{ flex: 1, background: t.c, opacity: t.active ? 1 : 0.22, transition: 'opacity 200ms' }}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div style={{
          background: '#fafaf8', borderLeft: '1px solid #ecebe7',
          padding: '40px 36px', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b7b8f', marginBottom: 10,
          }}>
            {hoveredPillar ? `${hoveredPillar.label} — Detail` : 'Hover a pillar to explore'}
          </div>
          <h3 style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 700,
            color: '#1a2332', marginBottom: 14, lineHeight: 1.2,
          }}>
            {hoveredPillar ? hoveredPillar.name : '4-Pillar Framework'}
          </h3>
          <div style={{
            height: 2, width: hoveredPillar ? 48 : 30,
            background: hoveredPillar ? hoveredPillar.color : '#009090',
            borderRadius: 1, marginBottom: 18, transition: 'all 240ms',
          }}/>
          <p style={{
            fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#344256',
            lineHeight: 1.65, marginBottom: 24, minHeight: 130,
          }}>
            {hoveredPillar
              ? hoveredPillar.blurb
              : 'Select a pillar axis to view its physiological description, clinical categories, and current sub-scores.'}
          </p>

          {hoveredPillar && (
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: hoveredPillar.colorDark, marginBottom: 16,
              }}>
                {hoveredPillar.short} — Clinical Categories
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {hoveredPillar.categories.map((c, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: hoveredPillar.color }}/>
                      <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13.5, color: '#1a2332', fontWeight: 500 }}>
                        {c.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 60, height: 3, background: '#ecebe7', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${c.score}%`,
                          background: hoveredPillar.color, borderRadius: 2,
                          transition: 'width 600ms cubic-bezier(0.16,1,0.3,1)',
                        }}/>
                      </div>
                      <span style={{
                        fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700,
                        color: '#1a2332', minWidth: 26, textAlign: 'right',
                      }}>
                        {c.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            marginTop: 'auto', paddingTop: 24, borderTop: '1px solid #ecebe7',
            fontFamily: 'Outfit, sans-serif', fontSize: 11, color: '#6b7b8f', lineHeight: 1.5,
          }}>
            ← Hover a pillar axis on the radar or click a card below.
          </div>
        </div>
      </div>

      {/* Pillar cards */}
      <div className="mmm-4pm-cards" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 16,
      }}>
        {pillars.map((p, i) => {
          const isHov = hovered === i;
          const t     = tierForScore4(p.score);
          return (
            <div key={p.id}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{
                background:  '#fff',
                borderRadius: 14, padding: '18px 18px 16px',
                border:    `1px solid ${isHov ? p.color : '#e8e6e1'}`,
                borderTop: `3px solid ${p.color}`,
                boxShadow: isHov ? `0 10px 30px ${p.color}25` : '0 1px 2px rgba(26,35,50,0.04)',
                transform: isHov ? 'translateY(-3px)' : 'none',
                cursor:    'pointer',
                transition: 'all 240ms cubic-bezier(0.16,1,0.3,1)',
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: p.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <PillarIcon kind={p.iconKind} color={p.color} size={18}/>
              </div>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontSize: 9.5, fontWeight: 700,
                color: p.colorDark, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4,
              }}>
                {p.label}
              </div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 700,
                color: '#1a2332', lineHeight: 1.2, marginBottom: 14,
              }}>
                {p.name}
              </div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: 42, fontWeight: 700,
                color: p.colorDark, lineHeight: 1, marginBottom: 10,
              }}>
                {p.score}
              </div>
              <div style={{ height: 3, background: '#ecebe7', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{
                  height: '100%', width: animated ? `${p.score}%` : 0,
                  background: p.color, borderRadius: 2,
                  transition: `width 1s cubic-bezier(0.16,1,0.3,1) ${300 + i * 80}ms`,
                }}/>
              </div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: '#6b7b8f', fontWeight: 500 }}>
                Tier {t.n} — {t.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom banner */}
      <div style={{
        marginTop: 16, padding: '22px 28px', borderRadius: 14,
        background: '#1a2332', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic',
          color: '#fff', lineHeight: 1.4, maxWidth: 420,
        }}>
          &ldquo;Every assessment maps to a pillar. Every pillar maps to{' '}
          <strong style={{ color: '#D4AF37', fontWeight: 600 }}>a clinical intervention.</strong>&rdquo;
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: 'rgba(212,175,55,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#D4AF37" stroke="none">
                <path d="M13 2 L4 14 L11 14 L10 22 L20 9 L13 9 Z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                Muscle-Meta Matrix™
              </div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 9, fontWeight: 700, color: '#D4AF37', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>
                Small Steps. Exponential Gains.
              </div>
            </div>
          </div>
          <button className="mmm-btn mmm-btn-primary" style={{ padding: '12px 22px', fontSize: 13 }}>
            Take the Full Assessment →
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .mmm-4pm-grid { grid-template-columns: 1fr !important; }
          .mmm-4pm-grid > div:last-child { border-left: none !important; border-top: 1px solid #ecebe7; }
          .mmm-4pm-cards { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 520px) {
          .mmm-4pm-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
