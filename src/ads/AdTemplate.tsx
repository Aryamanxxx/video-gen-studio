import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { AdTheme } from './theme';
import { CameraRig } from './CameraRig';
import { HookKineticText } from './HookKineticText';
import { ProductHeroCard } from './ProductHeroCard';

export interface CommercialAdProps {
  brandName?: string;
  hookHeadline?: string;
  problemHeadline?: string;
  productName?: string;
  tagline?: string;
  priceTag?: string;
  offerHeadline?: string;
  ctaText?: string;
  productImage?: string;
}

export const AdTemplate: React.FC<CommercialAdProps> = ({
  brandName = 'AURA AUDIO',
  hookHeadline = 'STOP LISTENING TO FLAT AUDIO',
  problemHeadline = 'CHEAP PLASTIC DRIVERS RUIN EVERY TRACK',
  productName = 'AURA PRO X',
  tagline = 'Lossless Spatial Studio Monitors',
  priceTag = '$199',
  offerHeadline = 'LIMITED DROP // 40% OFF TODAY',
  ctaText = 'TAP TO CLAIM YOUR PAIR',
  productImage,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dynamic Camera Keyframes for 4 distinct beats (0-600 frames / 20s @ 30fps)
  const cameraKeyframes = [
    { frame: 0, zoom: 1.0, focalPointX: 0, focalPointY: 0, rotateZ: 0 },
    { frame: 90, zoom: 1.18, focalPointX: 0, focalPointY: -40, rotateZ: -1 },
    { frame: 240, zoom: 1.05, focalPointX: 15, focalPointY: 30, rotateZ: 0.8 },
    { frame: 450, zoom: 1.25, focalPointX: 0, focalPointY: -60, rotateZ: 0 },
  ];

  return (
    <AbsoluteFill style={{ background: AdTheme.colors.bg, overflow: 'hidden' }}>
      {/* 1. LAYER 1: VIBRANT DYNAMIC MESH BACKGROUND */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: AdTheme.colors.gradientDark,
        }}
      >
        {/* Animated ambient gradient blobs */}
        <div
          style={{
            position: 'absolute',
            width: 800,
            height: 800,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, transparent 70%)',
            top: 200 + Math.sin(frame * 0.04) * 60,
            left: 140 + Math.cos(frame * 0.05) * 80,
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, transparent 70%)',
            bottom: 300 + Math.cos(frame * 0.03) * 70,
            right: 80 + Math.sin(frame * 0.04) * 60,
            filter: 'blur(70px)',
          }}
        />
        {/* Dark subtle grid texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.7,
          }}
        />
      </div>

      {/* 2. LAYER 2: CAMERA RIGGED SCENE STACK */}
      <CameraRig keyframes={cameraKeyframes}>
        {/* BEAT 1: PATTERN INTERRUPT HOOK (0s–3s / Frames 0–90) */}
        <Sequence from={0} durationInFrames={90}>
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Top Brand Pill */}
            <div
              style={{
                position: 'absolute',
                top: 360,
                padding: '10px 24px',
                borderRadius: 100,
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: AdTheme.colors.primary,
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: 3,
                textTransform: 'uppercase',
                boxShadow: '0 0 25px rgba(56, 189, 248, 0.2)',
              }}
            >
              {brandName}
            </div>

            <HookKineticText
              headline={hookHeadline}
              subheadline="Experience Studio Acoustic Clarity Right On Your Phone"
              accentWords={['STOP', 'FLAT', 'AUDIO']}
              startFrame={6}
              fontSize={72}
            />
          </div>
        </Sequence>

        {/* BEAT 2: THE AGITATION / PROBLEM CUT (3s–8s / Frames 90–240) */}
        <Sequence from={90} durationInFrames={150}>
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Warning Hazard Tag */}
            <div
              style={{
                position: 'absolute',
                top: 340,
                padding: '8px 20px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.6)',
                color: '#f87171',
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              PROBLEM DETECTED
            </div>

            <HookKineticText
              headline={problemHeadline}
              subheadline="Muddy bass. Distorted highs. Cheap ear fatigue."
              accentWords={['CHEAP', 'RUIN', 'TRACK']}
              startFrame={4}
              fontSize={64}
            />

            {/* Agitation stat comparison card */}
            <div
              style={{
                marginTop: 60,
                width: 700,
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 24,
                padding: '24px 32px',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: '#ef4444' }}>84%</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginTop: 4 }}>
                  Harmonic Distortion
                </div>
              </div>
              <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: '#ef4444' }}>3 HRS</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginTop: 4 }}>
                  Dead Battery Limit
                </div>
              </div>
            </div>
          </div>
        </Sequence>

        {/* BEAT 3: HERO PRODUCT REVEAL & 3D TILT (8s–15s / Frames 240–450) */}
        <Sequence from={240} durationInFrames={210}>
          <ProductHeroCard
            productName={productName}
            tagline={tagline}
            priceTag={priceTag}
            imageSrc={productImage}
          />
        </Sequence>

        {/* BEAT 4: URGENCY OFFER & CTA LOCKUP (15s–20s / Frames 450–600) */}
        <Sequence from={450} durationInFrames={150}>
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Offer Pill */}
            <div
              style={{
                padding: '12px 30px',
                borderRadius: 100,
                background: AdTheme.colors.gradientGold,
                color: '#000000',
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: 2,
                boxShadow: '0 8px 30px rgba(245, 158, 11, 0.6)',
                marginBottom: 28,
              }}
            >
              {offerHeadline}
            </div>

            <HookKineticText
              headline="ELEVATE YOUR DAILY SOUNDTRACK"
              subheadline="Free Express Shipping + 30-Day Money-Back Guarantee."
              accentWords={['ELEVATE', 'SOUNDTRACK']}
              startFrame={4}
              fontSize={60}
            />

            {/* CTA BUTTON */}
            {(() => {
              const ctaSpring = spring({
                frame: frame - 465,
                fps,
                config: AdTheme.springs.pop,
              });

              const ctaScale = interpolate(ctaSpring, [0, 1], [0.5, 1]);
              const pulse = 1 + Math.sin(frame * 0.15) * 0.04;

              return (
                <div
                  style={{
                    marginTop: 60,
                    transform: `scale(${ctaScale * pulse})`,
                    background: AdTheme.colors.gradientBrand,
                    padding: '24px 64px',
                    borderRadius: 100,
                    boxShadow:
                      '0 15px 40px rgba(56, 189, 248, 0.5), 0 0 50px rgba(99, 102, 241, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      color: '#ffffff',
                      fontSize: 26,
                      fontWeight: 900,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                    }}
                  >
                    {ctaText}
                  </span>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M 5 12 H 19 M 13 6 L 19 12 L 13 18"
                      stroke="#ffffff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              );
            })()}

            {/* Countdown timer badge */}
            <div
              style={{
                marginTop: 30,
                color: AdTheme.colors.textSecondary,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 1.5,
                fontFamily: 'monospace',
              }}
            >
              SALE ENDS IN: 04:59:12
            </div>
          </div>
        </Sequence>
      </CameraRig>

      {/* 3. LAYER 5: FINISHING TOUCHES (COLOR GRADE, GRAIN & VIGNETTE) */}
      {/* Top and Bottom Cinematic Safe Borders */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 18,
          background: '#000000',
          zIndex: 100,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 18,
          background: '#000000',
          zIndex: 100,
        }}
      />

      {/* Vignette Shadow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 140px rgba(0, 0, 0, 0.85), inset 0 0 60px rgba(0, 0, 0, 0.7)',
          pointerEvents: 'none',
          zIndex: 90,
        }}
      />
    </AbsoluteFill>
  );
};
