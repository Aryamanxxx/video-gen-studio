import React, { useMemo } from "react";
import { Audio, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SubtitleWord } from "./KaraokeSubtitles";

export interface AudioLayerProps {
  voiceoverSrc?: string;
  musicSrc?: string;
  subtitles?: SubtitleWord[];
  voiceVolume?: number;
  musicBaseVolume?: number;
  musicDuckedVolume?: number;
  duckLeadTime?: number; // seconds to start ducking before speech
  duckTrailTime?: number; // seconds to return to base volume after speech
}

export const AudioLayer: React.FC<AudioLayerProps> = ({
  voiceoverSrc,
  musicSrc,
  subtitles = [],
  voiceVolume = 1.0,
  musicBaseVolume = 0.55,
  musicDuckedVolume = 0.15,
  duckLeadTime = 0.15,
  duckTrailTime = 0.25,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pre-calculate active speech intervals for efficient frame lookup
  const speechIntervals = useMemo(() => {
    if (!subtitles || subtitles.length === 0) return [];

    // Merge overlapping or nearby words within 0.4s into single speech chunks
    const merged: Array<{ start: number; end: number }> = [];
    let current = { start: subtitles[0].start, end: subtitles[0].end };

    for (let i = 1; i < subtitles.length; i++) {
      const nextWord = subtitles[i];
      if (nextWord.start - current.end <= 0.45) {
        current.end = Math.max(current.end, nextWord.end);
      } else {
        merged.push({ ...current });
        current = { start: nextWord.start, end: nextWord.end };
      }
    }
    merged.push(current);
    return merged;
  }, [subtitles]);

  // Dynamic volume function for background music sidechain ducking
  const getMusicVolume = (f: number): number => {
    const t = f / fps;

    // Check if current time is within or near speech
    const isSpeaking = speechIntervals.some(
      (interval) =>
        t >= interval.start - duckLeadTime && t <= interval.end + duckTrailTime
    );

    return isSpeaking ? musicDuckedVolume : musicBaseVolume;
  };

  return (
    <>
      {/* Primary Voiceover Track */}
      {voiceoverSrc && (
        <Audio
          src={voiceoverSrc}
          volume={voiceVolume}
        />
      )}

      {/* Sidechained Ducking Background Music */}
      {musicSrc && (
        <Audio
          src={musicSrc}
          volume={getMusicVolume}
          loop
        />
      )}
    </>
  );
};
