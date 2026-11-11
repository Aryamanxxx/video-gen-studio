import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { EpisodeManifest, ZombieEpisode1Manifest } from './episode-manifest';
import { Stage2D } from './Stage2D';
import { RiggedCharacter } from './characters/RiggedCharacter';
import { BarricadePlanks, BloodSplatter, SpeechBubble } from './props/PropsLibrary';

export const EpisodePlayer: React.FC<{
  manifest?: EpisodeManifest;
}> = ({ manifest = ZombieEpisode1Manifest }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find active scene or default to first
  const activeSceneIndex = manifest.scenes.findIndex(
    (scene) =>
      frame >= scene.startFrame &&
      frame < scene.startFrame + scene.durationInFrames
  );
  const safeSceneIndex = activeSceneIndex >= 0 ? activeSceneIndex : 0;
  const currentScene = manifest.scenes[safeSceneIndex];

  // Camera parameters with smoothing
  const sceneProgress = Math.min(
    1,
    Math.max(0, (frame - currentScene.startFrame) / Math.max(1, currentScene.durationInFrames))
  );

  const targetZoom = currentScene.camera?.zoom ?? 1;
  const targetPanX = currentScene.camera?.panX ?? 0;
  const targetPanY = currentScene.camera?.panY ?? 0;
  const screenShake = currentScene.camera?.shake ?? 0;

  return (
    <AbsoluteFill style={{ background: '#090d16', overflow: 'hidden' }}>
      {/* 2D MULTI-PLANE STAGE */}
      <Stage2D
        cameraZoom={targetZoom}
        cameraPanX={targetPanX}
        cameraPanY={targetPanY}
        screenShake={screenShake}
        atmosphere={currentScene.atmosphere}
        midground={
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1080 1920"
            style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
          >
            {/* SCENE PROPS */}
            {currentScene.props?.map((prop, idx) => {
              if (prop.type === 'barricade') {
                return (
                  <g key={`prop-${idx}`} transform={`translate(${prop.x}, ${prop.y}) scale(${prop.scale || 1})`}>
                    <BarricadePlanks />
                  </g>
                );
              }
              if (prop.type === 'blood') {
                return (
                  <BloodSplatter
                    key={`prop-${idx}`}
                    x={prop.x}
                    y={prop.y}
                    scale={prop.scale || 1}
                    rotation={prop.rotation || 0}
                  />
                );
              }
              return null;
            })}

            {/* CHARACTERS PLACEMENT */}
            {currentScene.characters.map((placement, idx) => {
              const charConfig = manifest.characters[placement.characterId];
              if (!charConfig) return null;

              // Linear interpolation between start and end coordinates if end is provided
              const posX =
                placement.endX !== undefined
                  ? interpolate(sceneProgress, [0, 1], [placement.startX, placement.endX])
                  : placement.startX;
              const posY =
                placement.endY !== undefined
                  ? interpolate(sceneProgress, [0, 1], [placement.startY, placement.endY])
                  : placement.startY;

              return (
                <RiggedCharacter
                  key={`char-${placement.characterId}-${idx}`}
                  x={posX}
                  y={posY}
                  scale={placement.scale || 2.2}
                  direction={placement.direction || 'right'}
                  action={placement.action}
                  expression={placement.expression}
                  style={charConfig.style}
                  heldProp={placement.heldProp}
                  isSpeaking={placement.isSpeaking}
                />
              );
            })}
          </svg>
        }
      />

      {/* DIALOGUE BUBBLES LAYER */}
      {currentScene.dialogue?.map((bubble, idx) => {
        const isBubbleActive =
          frame >= bubble.startFrame &&
          frame < bubble.startFrame + bubble.durationFrames;

        if (!isBubbleActive) return null;

        return (
          <SpeechBubble
            key={`dialogue-${idx}`}
            text={bubble.text}
            speakerName={bubble.speakerName}
            speakerColor={bubble.speakerColor}
            x={bubble.x}
            y={bubble.y}
            startFrame={bubble.startFrame}
            width={340}
          />
        );
      })}

      {/* SERIES HUD / EPISODE WATERMARK */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 100,
        }}
      >
        <div
          style={{
            background: '#dc2626',
            color: '#fff',
            fontWeight: 900,
            fontSize: 16,
            padding: '4px 10px',
            borderRadius: 6,
            letterSpacing: 2,
            boxShadow: '0 0 16px rgba(220, 38, 38, 0.6)',
          }}
        >
          EPISODE 01
        </div>
        <div
          style={{
            color: '#94a3b8',
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: 1.5,
          }}
        >
          {manifest.title}
        </div>
      </div>

      {/* REC BADGE / TIME CODE */}
      <div
        style={{
          position: 'absolute',
          top: 52,
          right: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#ef4444',
            opacity: Math.sin(frame * 0.2) > 0 ? 1 : 0.2,
            boxShadow: '0 0 10px #ef4444',
          }}
        />
        <div style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: 13, fontWeight: 800 }}>
          LIVE FEED
        </div>
      </div>

      {/* CINEMATIC BARS (Letterbox feel) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 24,
          background: '#000000',
          zIndex: 120,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 24,
          background: '#000000',
          zIndex: 120,
        }}
      />
    </AbsoluteFill>
  );
};
