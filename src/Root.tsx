import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={MainVideo}
        durationInFrames={600} // 10 seconds at 60fps
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
