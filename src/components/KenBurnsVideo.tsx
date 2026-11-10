import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface KenBurnsVideoProps {
  src: string;
  startScale?: number;
  endScale?: number;
  panDirection?: "none" | "up" | "down" | "left" | "right";
  panDistance?: number;
  opacity?: number;
  filter?: string;
  muted?: boolean;
  style?: React.CSSProperties;
  playbackRate?: number;
}

export const KenBurnsVideo: React.FC<KenBurnsVideoProps> = ({
  src,
  startScale = 1.0,
  endScale = 1.18,
  panDirection = "up",
  panDistance = 35,
  opacity = 1.0,
  filter = "none",
  muted = true,
  style,
  playbackRate = 1,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Continuous subtle scale animation
  const scale = interpolate(frame, [0, durationInFrames], [startScale, endScale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Smooth cinematic pan
  let translateX = 0;
  let translateY = 0;

  if (panDirection === "up") {
    translateY = interpolate(frame, [0, durationInFrames], [0, -panDistance], {
      extrapolateRight: "clamp",
    });
  } else if (panDirection === "down") {
    translateY = interpolate(frame, [0, durationInFrames], [0, panDistance], {
      extrapolateRight: "clamp",
    });
  } else if (panDirection === "left") {
    translateX = interpolate(frame, [0, durationInFrames], [0, -panDistance], {
      extrapolateRight: "clamp",
    });
  } else if (panDirection === "right") {
    translateX = interpolate(frame, [0, durationInFrames], [0, panDistance], {
      extrapolateRight: "clamp",
    });
  }

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        pointerEvents: "none",
        ...style,
      }}
    >
      <OffthreadVideo
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: "center center",
          opacity,
          filter,
        }}
        muted={muted}
        playbackRate={playbackRate}
      />
    </AbsoluteFill>
  );
};
