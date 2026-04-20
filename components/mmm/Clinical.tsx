'use client';

import { useEffect, useRef, useState } from 'react';
import { tierForScore, type Tier } from './data';

// ----- Risk Tier Badge -------------------------------------------------------

interface RiskTierBadgeProps {
  tier: Tier;
  size?: 'sm' | 'md';
}

export function RiskTierBadge({ tier, size = 'md' }: RiskTierBadgeProps) {
  const padding = size === 'sm' ? '4px 12px' : '6px 16px';
  const fs      = size === 'sm' ? 11 : 12;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: tier.muted, color: tier.color,
      borderRadius: 999, padding,
      fontFamily: 'Outfit, sans-serif', fontSize: fs, fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      border: `1px solid ${tier.color}22`,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: tier.color }}/>
      Tier {tier.n} · {tier.label}
    </div>
  );
}

// ----- Clinical Score Card ---------------------------------------------------

interface ClinicalScoreCardProps {
  score:           number;
  label?:          string;
  subtitle?:       string | null;
  size?:           number;
  animateOnMount?: boolean;
}

export function ClinicalScoreCard({
  score = 72,
  label = 'GMMBB Score',
  subtitle = null,
  size = 200,
  animateOnMount = true,
}: ClinicalScoreCardProps) {
  const tier         = tierForScore(score);
  const r            = size / 2 - 10;
  const cx           = size / 2;
  const cy           = size / 2;
  const circumference = 2 * Math.PI * r;

  const [progress, setProgress] = useState(animateOnMount ? 0 : score);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animateOnMount) { setProgress(score); return; }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setProgress(score); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { setTimeout(() => setProgress(score), 150); io.disconnect(); }
      });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [score, animateOnMount]);

  const dashOffset = circumference * (1 - progress / 100);
  const endAngle   = 2 * Math.PI * (progress / 100);

  return (
    <div ref={ref} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8e6e1" strokeWidth="6"/>
          <circle
            cx={cx} cy={cy} r={r} fill="none" stroke="#009090" strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)' }}
          />
          <circle
            cx={cx + r * Math.cos(endAngle)}
            cy={cy + r * Math.sin(endAngle)}
            r="7" fill="#D4AF37" stroke="#fff" strokeWidth="2"
            style={{ opacity: progress > 3 ? 1 : 0, transition: 'opacity 300ms ease 1.2s' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: size * 0.32, fontWeight: 700,
            color: '#1a2332', lineHeight: 1,
          }}>
            {Math.round(progress)}
          </div>
          <div style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: size * 0.055, fontWeight: 600,
            color: '#6b7b8f', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4,
          }}>
            / 100
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b7b8f', marginBottom: 8,
        }}>
          {label}
        </div>
        <RiskTierBadge tier={tier}/>
        {subtitle && (
          <p style={{
            fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#344256',
            marginTop: 12, maxWidth: 280, lineHeight: 1.55,
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ----- Research Callout ------------------------------------------------------

interface ResearchCalloutProps {
  quote:    string;
  citation: string;
}

export function ResearchCallout({ quote, citation }: ResearchCalloutProps) {
  return (
    <div style={{
      background: '#1a2332', borderRadius: 14, padding: '28px 32px',
      borderLeft: '4px solid #D4AF37',
    }}>
      <div style={{
        fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: 12,
      }}>
        Clinical Evidence
      </div>
      <blockquote style={{
        fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
        fontSize: 20, fontWeight: 500, lineHeight: 1.45, color: '#ffffff',
        margin: '0 0 14px',
      }}>
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div style={{
        fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 300,
        color: '#a8b3c2', letterSpacing: '0.02em',
      }}>
        {citation}
      </div>
    </div>
  );
}
