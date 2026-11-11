import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AdTheme } from './theme';

export interface HookKineticTextProps {
  headline: string;
  subheadline?: string;
  accentWords?: string[];
  startFrame?: number;
  fontSize?: number;
}

export const HookKineticText: React.FC<HookKineticTextProps> = ({
  headline,
  subheadline,
  accentWords = [],
  startFrame = 0,
  fontSize = 64,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = headline.split(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 40px',
      }}
    >
      {/* MAIN HEADLINE WITH 3-PROPERTY CHOREOGRAPHY */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px 18px',
          maxWidth: 960,
        }}
      >
        {words.map((word, i) => {
          // Stagger by 4 frames per word
          const delay = startFrame + i * 4;
          const wordSpring = spring({
            frame: frame - delay,
            fps,
            config: AdTheme.springs.snappy,
          });

          const isAccent = accentWords.some(
            (aw) => aw.toLowerCase() === word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
          );

          // Property 1: translateY (from +45px down to 0)
          const translateY = interpolate(wordSpring, [0, 1], [45, 0], {
            easing: AdTheme.easings.cinematicOut,
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Property 2: scale (from 0.8 to 1.0)
          const scale = interpolate(wordSpring, [0, 1], [0.8, 1], {
            easing: AdTheme.easings.cinematicOut,
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Property 3: blur (from 14px down to 0px)
          const blur = interpolate(wordSpring, [0, 1], [14, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Opacity
          const opacity = interpolate(wordSpring, [0, 0.4, 1], [0, 0.9, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <span
              key={`word-${i}`}
              style={{
                display: 'inline-block',
                fontSize,
                fontWeight: 900,
                lineHeight: 1.15,
                transform: `translateY(${translateY}px) scale(${scale})`,
                filter: `blur(${blur}px)`,
                opacity,
                color: isAccent ? AdTheme.colors.primary : '#ffffff',
                textShadow: isAccent
                  ? '0 0 30px rgba(56, 189, 248, 0.7), 0 4px 12px rgba(0, 0, 0, 0.8)'
                  : '0 4px 16px rgba(0, 0, 0, 0.8)',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* OPTIONAL SUBHEADLINE */}
      {subheadline && (
        <div
          style={{
            marginTop: 24,
            maxWidth: 780,
            overflow: 'hidden',
          }}
        >
          {(() => {
            const subDelay = startFrame + words.length * 4 + 6;
            const subSpring = spring({
              frame: frame - subDelay,
              fps,
              config: AdTheme.springs.smooth,
            });

            const subY = interpolate(subSpring, [0, 1], [25, 0], {
              easing: AdTheme.easings.cinematicOut,
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const subOpacity = interpolate(subSpring, [0, 1], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: AdTheme.colors.textSecondary,
                  lineHeight: 1.4,
                  transform: `translateY(${subY}px)`,
                  opacity: subOpacity,
                  margin: 0,
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)',
                }}
              >
                {subheadline}
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
};
