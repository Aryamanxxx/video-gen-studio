import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Mobile Vertical Default (1080x1920 @ 30fps for Instagram Reels / TikTok / YouTube Shorts) */}
      <Composition
        id="Main"
        component={MainVideo}
        durationInFrames={600} // 20 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Landscape 16:9 Composition Option (1920x1080 @ 30fps) */}
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
