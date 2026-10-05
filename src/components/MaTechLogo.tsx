import React, { useState } from 'react';
import shopLogoImage from '../assets/images/ma_tech_logo_1791181530289.jpg';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'image' | 'svg' | 'auto';
  customLogoUrl?: string;
}

export const MaTechLogo: React.FC<Props> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'auto',
  customLogoUrl,
}) => {
  const [imageError, setImageError] = useState(false);

  const dimensions = {
    sm: { width: 120, height: 40, iconSize: 36, fontSize: 13, subSize: 8.5 },
    md: { width: 180, height: 56, iconSize: 52, fontSize: 17, subSize: 10.5 },
    lg: { width: 240, height: 76, iconSize: 70, fontSize: 23, subSize: 13.5 },
    xl: { width: 320, height: 100, iconSize: 92, fontSize: 30, subSize: 17 },
  }[size];

  const logoSrc = customLogoUrl || shopLogoImage;
  const shouldUseImage = (variant === 'image' || variant === 'auto') && !imageError;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Shop Emblem Badge / Logo */}
      {shouldUseImage ? (
        <div
          className="relative shrink-0 rounded-xl overflow-hidden border border-slate-200/80 shadow-xs bg-white flex items-center justify-center"
          style={{ width: `${dimensions.iconSize}px`, height: `${dimensions.iconSize}px` }}
        >
          <img
            src={logoSrc}
            alt="M A Tech Enterprise Logo"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        /* Vector SVG Fallback with CCTV & Tech Motifs */
        <svg
          width={dimensions.iconSize}
          height={dimensions.iconSize}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-xs"
        >
          {/* Outer Split Circular Ring */}
          <circle
            cx="100"
            cy="95"
            r="80"
            stroke="#19649E"
            strokeWidth="8"
            strokeDasharray="260 260"
            strokeDashoffset="70"
            strokeLinecap="round"
          />
          <circle
            cx="100"
            cy="95"
            r="80"
            stroke="#ED7014"
            strokeWidth="8"
            strokeDasharray="220 280"
            strokeDashoffset="-120"
            strokeLinecap="round"
          />

          {/* Top: Smartphone Silhouette (Phone Accessories) */}
          <rect
            x="84"
            y="28"
            width="32"
            height="52"
            rx="6"
            stroke="#19649E"
            strokeWidth="4"
            fill="#FFFFFF"
          />
          <path
            d="M96 34H104"
            stroke="#19649E"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Phone screen charge icon */}
          <rect x="91" y="44" width="18" height="24" rx="2" fill="#ED7014" />
          <path
            d="M101 47L97 56H101L99 65L105 54H101L103 47Z"
            fill="#FFFFFF"
          />

          {/* Taka Symbol (৳) */}
          <text
            x="142"
            y="62"
            fill="#19649E"
            fontSize="22"
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
          >
            ৳
          </text>
          <path
            d="M152 50L164 38M164 38H154M164 38V48"
            stroke="#19649E"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Stylized M letter (Deep Blue) */}
          <path
            d="M52 145V68L84 105L100 86"
            stroke="#0F3B66"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* CCTV Camera Head integrated with the M */}
          <g transform="translate(48, 86)">
            {/* Camera housing */}
            <rect
              x="4"
              y="2"
              width="28"
              height="18"
              rx="5"
              fill="#0F3B66"
              stroke="#19649E"
              strokeWidth="2"
              transform="rotate(-20 4 2)"
            />
            {/* Camera Lens */}
            <circle cx="28" cy="18" r="5" fill="#19649E" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="28" cy="18" r="2" fill="#00E5FF" />
            {/* Mount Bracket */}
            <path d="M6 14L-4 18V24" stroke="#0F3B66" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Stylized A letter (Vibrant Orange & Dynamic Waves) */}
          <path
            d="M100 86L124 105L148 145"
            stroke="#ED7014"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dynamic sweeping wave ribbons on A */}
          <path
            d="M80 114C108 92 144 140 178 116"
            stroke="#ED7014"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M86 126C112 108 142 146 172 128"
            stroke="#19649E"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Bottom Document / Print Icon (Bill & Challan) */}
          <g transform="translate(82, 132)">
            <rect
              x="2"
              y="2"
              width="32"
              height="40"
              rx="4"
              fill="#FFFFFF"
              stroke="#19649E"
              strokeWidth="3"
            />
            <line x1="8" y1="10" x2="28" y2="10" stroke="#ED7014" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="16" x2="28" y2="16" stroke="#ED7014" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="22" x2="22" y2="22" stroke="#ED7014" strokeWidth="2" strokeLinecap="round" />
            <rect x="6" y="27" width="24" height="11" rx="2" fill="#0F3B66" />
            <text
              x="18"
              y="35"
              fill="#FFFFFF"
              fontSize="6.5"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
            >
              PRINT
            </text>
          </g>
        </svg>
      )}

      {/* Typography Wordmark */}
      {showText && (
        <div className="flex flex-col justify-center leading-none select-none">
          <span
            className="font-black tracking-tight text-[#0F3B66] uppercase"
            style={{ fontSize: `${dimensions.fontSize}px`, letterSpacing: '-0.02em' }}
          >
            M A TECH
          </span>
          <span
            className="font-bold tracking-widest text-[#ED7014] uppercase mt-0.5"
            style={{ fontSize: `${dimensions.subSize}px`, letterSpacing: '0.14em' }}
          >
            ENTERPRISE
          </span>
        </div>
      )}
    </div>
  );
};
