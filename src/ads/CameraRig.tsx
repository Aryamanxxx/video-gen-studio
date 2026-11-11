import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AdTheme } from './theme';

export interface CameraKeyframe {
  frame: number;
  zoom?: number;
  focalPointX?: number; // In px offset from center (0 = center)
  focalPointY?: number; // In px offset from center (0 = center)
  rotateZ?: number;     // In degrees
}

export interface CameraRigProps {
  children: React.ReactNode;
  keyframes?: CameraKeyframe[];
  enableBreathing?: boolean;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  children,
  keyframes = [
    { frame: 0, zoom: 1.0, focalPointX: 0, focalPointY: 0, rotateZ: 0 },
    { frame: 90, zoom: 1.15, focalPointX: -20, focalPointY: -30, rotateZ: -1.5 },
    { frame: 240, zoom: 1.08, focalPointX: 30, focalPointY: 20, rotateZ: 1 },
    { frame: 450, zoom: 1.22, focalPointX: 0, focalPointY: -50, rotateZ: 0 },
  ],
  enableBreathing = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find surrounding keyframes
  let prev = keyframes[0];
  let next = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (frame >= keyframes[i].frame && frame <= keyframes[i + 1].frame) {
      prev = keyframes[i];
      next = keyframes[i + 1];
      break;
    }
  }

  // Damped spring progress between keyframes
  const segmentDuration = Math.max(1, next.frame - prev.frame);
  const localFrame = frame - prev.frame;
  
  const springProgress = spring({
    frame: localFrame,
    fps,
    config: AdTheme.springs.smooth,
  });

  const clampedProgress = Math.min(1, Math.max(0, springProgress));

  // Interpolate camera properties with easing
  const zoom = interpolate(
    clampedProgress,
    [0, 1],
    [prev.zoom ?? 1.0, next.zoom ?? 1.0],
    {
      easing: AdTheme.easings.cinematicOut,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const focalX = interpolate(
    clampedProgress,
    [0, 1],
    [prev.focalPointX ?? 0, next.focalPointX ?? 0],
    {
      easing: AdTheme.easings.cinematicOut,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const focalY = interpolate(
    clampedProgress,
    [0, 1],
    [prev.focalPointY ?? 0, next.focalPointY ?? 0],
    {
      easing: AdTheme.easings.cinematicOut,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const rotateZ = interpolate(
    clampedProgress,
    [0, 1],
    [prev.rotateZ ?? 0, next.rotateZ ?? 0],
    {
      easing: AdTheme.easings.cinematicOut,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Micro-motion breathing
  const breathX = enableBreathing ? Math.sin(frame * 0.05) * 4 : 0;
  const breathY = enableBreathing ? Math.cos(frame * 0.04) * 3 : 0;
  const breathZoom = enableBreathing ? Math.sin(frame * 0.03) * 0.008 : 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          transform: `scale(${zoom + breathZoom}) translate(${-focalX + breathX}px, ${-focalY + breathY}px) rotate(${rotateZ}deg)`,
          transformOrigin: '540px 960px',
        }}
      >
        {children}
      </div>
    </div>
  );
};
