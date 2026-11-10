import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface MainVideoProps {
  title: string;
  subtitle: string;
  accentColor: string;
}

export const MainVideo: React.FC<MainVideoProps> = ({
  title,
  subtitle,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Design Tokens
  const background = "#090d16";
  const textColor = "#f8fafc";
  const subtextColor = "#94a3b8";

  // Spring physics for entrance animations
  const titleEntrance = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.8,
    },
  });

  const subtitleEntrance = spring({
    frame: frame - 25,
    fps,
    config: {
      damping: 16,
      stiffness: 100,
    },
  });

  const badgeEntrance = spring({
    frame: frame - 45,
    fps,
    config: {
      damping: 18,
      stiffness: 140,
    },
  });

  const titleTranslateY = interpolate(titleEntrance, [0, 1], [60, 0]);
  const subtitleTranslateY = interpolate(subtitleEntrance, [0, 1], [40, 0]);
  const glowScale = interpolate(frame, [0, 180, 360], [1, 1.25, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: textColor,
        overflow: "hidden",
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}33 0%, rgba(9, 13, 22, 0) 70%)`,
          transform: `scale(${glowScale})`,
          pointerEvents: "none",
        }}
      />

      {/* Main Content Card (Inside Action Safe Margin) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "1400px",
          padding: "40px",
          zIndex: 10,
        }}
      >
        {/* Badge */}
        <div
          style={{
            opacity: badgeEntrance,
            transform: `scale(${badgeEntrance})`,
            backgroundColor: `${accentColor}22`,
            border: `1px solid ${accentColor}66`,
            color: "#e0e7ff",
            padding: "10px 24px",
            borderRadius: "9999px",
            fontSize: "20px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "36px",
          }}
        >
          Zero-Local-Compute Studio
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "84px",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            margin: 0,
            marginBottom: "28px",
            opacity: titleEntrance,
            transform: `translateY(${titleTranslateY}px)`,
            background: `linear-gradient(135deg, ${textColor} 60%, ${accentColor})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "32px",
            fontWeight: 400,
            color: subtextColor,
            margin: 0,
            lineHeight: 1.4,
            opacity: subtitleEntrance,
            transform: `translateY(${subtitleTranslateY}px)`,
          }}
        >
          {subtitle}
        </p>
      </div>
    </AbsoluteFill>
  );
};
