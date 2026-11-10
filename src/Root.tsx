import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={MainVideo}
        durationInFrames={360} // 6 seconds at 60fps
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Autonomous Video Production Studio",
          subtitle: "Zero-Local-Compute • Cloud Matrix Rendered @ 60 FPS",
          accentColor: "#6366f1",
        }}
      />
    </>
  );
};
