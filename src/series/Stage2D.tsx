import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export interface Stage2DProps {
  cameraZoom?: number;
  cameraPanX?: number;
  cameraPanY?: number;
  screenShake?: number; // Shake intensity in pixels (0 for none)
  background?: React.ReactNode;
  midground: React.ReactNode;
  foreground?: React.ReactNode;
  atmosphere?: 'fog' | 'rain' | 'apocalypse_amber' | 'night_danger' | 'none';
  width?: number;
  height?: number;
}

export const Stage2D: React.FC<Stage2DProps> = ({
  cameraZoom = 1,
  cameraPanX = 0,
  cameraPanY = 0,
  screenShake = 0,
  background,
  midground,
  foreground,
  atmosphere = 'night_danger',
  width = 1080,
  height = 1920,
}) => {
  const frame = useCurrentFrame();

  // SCREEN SHAKE (Decaying or oscillating high-frequency noise)
  let shakeX = 0;
  let shakeY = 0;
  if (screenShake > 0) {
    shakeX = (Math.sin(frame * 1.8) + Math.cos(frame * 2.7)) * screenShake * 0.7;
    shakeY = (Math.cos(frame * 2.1) + Math.sin(frame * 3.1)) * screenShake * 0.7;
  }

  // PARALLAX COEFFICIENTS
  // Background moves slower (0.4x), Midground moves at 1.0x, Foreground moves faster (1.35x)
  const bgPanX = cameraPanX * 0.35 + shakeX * 0.2;
  const bgPanY = cameraPanY * 0.35 + shakeY * 0.2;

  const midPanX = cameraPanX + shakeX;
  const midPanY = cameraPanY + shakeY;

  const fgPanX = cameraPanX * 1.35 + shakeX * 1.4;
  const fgPanY = cameraPanY * 1.35 + shakeY * 1.4;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        background: '#090d16',
      }}
    >
      {/* 1. PARALLAX BACKGROUND PLANE */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `scale(${cameraZoom * 1.05}) translate(${-bgPanX}px, ${-bgPanY}px)`,
          transformOrigin: 'center center',
          transition: 'transform 0.05s linear',
        }}
      >
        {background || (
          // Default post-apocalyptic dark skyline silhouette
          <svg width={width} height={height} viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#311028" />
              </linearGradient>
              <radialGradient id="redMoon" cx="70%" cy="25%" r="35%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#991b1b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ominous Sky */}
            <rect width="1080" height="1920" fill="url(#skyGrad)" />

            {/* Blood Moon / Red Hazard Light */}
            <circle cx="750" cy="420" r="140" fill="url(#redMoon)" />

            {/* Distant Ruined Buildings */}
            <path
              d="M 0 1200 L 120 1200 L 120 1000 L 220 1000 L 220 1250 L 360 1250 L 360 920 L 480 920 L 510 960 L 510 1220 L 640 1220 L 640 850 L 760 850 L 760 1240 L 920 1240 L 920 1080 L 1080 1080 L 1080 1920 L 0 1920 Z"
              fill="#090d16"
              opacity="0.9"
            />
            {/* Distant windows blinking yellow/flickering */}
            <rect x="390" y="980" width="8" height="14" fill="#fbbf24" opacity={Math.sin(frame * 0.1) > 0 ? 0.7 : 0.1} />
            <rect x="420" y="1040" width="8" height="14" fill="#ef4444" opacity={Math.cos(frame * 0.14) > 0 ? 0.8 : 0.2} />
            <rect x="680" y="900" width="10" height="18" fill="#fbbf24" opacity={Math.sin(frame * 0.08) > 0 ? 0.6 : 0} />
          </svg>
        )}
      </div>

      {/* 2. MIDGROUND PLANE (CHARACTERS, PROPS, GROUND) */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `scale(${cameraZoom}) translate(${-midPanX}px, ${-midPanY}px)`,
          transformOrigin: 'center center',
          zIndex: 10,
        }}
      >
        {/* Ground platform / street silhouette */}
        <svg width={width} height={height} viewBox="0 0 1080 1920" style={{ position: 'absolute', pointerEvents: 'none' }}>
          {/* Cracked asphalt street base */}
          <path
            d="M 0 1480 Q 320 1470 680 1485 Q 920 1490 1080 1475 L 1080 1920 L 0 1920 Z"
            fill="#090a0f"
          />
          {/* Street kerb / rubble highlight */}
          <path
            d="M 0 1480 Q 320 1470 680 1485 Q 920 1490 1080 1475"
            stroke="#1e293b"
            strokeWidth="4"
            fill="none"
          />
          {/* Scattered rubble stones */}
          <polygon points="180,1475 200,1468 215,1475" fill="#334155" />
          <polygon points="620,1482 645,1472 655,1482" fill="#334155" />
          <polygon points="840,1486 860,1478 880,1486" fill="#1e293b" />
        </svg>

        {midground}
      </div>

      {/* 3. PARALLAX FOREGROUND PLANE (SILHOUETTES & CLOSE DEBRIS) */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `scale(${cameraZoom * 1.12}) translate(${-fgPanX}px, ${-fgPanY}px)`,
          transformOrigin: 'center center',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        {foreground || (
          <svg width={width} height={height} viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
            {/* Foreground silhouettes: barbed wire pole on left */}
            <g opacity="0.95">
              <line x1="80" y1="1100" x2="60" y2="1920" stroke="#000" strokeWidth="22" strokeLinecap="round" />
              {/* Barb loops */}
              <path d="M 40 1200 Q 110 1220 180 1250" stroke="#111" strokeWidth="5" fill="none" />
              <path d="M 40 1340 Q 120 1370 200 1410" stroke="#111" strokeWidth="5" fill="none" />
              <circle cx="110" cy="1220" r="4" fill="#333" />
              <circle cx="120" cy="1370" r="4" fill="#333" />
            </g>

            {/* Foreground street lamp on right edge */}
            <g opacity="0.85">
              <path d="M 1020 1920 L 1010 1050 Q 1005 920 950 890" stroke="#050508" strokeWidth="26" fill="none" />
              <circle cx="945" cy="895" r="18" fill="#facc15" opacity={0.15 + 0.05 * Math.sin(frame * 0.4)} />
            </g>
          </svg>
        )}
      </div>

      {/* 4. ATMOSPHERIC OVERLAYS */}
      {atmosphere === 'night_danger' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 40%, rgba(220, 38, 38, 0.08) 0%, rgba(9, 13, 22, 0.6) 80%)',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
            zIndex: 30,
          }}
        />
      )}

      {atmosphere === 'apocalypse_amber' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.15) 0%, rgba(69, 10, 10, 0.5) 100%)',
            mixBlendMode: 'color-burn',
            pointerEvents: 'none',
            zIndex: 30,
          }}
        />
      )}

      {/* Heavy Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 160px rgba(0, 0, 0, 0.92), inset 0 0 80px rgba(0, 0, 0, 0.8)',
          pointerEvents: 'none',
          zIndex: 40,
        }}
      />
    </div>
  );
};
