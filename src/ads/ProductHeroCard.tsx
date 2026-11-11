import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AdTheme } from './theme';

export interface ProductCallout {
  label: string;
  value: string;
  xPercent: number; // e.g. 15 for 15%
  yPercent: number; // e.g. 30 for 30%
  delayFrames?: number;
}

export interface ProductHeroCardProps {
  productName: string;
  tagline: string;
  priceTag?: string;
  imageSrc?: string;
  callouts?: ProductCallout[];
  badgeText?: string;
}

export const ProductHeroCard: React.FC<ProductHeroCardProps> = ({
  productName,
  tagline,
  priceTag = '$149',
  imageSrc,
  callouts = [
    { label: 'BATTERY', value: '48H LIFE', xPercent: -15, yPercent: 25, delayFrames: 10 },
    { label: 'MATERIAL', value: 'TITANIUM T6', xPercent: 95, yPercent: 40, delayFrames: 18 },
    { label: 'WEIGHT', value: '185 GRAMS', xPercent: -10, yPercent: 70, delayFrames: 26 },
  ],
  badgeText = 'NEW RELEASE // 2026',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entranceProgress = spring({
    frame,
    fps,
    config: AdTheme.springs.snappy,
  });

  const cardScale = interpolate(entranceProgress, [0, 1], [0.65, 1], {
    easing: AdTheme.easings.cinematicOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cardOpacity = interpolate(entranceProgress, [0, 0.4, 1], [0, 0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Dynamic 3D Perspective Tilt & Gentle Orbit Float
  const rotateX = Math.sin(frame * 0.05) * 8;
  const rotateY = Math.cos(frame * 0.06) * 10;
  const floatY = Math.sin(frame * 0.08) * 12;

  // Specular sheen sweep: travels across card
  const sheenProgress = (frame % 90) / 90;
  const sheenX = interpolate(sheenProgress, [0, 1], [-200, 800]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1200,
        position: 'relative',
      }}
    >
      {/* 3D FLOATING SHADOW */}
      <div
        style={{
          position: 'absolute',
          width: 520,
          height: 80,
          background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.35) 0%, rgba(0, 0, 0, 0.8) 50%, transparent 80%)',
          bottom: 480,
          borderRadius: '50%',
          transform: `scale(${cardScale * (1 - floatY * 0.005)})`,
          opacity: cardOpacity * 0.85,
          filter: 'blur(16px)',
        }}
      />

      {/* 3D ROTATING PRODUCT CARD */}
      <div
        style={{
          width: 680,
          height: 820,
          position: 'relative',
          borderRadius: 36,
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.95))',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 50px rgba(56, 189, 248, 0.18)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '44px 36px',
          transform: `scale(${cardScale}) translateY(${floatY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          opacity: cardOpacity,
          overflow: 'hidden',
        }}
      >
        {/* SPECULAR SHEEN GLOSS SWEEP */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: sheenX,
            width: 140,
            height: 1200,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.18), transparent)',
            transform: 'rotate(25deg)',
            pointerEvents: 'none',
          }}
        />

        {/* TOP HEADER: BADGE & PRICE */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              padding: '8px 18px',
              borderRadius: 100,
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: AdTheme.colors.primary,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            {badgeText}
          </div>

          <div
            style={{
              padding: '8px 22px',
              borderRadius: 100,
              background: AdTheme.colors.gradientGold,
              color: '#000000',
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 1,
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.5)',
            }}
          >
            {priceTag}
          </div>
        </div>

        {/* CENTER PRODUCT VISUALIZATION */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 480,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={productName}
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))',
              }}
            />
          ) : (
            // Sleek Cyberpunk Headphone / Hardware Hero SVG Mockup
            <svg width="420" height="420" viewBox="0 0 400 400">
              <defs>
                <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="metalArch" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="45%" stopColor="#f8fafc" />
                  <stop offset="70%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Glowing Aura */}
              <circle cx="200" cy="200" r="160" fill="url(#heroGlow)" />

              {/* Headphone Arch */}
              <path
                d="M 80 230 C 70 80, 330 80, 320 230"
                fill="none"
                stroke="url(#metalArch)"
                strokeWidth="28"
                strokeLinecap="round"
              />
              <path
                d="M 90 220 C 85 100, 315 100, 310 220"
                fill="none"
                stroke="#0f172a"
                strokeWidth="6"
              />

              {/* Left Ear Cup */}
              <g transform="translate(60, 210)">
                <rect x="0" y="0" width="50" height="90" rx="25" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
                <rect x="12" y="10" width="26" height="70" rx="13" fill="#0f172a" />
                <circle cx="25" cy="45" r="8" fill="#38bdf8" opacity={0.8 + 0.2 * Math.sin(frame * 0.2)} />
              </g>

              {/* Right Ear Cup */}
              <g transform="translate(290, 210)">
                <rect x="0" y="0" width="50" height="90" rx="25" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
                <rect x="12" y="10" width="26" height="70" rx="13" fill="#0f172a" />
                <circle cx="25" cy="45" r="8" fill="#38bdf8" opacity={0.8 + 0.2 * Math.sin(frame * 0.2)} />
              </g>

              {/* Soundwave energy indicator */}
              <g stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.75">
                <line x1="160" y1={190 + Math.sin(frame * 0.4) * 20} x2="160" y2={210 - Math.sin(frame * 0.4) * 20} />
                <line x1="180" y1={175 + Math.sin(frame * 0.4 + 1) * 30} x2="180" y2={225 - Math.sin(frame * 0.4 + 1) * 30} />
                <line x1="200" y1={160 + Math.sin(frame * 0.4 + 2) * 45} x2="200" y2={240 - Math.sin(frame * 0.4 + 2) * 45} />
                <line x1="220" y1={175 + Math.sin(frame * 0.4 + 3) * 30} x2="220" y2={225 - Math.sin(frame * 0.4 + 3) * 30} />
                <line x1="240" y1={190 + Math.sin(frame * 0.4 + 4) * 20} x2="240" y2={210 - Math.sin(frame * 0.4 + 4) * 20} />
              </g>
            </svg>
          )}

          {/* STAGGERED TACTILE CALLOUT PILLS */}
          {callouts.map((c, i) => {
            const delay = c.delayFrames ?? i * 8;
            const pillSpring = spring({
              frame: frame - delay,
              fps,
              config: AdTheme.springs.pop,
            });

            if (frame < delay) return null;

            const pillScale = interpolate(pillSpring, [0, 1], [0.3, 1]);
            const pillOpacity = interpolate(pillSpring, [0, 1], [0, 1]);

            return (
              <div
                key={`callout-${i}`}
                style={{
                  position: 'absolute',
                  left: `${c.xPercent}%`,
                  top: `${c.yPercent}%`,
                  transform: `scale(${pillScale}) translateZ(40px)`,
                  opacity: pillOpacity,
                  background: 'rgba(15, 23, 42, 0.92)',
                  border: '1px solid rgba(56, 189, 248, 0.5)',
                  borderRadius: 14,
                  padding: '8px 14px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.6), 0 0 15px rgba(56, 189, 248, 0.25)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: AdTheme.colors.primary,
                    letterSpacing: 1.5,
                  }}
                >
                  {c.label}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: 0.5,
                  }}
                >
                  {c.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* BOTTOM TITLE & TAGLINE */}
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {productName}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: AdTheme.colors.textSecondary,
              marginTop: 4,
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
    </div>
  );
};
