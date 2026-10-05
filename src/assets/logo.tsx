import React from 'react';

export const MATECH_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f3a5d" />
      <stop offset="100%" stop-color="#1b4965" />
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f77f00" />
      <stop offset="100%" stop-color="#e07a27" />
    </linearGradient>
    <linearGradient id="cyanSwoosh" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3a86ff" />
      <stop offset="100%" stop-color="#00b4d8" />
    </linearGradient>
  </defs>
  <circle cx="250" cy="180" r="120" fill="none" stroke="#e07a27" stroke-width="8" stroke-dasharray="140 30 180 30" stroke-linecap="round" />
  <circle cx="250" cy="180" r="120" fill="none" stroke="#0f3a5d" stroke-width="8" stroke-dasharray="60 30 150 40" stroke-dashoffset="120" stroke-linecap="round" />
  <g transform="translate(230, 95)">
    <rect x="0" y="0" width="40" height="68" rx="8" fill="#ffffff" stroke="#0f3a5d" stroke-width="4" />
    <rect x="14" y="4" width="12" height="3" rx="1.5" fill="#0f3a5d" />
    <rect x="4" y="10" width="32" height="48" rx="4" fill="#f8fafc" />
    <path d="M 22 18 L 14 32 L 20 32 L 18 42 L 27 28 L 21 28 Z" fill="#e07a27" />
    <path d="M 20 68 L 20 74 Q 20 84 32 84 Q 44 84 50 94" fill="none" stroke="#e07a27" stroke-width="3.5" stroke-linecap="round" />
  </g>
  <g transform="translate(160, 160)">
    <path d="M 20 45 L 35 45 L 35 25 L 20 25 Z" fill="#0f3a5d" />
    <path d="M 35 35 L 45 40" stroke="#0f3a5d" stroke-width="5" stroke-linecap="round" />
    <g transform="rotate(25 45 40)">
      <rect x="35" y="30" width="32" height="18" rx="4" fill="#1b4965" stroke="#ffffff" stroke-width="1.5" />
      <path d="M 32 28 L 68 28 L 65 32 L 35 32 Z" fill="#0f3a5d" />
      <rect x="65" y="32" width="5" height="14" rx="2" fill="#00b4d8" />
      <circle cx="67" cy="39" r="3" fill="#ffffff" opacity="0.8" />
    </g>
  </g>
  <path d="M 180 230 L 180 135 L 210 180 L 240 135 L 240 230 L 215 230 L 215 175 L 195 205 L 180 205 Z" fill="url(#blueGrad)" />
  <path d="M 240 230 L 270 135 L 300 135 L 330 230 L 305 230 L 295 198 L 265 198 L 255 230 Z M 270 180 L 290 180 L 280 150 Z" fill="url(#orangeGrad)" />
  <path d="M 210 185 Q 250 150 290 190 Q 325 210 350 185" fill="none" stroke="url(#orangeGrad)" stroke-width="8" stroke-linecap="round" />
  <path d="M 235 200 Q 275 165 315 200 Q 335 215 355 200" fill="none" stroke="url(#cyanSwoosh)" stroke-width="5" stroke-linecap="round" />
  <g transform="translate(305, 130)">
    <circle cx="16" cy="16" r="14" fill="#ffffff" stroke="#00b4d8" stroke-width="2" />
    <text x="16" y="21" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="15" font-weight="900" fill="#0f3a5d" text-anchor="middle">৳</text>
    <path d="M 25 8 L 33 2 M 33 2 L 27 2 M 33 2 L 33 8" stroke="#00b4d8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>
  <g transform="translate(225, 230)">
    <path d="M 0 6 C 0 2.7 2.7 0 6 0 L 36 0 C 42 6 48 12 48 18 L 48 56 C 48 59.3 45.3 62 42 62 L 6 62 C 2.7 62 0 59.3 0 56 Z" fill="#ffffff" stroke="#0f3a5d" stroke-width="3.5" />
    <path d="M 36 0 L 36 14 C 36 16 38 18 40 18 L 48 18" fill="none" stroke="#0f3a5d" stroke-width="3" />
    <line x1="8" y1="12" x2="28" y2="12" stroke="#e07a27" stroke-width="3" stroke-linecap="round" />
    <line x1="8" y1="20" x2="38" y2="20" stroke="#0f3a5d" stroke-width="2.5" stroke-linecap="round" />
    <line x1="8" y1="27" x2="38" y2="27" stroke="#0f3a5d" stroke-width="2.5" stroke-linecap="round" />
    <line x1="8" y1="34" x2="26" y2="34" stroke="#0f3a5d" stroke-width="2.5" stroke-linecap="round" />
    <rect x="10" y="42" width="34" height="14" rx="4" fill="#0f3a5d" />
    <text x="27" y="52" font-family="'JetBrains Mono', 'Plus Jakarta Sans', Arial, sans-serif" font-size="8.5" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">PRINT</text>
  </g>
  <text x="250" y="375" font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="44" font-weight="900" letter-spacing="2.5" fill="#0f3a5d" text-anchor="middle">M.A. TECH</text>
  <text x="250" y="420" font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="30" font-weight="800" letter-spacing="6" fill="#e07a27" text-anchor="middle">ENTERPRISE</text>
</svg>`;

export const MATECH_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(MATECH_LOGO_SVG)}`;

export const BrandLogo: React.FC<{ className?: string; size?: number }> = ({ className = 'w-10 h-10', size }) => {
  return (
    <div
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <img
        src={MATECH_LOGO_DATA_URL}
        alt="M.A. TECH ENTERPRISE Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};
