import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// 1. BASEBALL BAT
export const BaseballBat: React.FC<{
  hasBarbedWire?: boolean;
  scale?: number;
  rotation?: number;
}> = ({ hasBarbedWire = true, scale = 1, rotation = 0 }) => {
  return (
    <g transform={`scale(${scale}) rotate(${rotation})`}>
      {/* Bat wood body */}
      <path
        d="M 0 0 L 3 -12 L 7 -55 Q 8 -75 4 -78 Q 0 -80 -4 -78 Q -8 -75 -7 -55 L -3 -12 L 0 0"
        fill="#b45309"
        stroke="#78350f"
        strokeWidth="1.5"
      />
      {/* Handle grip tape */}
      <path
        d="M -2.5 -5 L 2.5 -7 M -2.8 -10 L 2.8 -12 M -3 -15 L 3 -17 M -3.2 -20 L 3.2 -22"
        stroke="#f8fafc"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Knob */}
      <ellipse cx="0" cy="1" rx="3.5" ry="2" fill="#78350f" />
      {/* Barbed wire wrapping */}
      {hasBarbedWire && (
        <g stroke="#94a3b8" strokeWidth="1.2" fill="none">
          <path d="M -6 -45 Q 0 -43 6 -47" />
          <path d="M -7 -55 Q 0 -52 7 -57" />
          <path d="M -6 -65 Q 0 -62 6 -67" />
          {/* Wire Barbs */}
          <line x1="-5" y1="-46" x2="-8" y2="-43" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="5" y1="-56" x2="8" y2="-53" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="-6" y1="-64" x2="-9" y2="-67" stroke="#cbd5e1" strokeWidth="1.5" />
        </g>
      )}
    </g>
  );
};

// 2. SHOTGUN
export const Shotgun: React.FC<{
  scale?: number;
  rotation?: number;
  isFiring?: boolean;
}> = ({ scale = 1, rotation = 0, isFiring = false }) => {
  const frame = useCurrentFrame();
  const muzzleFlash = isFiring || (frame % 30 < 3);

  return (
    <g transform={`scale(${scale}) rotate(${rotation})`}>
      {/* Wooden Stock */}
      <path
        d="M -25 5 L -12 2 L 0 0 L 2 6 L -10 10 L -25 12 Z"
        fill="#78350f"
        stroke="#451a03"
        strokeWidth="1.2"
      />
      {/* Steel Receiver & Trigger Guard */}
      <rect x="0" y="-3" width="18" height="8" rx="1.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
      <path d="M 6 5 Q 8 9 12 5" fill="none" stroke="#1e293b" strokeWidth="1.2" />
      <line x1="9" y1="5" x2="9" y2="7.5" stroke="#0f172a" strokeWidth="1.5" />
      {/* Barrel */}
      <rect x="18" y="-3" width="45" height="4.5" fill="#475569" stroke="#1e293b" strokeWidth="1" />
      <rect x="22" y="1.5" width="28" height="3" fill="#1e293b" />
      {/* Pump / Forend */}
      <rect x="24" y="0.5" width="14" height="5" rx="1" fill="#92400e" stroke="#451a03" strokeWidth="0.8" />
      {/* Muzzle Flash & Smoke */}
      {muzzleFlash && (
        <g transform="translate(64, -1)">
          {/* Outer blast */}
          <polygon
            points="0,-8 15,-15 12,-4 32,0 12,4 16,16 0,8"
            fill="#facc15"
            opacity="0.9"
          />
          {/* Inner core */}
          <polygon
            points="0,-4 10,-8 8,-2 20,0 8,2 10,9 0,4"
            fill="#ffffff"
          />
          {/* Smoke ring */}
          <circle cx="28" cy="0" r="10" fill="#cbd5e1" opacity="0.35" />
        </g>
      )}
    </g>
  );
};

// 3. FLASHLIGHT BEAM
export const FlashlightBeam: React.FC<{
  beamLength?: number;
  beamAngle?: number;
  intensity?: number;
  flicker?: boolean;
}> = ({ beamLength = 480, beamAngle = 36, intensity = 0.65, flicker = true }) => {
  const frame = useCurrentFrame();
  const flickerOpacity = flicker
    ? intensity * (0.88 + 0.12 * Math.sin(frame * 0.9) * Math.cos(frame * 1.7))
    : intensity;

  const halfSpread = Math.tan(((beamAngle / 2) * Math.PI) / 180) * beamLength;

  return (
    <g>
      {/* Flashlight Body */}
      <rect x="-10" y="-3" width="16" height="6" rx="1" fill="#334155" stroke="#0f172a" strokeWidth="1" />
      <polygon points="6,-5 12,-7 12,7 6,5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
      
      {/* Volumetric Light Cone */}
      <defs>
        <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity={flickerOpacity * 1.2} />
          <stop offset="25%" stopColor="#fef9c3" stopOpacity={flickerOpacity * 0.7} />
          <stop offset="70%" stopColor="#ffffff" stopOpacity={flickerOpacity * 0.25} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon
        points={`12,0 ${12 + beamLength},-${halfSpread} ${12 + beamLength},${halfSpread}`}
        fill="url(#beamGradient)"
        style={{ mixBlendMode: 'screen' }}
      />
      {/* Core bulb glow */}
      <circle cx="12" cy="0" r="4" fill="#ffffff" opacity={flickerOpacity} />
    </g>
  );
};

// 4. BARRICADE PLANKS
export const BarricadePlanks: React.FC<{
  width?: number;
  height?: number;
}> = ({ width = 280, height = 340 }) => {
  return (
    <g>
      {/* Window / Door Dark Frame */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="#09090b"
        stroke="#27272a"
        strokeWidth="6"
      />
      {/* Diagonal Plank 1 */}
      <g transform={`rotate(-16 ${width / 2} ${height / 2})`}>
        <rect
          x="-20"
          y={height / 2 - 24}
          width={width + 40}
          height="44"
          fill="#78350f"
          stroke="#451a03"
          strokeWidth="3"
        />
        {/* Grain Lines */}
        <line x1="0" y1={height / 2 - 10} x2={width} y2={height / 2 - 10} stroke="#92400e" strokeWidth="1.5" />
        <line x1="20" y1={height / 2 + 6} x2={width - 20} y2={height / 2 + 6} stroke="#542307" strokeWidth="1.5" />
        {/* Nails */}
        <circle cx="10" cy={height / 2 - 8} r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
        <circle cx={width - 10} cy={height / 2 + 8} r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
      </g>

      {/* Diagonal Plank 2 */}
      <g transform={`rotate(18 ${width / 2} ${height / 2})`}>
        <rect
          x="-20"
          y={height / 2 - 18}
          width={width + 40}
          height="40"
          fill="#854d0e"
          stroke="#451a03"
          strokeWidth="3"
        />
        {/* Nails */}
        <circle cx="15" cy={height / 2 + 2} r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
        <circle cx={width - 15} cy={height / 2 - 2} r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
      </g>

      {/* Horizontal Plank 3 */}
      <rect
        x="-10"
        y={height * 0.72}
        width={width + 20}
        height="36"
        fill="#713f12"
        stroke="#451a03"
        strokeWidth="3"
      />
      {/* Nails */}
      <circle cx="10" cy={height * 0.72 + 18} r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
      <circle cx={width - 10} cy={height * 0.72 + 18} r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
    </g>
  );
};

// 5. BLOOD SPLATTER
export const BloodSplatter: React.FC<{
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
}> = ({ x = 0, y = 0, scale = 1, rotation = 0 }) => {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
      {/* Center heavy splash */}
      <path
        d="M 0 0 C 15 -18 35 -12 28 8 C 45 15 40 38 18 35 C 10 50 -15 48 -18 28 C -38 25 -32 -5 -15 -15 Z"
        fill="#991b1b"
      />
      <circle cx="-2" cy="4" r="16" fill="#7f1d1d" />
      {/* Radiating droplet splatters */}
      <circle cx="42" cy="-18" r="4.5" fill="#991b1b" />
      <circle cx="56" cy="-28" r="2.5" fill="#7f1d1d" />
      <circle cx="36" cy="48" r="5" fill="#991b1b" />
      <circle cx="-38" cy="38" r="4" fill="#991b1b" />
      <circle cx="-48" cy="-22" r="3.5" fill="#7f1d1d" />
      <path d="M 12 32 Q 22 55 18 64" stroke="#991b1b" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M -10 28 Q -18 52 -16 68" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
  );
};

// 6. SPEECH BUBBLE
export const SpeechBubble: React.FC<{
  text: string;
  speakerName?: string;
  speakerColor?: string;
  x: number;
  y: number;
  width?: number;
  tailDirection?: 'bottom-left' | 'bottom-right' | 'left' | 'right';
  startFrame?: number;
}> = ({
  text,
  speakerName,
  speakerColor = '#eab308',
  x,
  y,
  width = 300,
  tailDirection = 'bottom-left',
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.8 },
  });

  if (frame < startFrame) return null;

  const bubbleScale = interpolate(progress, [0, 1], [0.3, 1]);
  const bubbleOpacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        transform: `scale(${bubbleScale}) translate(-50%, -100%)`,
        transformOrigin: 'bottom center',
        opacity: bubbleOpacity,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.94)',
          border: `3px solid ${speakerColor}`,
          borderRadius: 18,
          padding: '12px 18px',
          boxShadow: `0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px ${speakerColor}33`,
          backdropFilter: 'blur(8px)',
          position: 'relative',
        }}
      >
        {speakerName && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              textTransform: 'uppercase',
              color: speakerColor,
              letterSpacing: 1.5,
              marginBottom: 4,
            }}
          >
            {speakerName}
          </div>
        )}
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#f8fafc',
            lineHeight: 1.3,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          {text}
        </div>

        {/* Comic Tail */}
        <div
          style={{
            position: 'absolute',
            bottom: -16,
            left: tailDirection === 'bottom-left' ? 36 : width - 64,
            width: 0,
            height: 0,
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: `16px solid ${speakerColor}`,
          }}
        />
      </div>
    </div>
  );
};
