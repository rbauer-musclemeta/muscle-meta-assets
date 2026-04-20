'use client';

interface LogoMarkProps {
  size?: number;
}

export function LogoMark({ size = 32 }: LogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 2" />
      <path
        d="M20 6 L31.9 14.6 L27.4 28.7 L12.6 28.7 L8.1 14.6 Z"
        fill="#009090" fillOpacity="0.12" stroke="#009090" strokeWidth="1.6" strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="3.5" fill="#D4AF37" />
      <circle cx="20" cy="20" r="1.5" fill="#1a2332" />
    </svg>
  );
}

interface LogoLockupProps {
  color?: string;
}

export function LogoLockup({ color = '#1a2332' }: LogoLockupProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <LogoMark size={34} />
      <div style={{ lineHeight: 1 }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 20,
          fontWeight: 700,
          color,
          letterSpacing: '-0.01em',
        }}>
          Muscle-Meta Matrix
          <span style={{ fontSize: 11, color: '#D4AF37', verticalAlign: 'super', marginLeft: 2 }}>™</span>
        </div>
        <div style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase' as const,
          color: '#6b7b8f',
          marginTop: 3,
        }}>
          Clinical Intelligence · Active Aging
        </div>
      </div>
    </div>
  );
}
