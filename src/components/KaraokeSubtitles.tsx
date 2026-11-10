import React, { useMemo } from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface SubtitleWord {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface KaraokeSubtitlesProps {
  subtitles: SubtitleWord[];
  wordsPerChunk?: number;
  highlightColor?: string;
  normalColor?: string;
  fontSize?: number;
  bottomPercentage?: number;
  fontFamily?: string;
}

export const KaraokeSubtitles: React.FC<KaraokeSubtitlesProps> = ({
  subtitles,
  wordsPerChunk = 2,
  highlightColor = "#facc15", // Electric TikTok/Reels Yellow
  normalColor = "#ffffff",
  fontSize = 64,
  bottomPercentage = 24, // Sits comfortably in mobile reel safe area
  fontFamily = "-apple-system, BlinkMacSystemFont, 'Impact', 'Montserrat', 'Inter', sans-serif",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // 1. Group individual words into short 1-3 word punchy chunks
  const chunks = useMemo(() => {
    if (!subtitles || subtitles.length === 0) return [];
    const grouped: SubtitleWord[][] = [];
    for (let i = 0; i < subtitles.length; i += wordsPerChunk) {
      grouped.push(subtitles.slice(i, i + wordsPerChunk));
    }
    return grouped;
  }, [subtitles, wordsPerChunk]);

  // 2. Identify the active chunk for the current timestamp
  const activeChunk = useMemo(() => {
    if (chunks.length === 0) return null;
    return chunks.find((chunk) => {
      const chunkStart = chunk[0].start;
      // Hold chunk visible slightly past the last word end for smooth readability
      const chunkEnd = chunk[chunk.length - 1].end + 0.18;
      return currentTime >= chunkStart && currentTime <= chunkEnd;
    }) || null;
  }, [chunks, currentTime]);

  if (!activeChunk) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: `${bottomPercentage}%`,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "14px 20px",
          maxWidth: "85%",
          textAlign: "center",
        }}
      >
        {activeChunk.map((w, idx) => {
          const isCurrent = currentTime >= w.start && currentTime <= w.end + 0.08;
          const wordStartFrame = Math.round(w.start * fps);

          // Spring pop on the active word
          const popSpring = spring({
            frame: Math.max(0, frame - wordStartFrame),
            fps,
            config: { damping: 9, stiffness: 180 },
          });

          const scale = isCurrent ? 1.0 + popSpring * 0.18 : 1.0;

          return (
            <span
              key={`${w.word}-${idx}`}
              style={{
                display: "inline-block",
                fontFamily,
                fontSize,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: isCurrent ? highlightColor : normalColor,
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                WebkitTextStroke: "4px #000000",
                paintOrder: "stroke fill",
                textShadow: isCurrent
                  ? `0 0 25px ${highlightColor}90, 0 8px 24px rgba(0,0,0,0.95)`
                  : "0 6px 18px rgba(0,0,0,0.9)",
                transition: "color 0.05s ease-out",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
