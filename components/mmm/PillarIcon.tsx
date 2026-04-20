'use client';

import type { IconKind } from './data';

interface PillarIconProps {
  kind:          IconKind;
  color?:        string;
  size?:         number;
  strokeWidth?:  number;
}

export function PillarIcon({ kind, color = '#009090', size = 28, strokeWidth = 1.6 }: PillarIconProps) {
  const s: React.SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (kind) {
    case 'force':
      return (
        <svg viewBox="0 0 32 32" {...s}>
          <path d="M4 22 L12 14 L18 20 L28 10" />
          <circle cx="12" cy="14" r="1.6" fill={color} stroke="none" />
          <circle cx="18" cy="20" r="1.6" fill={color} stroke="none" />
          <path d="M24 10 L28 10 L28 14" />
        </svg>
      );

    case 'cellular':
      return (
        <svg viewBox="0 0 32 32" {...s}>
          <path d="M16 4 C10 10 8 14 8 19 C8 24 11.5 28 16 28 C20.5 28 24 24 24 19 C24 14 22 10 16 4 Z" />
          <path d="M16 12 C13 15 12 17 12 20 C12 23 13.8 25 16 25 C18.2 25 20 23 20 20 C20 17 19 15 16 12 Z" opacity="0.5" />
        </svg>
      );

    case 'wave':
      return (
        <svg viewBox="0 0 32 32" {...s}>
          <path d="M3 12 Q8 6 13 12 T23 12 T29 12" />
          <path d="M3 20 Q8 14 13 20 T23 20 T29 20" opacity="0.6" />
          <path d="M3 26 Q8 22 13 26 T23 26 T29 26" opacity="0.35" />
        </svg>
      );

    case 'neural':
      return (
        <svg viewBox="0 0 32 32" {...s}>
          <circle cx="16" cy="16" r="11" />
          <path d="M16 5 L16 27 M5 16 L27 16" strokeDasharray="2 3" opacity="0.5" />
          <circle cx="16" cy="10" r="1.8" fill={color} stroke="none" />
          <circle cx="10" cy="20" r="1.8" fill={color} stroke="none" />
          <circle cx="22" cy="20" r="1.8" fill={color} stroke="none" />
          <path d="M16 10 L10 20 L22 20 Z" opacity="0.4" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 32 32" {...s}>
          <circle cx="16" cy="16" r="10" />
        </svg>
      );
  }
}
