import React from 'react';
import { Composition } from 'remotion';
import { MainVideo } from './Composition';
import { EpisodePlayer } from './series/EpisodePlayer';
import { AdTemplate } from './ads/AdTemplate';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ENGINE A: Episodic 2D / Stick-Figure Story Series (Zombie / Narrative) */}
      <Composition
        id="SeriesEpisode"
        component={EpisodePlayer}
        durationInFrames={300} // 10 seconds @ 30fps
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ENGINE B: Commercial Product Ad & Hardware Showcase Studio */}
      <Composition
        id="ProductAd"
        component={AdTemplate}
        durationInFrames={600} // 20 seconds @ 30fps
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Default Mobile Viral Vertical Reel */}
      <Composition
        id="Main"
        component={MainVideo}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Landscape Option (1920x1080 @ 30fps) */}
      <Composition
        id="Landscape"
        component={MainVideo}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
